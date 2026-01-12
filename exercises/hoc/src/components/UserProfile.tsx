import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";

function UserProfile() {
  const { user, updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);

    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      console.error("Password change error:", error);
      if (error instanceof Error) {
        if (
          error.message.includes("wrong-password") ||
          error.message.includes("invalid-credential")
        ) {
          setPasswordError("Current password is incorrect");
        } else if (error.message.includes("weak-password")) {
          setPasswordError("New password is too weak");
        } else if (error.message.includes("requires-recent-login")) {
          setPasswordError(
            "Please log out and log in again before changing password"
          );
        } else {
          setPasswordError(error.message || "Failed to update password");
        }
      } else {
        setPasswordError("Failed to update password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1>👤 User Profile</h1>

        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <h3>Profile Details</h3>
          {user?.photo_url && (
            <div style={{ marginTop: "15px", marginBottom: "20px" }}>
              <img
                src={user.photo_url}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: "3px solid #007bff",
                }}
              />
            </div>
          )}
          <div style={{ marginTop: "15px" }}>
            <p style={{ marginBottom: "10px" }}>
              <strong>Name:</strong> {user?.name || "N/A"}
            </p>
            <p style={{ marginBottom: "10px" }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ marginBottom: "10px" }}>
              <strong>Firebase UID:</strong> {user?.uid}
            </p>
            <p style={{ marginBottom: "10px" }}>
              <strong>Role:</strong>{" "}
              <span
                style={{
                  padding: "4px 12px",
                  backgroundColor:
                    user?.role === "admin" ? "#6f42c1" : "#17a2b8",
                  color: "white",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {user?.role}
              </span>
            </p>
          </div>
        </div>

        {/* Change Password Section */}
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <h3>🔒 Change Password</h3>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Update your password to keep your account secure
          </p>

          {passwordError && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
              }}
            >
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div
              style={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
              }}
            >
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="currentPassword"
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isChangingPassword}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Enter current password"
              />
            </div>

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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isChangingPassword}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isChangingPassword}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              style={{
                padding: "10px 20px",
                backgroundColor: isChangingPassword ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor: isChangingPassword ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            backgroundColor: "#e7f3ff",
            borderLeft: "4px solid #2196F3",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0 }}>
            ℹ️ <strong>HOC Protection:</strong> This page is protected by{" "}
            <code>withAuth</code>. Both admin and regular users can access this
            page as long as they are authenticated.
          </p>
        </div>

        <div style={{ marginTop: "30px" }}>
          <Link
            to="/dashboard"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// Export the component wrapped with withAuth HOC - any authenticated user can access
import { withAuth } from "../hoc/withAuth";
const UserProfileWithAuth = withAuth(UserProfile);
export default UserProfileWithAuth;
