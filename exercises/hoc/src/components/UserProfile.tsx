import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function UserProfile() {
  const { user } = useAuth();

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
          <div style={{ marginTop: "15px" }}>
            <p style={{ marginBottom: "10px" }}>
              <strong>Name:</strong> {user?.name}
            </p>
            <p style={{ marginBottom: "10px" }}>
              <strong>Username:</strong> {user?.username}
            </p>
            <p style={{ marginBottom: "10px" }}>
              <strong>Email:</strong> {user?.email}
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
