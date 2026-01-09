// Reusable Loading component
export const Loading = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "20px",
      }}
    >
      <div
        style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #007bff",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
        }}
      />
      <h2 style={{ fontSize: "1.2rem", color: "#555" }}>{message}</h2>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Error component
export const ErrorMessage = ({
  title = "Error",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "20px",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#dc3545", fontSize: "2rem" }}>⚠️ {title}</h1>
      <p style={{ fontSize: "1.1rem", color: "#555", textAlign: "center" }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
          aria-label="Retry operation"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// Access Denied component
export const AccessDenied = ({
  requiredRoles,
  userRole,
}: {
  requiredRoles: string[];
  userRole: string;
}) => {
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "20px",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "2.5rem" }}>🚫</h1>
      <h2 style={{ color: "#dc3545", fontSize: "1.8rem" }}>Access Denied</h2>
      <p style={{ fontSize: "1.1rem", color: "#555", textAlign: "center" }}>
        You don't have permission to access this page.
      </p>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p>
          <strong>Required role:</strong> {requiredRoles.join(" or ")}
        </p>
        <p>
          <strong>Your role:</strong> {userRole}
        </p>
      </div>
      <button
        onClick={() => window.history.back()}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
        aria-label="Go back to previous page"
      >
        Go Back
      </button>
    </div>
  );
};
