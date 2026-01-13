import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { withRole } from "../hoc/withRole";
import { UserManagement } from "./UserManagement";

function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");

  const isSuperadmin = user?.role === "superadmin";

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1>🔐 {isSuperadmin ? "Superadmin" : "Admin"} Panel</h1>
        <p style={{ fontSize: "18px", color: "#555" }}>
          Welcome back, <strong>{user?.name}</strong>!
        </p>

        <div
          style={{
            padding: "4px",
            borderRadius: "8px",
            display: "inline-block",
            fontSize: "13px",
            fontWeight: "600",
            backgroundColor: isSuperadmin ? "#dc354520" : "#0d6efd20",
            color: isSuperadmin ? "#dc3545" : "#0d6efd",
            marginBottom: "20px",
          }}
        >
          <span style={{ padding: "6px 12px", display: "inline-block" }}>
            {isSuperadmin ? "🔴 SUPERADMIN" : "🔵 ADMIN"}
          </span>
        </div>

        {/* Tab Navigation - Only for Superadmin */}
        {isSuperadmin && (
          <div
            style={{ marginBottom: "30px", borderBottom: "2px solid #dee2e6" }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setActiveTab("overview")}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  color: activeTab === "overview" ? "#0d6efd" : "#6c757d",
                  border: "none",
                  borderBottom:
                    activeTab === "overview"
                      ? "3px solid #0d6efd"
                      : "3px solid transparent",
                  cursor: "pointer",
                  fontWeight: activeTab === "overview" ? "600" : "500",
                  fontSize: "15px",
                  transition: "all 0.2s",
                }}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab("users")}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  color: activeTab === "users" ? "#0d6efd" : "#6c757d",
                  border: "none",
                  borderBottom:
                    activeTab === "users"
                      ? "3px solid #0d6efd"
                      : "3px solid transparent",
                  cursor: "pointer",
                  fontWeight: activeTab === "users" ? "600" : "500",
                  fontSize: "15px",
                  transition: "all 0.2s",
                }}
              >
                👥 User Management
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === "overview" ? (
          <>
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
                You have{" "}
                <strong>{isSuperadmin ? "SUPERADMIN" : "ADMIN"}</strong>{" "}
                privileges and can access this page.
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
              <h3>{isSuperadmin ? "Superadmin Actions:" : "Admin Actions:"}</h3>
              <ul style={{ lineHeight: "2" }}>
                {isSuperadmin ? (
                  <>
                    <li>👥 Create & Manage All Users</li>
                    <li>🔄 Update User Roles (Admin/User)</li>
                    <li>🗑️ Delete User Accounts</li>
                    <li>⚙️ System-wide Settings</li>
                    <li>📊 Full System Analytics</li>
                    <li>🛡️ Advanced Security Controls</li>
                    <li>📝 Complete Audit Logs</li>
                  </>
                ) : (
                  <>
                    <li>👥 View Users</li>
                    <li>⚙️ Manage Settings</li>
                    <li>📊 View Analytics</li>
                    <li>🛡️ Security Controls</li>
                    <li>📝 Audit Logs</li>
                  </>
                )}
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
                <code>withRole(AdminPanel, ['admin', 'superadmin'])</code>. Only
                users with the <strong>admin</strong> or{" "}
                <strong>superadmin</strong> role can access this page.
              </p>
            </div>
          </>
        ) : (
          // User Management Tab (Superadmin only)
          <UserManagement />
        )}

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

// Export the component wrapped with withRole HOC - admins and superadmins can access
const AdminPanelWithRole = withRole(AdminPanel, ["admin", "superadmin"]);
export default AdminPanelWithRole;
