import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { withRole } from "../hoc/withRole";

function AdminPanel() {
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
        <h1>🔐 Admin Panel</h1>
        <p style={{ fontSize: "18px", color: "#555" }}>
          Welcome to the admin panel, <strong>{user?.name}</strong>!
        </p>

        <div
          style={{
            backgroundColor: "#d4edda",
            padding: "20px",
            borderRadius: "5px",
            marginTop: "20px",
            border: "1px solid #c3e6cb",
          }}
        >
          <h3>✅ Access Granted</h3>
          <p>
            You have <strong>ADMIN</strong> privileges and can access this page.
          </p>
        </div>

        <div
          style={{
            marginTop: "30px",
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "5px",
          }}
        >
          <h3>Admin Actions:</h3>
          <ul style={{ lineHeight: "2" }}>
            <li>👥 Manage Users</li>
            <li>⚙️ System Settings</li>
            <li>📊 View Analytics</li>
            <li>🛡️ Security Controls</li>
            <li>📝 Audit Logs</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            backgroundColor: "#cfe2ff",
            borderLeft: "4px solid #0d6efd",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0 }}>
            ℹ️ <strong>HOC Protection:</strong> This page is protected by{" "}
            <code>withRole(AdminPanel, ['admin'])</code>. Only users with the{" "}
            <strong>admin</strong> role can access this page. Regular users will
            see an "Access Denied" message.
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

// Export the component wrapped with withRole HOC - only admins can access
const AdminPanelWithRole = withRole(AdminPanel, ["admin"]);
export default AdminPanelWithRole;
