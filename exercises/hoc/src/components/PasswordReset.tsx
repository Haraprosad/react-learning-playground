import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  auth,
  firebaseVerifyPasswordResetCode,
  firebaseConfirmPasswordReset,
} from "../config/firebase";

interface ResetPasswordState {
  code: string | null;
  email: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  success: string;
  codeVerified: boolean;
}

const PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState<ResetPasswordState>({
    code: null,
    email: "",
    newPassword: "",
    confirmPassword: "",
    loading: true,
    error: "",
    success: "",
    codeVerified: false,
  });

  useEffect(() => {
    // Extract oobCode from URL (Firebase sends this parameter)
    const oobCode = searchParams.get("oobCode");

    if (!oobCode) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Invalid reset link. Please request a new password reset.",
      }));
      return;
    }

    // Verify the reset code
    verifyResetCode(oobCode);
  }, [searchParams]);

  const verifyResetCode = async (code: string) => {
    try {
      // Use Firebase to verify the reset code
      const email = await firebaseVerifyPasswordResetCode(auth, code);

      setState((prev) => ({
        ...prev,
        code,
        email,
        loading: false,
        codeVerified: true,
      }));
    } catch (error: unknown) {
      console.error("Verification error:", error);
      let errorMessage = "Invalid or expired reset code";

      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          errorMessage = "Reset link has expired. Please request a new one.";
        } else if (error.message.includes("invalid")) {
          errorMessage = "Invalid reset link. Please request a new one.";
        }
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (state.newPassword.length < 6) {
      setState((prev) => ({
        ...prev,
        error: "Password must be at least 6 characters long",
      }));
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      setState((prev) => ({
        ...prev,
        error: "Passwords do not match",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    try {
      // Use Firebase to confirm password reset
      if (!state.code) {
        throw new Error("Reset code is missing");
      }

      await firebaseConfirmPasswordReset(auth, state.code, state.newPassword);

      setState((prev) => ({
        ...prev,
        loading: false,
        success: "Password successfully reset! Redirecting to login...",
      }));

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to reset password. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("weak-password")) {
          errorMessage =
            "Password is too weak. Please use a stronger password.";
        } else if (error.message.includes("expired")) {
          errorMessage = "Reset link has expired. Please request a new one.";
        }
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  if (state.loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid #1976d2",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p style={{ marginTop: "20px", color: "#666" }}>
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  if (!state.codeVerified) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "15px",
              }}
            >
              Invalid Reset Link
            </h2>
            <p style={{ color: "#666", marginBottom: "25px" }}>{state.error}</p>
            <button
              onClick={() => navigate("/forgot-password")}
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                padding: "10px 24px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1565c0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#1976d2")
              }
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "28px",
          }}
        >
          Reset Password
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
            fontSize: "14px",
          }}
        >
          Enter a new password for:{" "}
          <span style={{ fontWeight: "600", color: "#333" }}>
            {state.email}
          </span>
        </p>

        {state.error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "20px",
              textAlign: "center",
              border: "1px solid #ffcdd2",
            }}
          >
            {state.error}
          </div>
        )}

        {state.success && (
          <div
            style={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "20px",
              textAlign: "center",
              border: "1px solid #c8e6c9",
            }}
          >
            {state.success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="newPassword"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={state.newPassword}
              onChange={(e) =>
                setState((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              disabled={state.loading}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter new password"
              required
              minLength={6}
            />
            <p style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
              Must be at least 6 characters
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={state.confirmPassword}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              disabled={state.loading}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Confirm new password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={state.loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: state.loading ? "#ccc" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: state.loading ? "not-allowed" : "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!state.loading) {
                e.currentTarget.style.backgroundColor = "#1565c0";
              }
            }}
            onMouseLeave={(e) => {
              if (!state.loading) {
                e.currentTarget.style.backgroundColor = "#1976d2";
              }
            }}
          >
            {state.loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "#1976d2",
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
