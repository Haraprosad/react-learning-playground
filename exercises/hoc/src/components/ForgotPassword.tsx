import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ForgotPasswordState {
  email: string;
  loading: boolean;
  error: string;
  success: boolean;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [state, setState] = useState<ForgotPasswordState>({
    email: "",
    loading: false,
    error: "",
    success: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setState((prev) => ({ ...prev, loading: true, error: "", success: false }));

    try {
      await resetPassword(state.email);
      setState((prev) => ({
        ...prev,
        loading: false,
        success: true,
      }));
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to send reset email. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("user-not-found")) {
          errorMessage = "No account found with this email address.";
        } else if (error.message.includes("invalid-email")) {
          errorMessage = "Invalid email address.";
        } else if (error.message.includes("too-many-requests")) {
          errorMessage = "Too many requests. Please try again later.";
        }
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  if (state.success) {
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
            <div
              style={{
                color: "#28a745",
                fontSize: "48px",
                marginBottom: "20px",
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "15px",
              }}
            >
              Check Your Email
            </h2>
            <p style={{ color: "#666", marginBottom: "25px" }}>
              We've sent a password reset link to{" "}
              <span style={{ fontWeight: "600", color: "#333" }}>
                {state.email}
              </span>
            </p>
            <p
              style={{ fontSize: "14px", color: "#999", marginBottom: "30px" }}
            >
              Click the link in the email to reset your password. The link will
              expire in 1 hour.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                onClick={() => navigate("/login")}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1565c0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1976d2")
                }
              >
                Back to Login
              </button>
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, success: false, email: "" }))
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "white",
                  color: "#666",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                Send Another Email
              </button>
            </div>
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
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
          Forgot Password?
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
            fontSize: "14px",
          }}
        >
          No worries! Enter your email and we'll send you a reset link.
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
            }}
          >
            {state.error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={state.email}
              onChange={(e) =>
                setState((prev) => ({ ...prev, email: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter your email"
              required
              disabled={state.loading}
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
            {state.loading ? "Sending..." : "Send Reset Link"}
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

        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#999",
              textAlign: "center",
            }}
          >
            💡 Tip: Check your spam folder if you don't see the email within a
            few minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
