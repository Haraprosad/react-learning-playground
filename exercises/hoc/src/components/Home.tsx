import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>🎯 HOC Demo</h1>
        <h2 style={{ color: "#555", marginBottom: "30px" }}>
          Role-Based Authentication & Protected Routes
        </h2>

        <p style={{ fontSize: "18px", marginBottom: "40px", color: "#666" }}>
          This application demonstrates Higher Order Components (HOCs) for
          authentication and role-based access control.
        </p>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "30px",
            borderRadius: "8px",
            marginBottom: "30px",
            textAlign: "left",
          }}
        >
          <h3>🎓 What You'll Learn:</h3>
          <ul style={{ lineHeight: "2", fontSize: "16px" }}>
            <li>
              <strong>withAuth HOC:</strong> Protects routes that require
              authentication
            </li>
            <li>
              <strong>withRole HOC:</strong> Protects routes based on user role
              (admin, user)
            </li>
            <li>
              <strong>AuthContext:</strong> Manages authentication state across
              the app
            </li>
            <li>
              <strong>Protected Routes:</strong> Automatic redirects for
              unauthorized access
            </li>
          </ul>
        </div>

        <div
          style={{
            backgroundColor: "#e3f2fd",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
            textAlign: "left",
          }}
        >
          <h3>👥 Test Accounts:</h3>
          <div style={{ marginTop: "15px" }}>
            <p>
              <strong>Admin Account:</strong>
            </p>
            <p>
              Username: <code>admin</code> | Password: <code>admin123</code>
            </p>
            <p style={{ fontSize: "14px", color: "#555" }}>
              ✅ Can access: Dashboard, Profile, Admin Panel
            </p>
          </div>
          <div style={{ marginTop: "15px" }}>
            <p>
              <strong>Regular User Account:</strong>
            </p>
            <p>
              Username: <code>user</code> | Password: <code>user123</code>
            </p>
            <p style={{ fontSize: "14px", color: "#555" }}>
              ✅ Can access: Dashboard, Profile
              <br />❌ Cannot access: Admin Panel
            </p>
          </div>
        </div>

        <Link
          to="/login"
          style={{
            display: "inline-block",
            padding: "15px 40px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontSize: "20px",
            fontWeight: "bold",
            marginTop: "20px",
          }}
        >
          Get Started →
        </Link>
      </div>
    </div>
  );
}
