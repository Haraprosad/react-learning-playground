import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

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
        <h1>🏠 Dashboard</h1>
        <p style={{ fontSize: "18px", color: "#555" }}>
          Welcome, <strong>{user?.name}</strong>!
        </p>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "5px",
            marginTop: "20px",
          }}
        >
          <h3>Your Profile Information:</h3>
          <p>
            <strong>Role:</strong> {user?.role}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Username:</strong> {user?.username}
          </p>
        </div>

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/profile"
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            👤 My Profile
          </Link>

          <Link
            to="/admin"
            style={{
              padding: "10px 20px",
              backgroundColor: "#6f42c1",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            🔐 Admin Panel (Admin Only)
          </Link>

          <button
            onClick={logout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🚪 Logout
          </button>
        </div>

        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            backgroundColor: "#fff3cd",
            borderLeft: "4px solid #ffc107",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0 }}>
            ℹ️ <strong>Note:</strong> This dashboard is protected by the{" "}
            <code>withAuth</code> HOC. Only authenticated users can access this
            page.
          </p>
        </div>
      </div>
    </div>
  );
}

// Export the component wrapped with withAuth HOC
import { withAuth } from "../hoc/withAuth";
const DashboardWithAuth = withAuth(Dashboard);
export default DashboardWithAuth;
