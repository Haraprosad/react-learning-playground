import { useState } from "react";
import { ComponentThatFails } from "../components/ComponentThatFails";
import ErrorBoundary from "../components/ErrorBoundary";

/**
 * Error Boundary Demo
 * Demonstrates error handling with Error Boundaries
 */
export function ErrorBoundaryDemo() {
  const [shouldError, setShouldError] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setShouldError(false);
    setResetKey((k) => k + 1); // Force remount ErrorBoundary
  };

  return (
    <section className="demo-section">
      <h2>9. Error Boundaries - Catch React Errors</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Catching errors in
          child components without crashing the whole app.
        </p>
        <p>
          <strong>✅ With Error Boundary:</strong> Child crashes → Error UI
          shows → Rest of app works fine! ✅
        </p>
        <p>
          <strong>❌ Without Error Boundary:</strong> Child crashes → Entire app
          shows blank screen → User sees nothing! 💥
        </p>
        <p>
          <strong>💡 Use when:</strong> Want to isolate failures (like a widget
          crashing shouldn't break the whole page).
          <br />
          <strong>🚫 Don't use for:</strong> Event handlers, async code, SSR
          errors (those need try/catch).
        </p>
      </div>
      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={() => setShouldError(!shouldError)}
          className="btn-primary"
        >
          {shouldError ? "Disable" : "Trigger"} Error
        </button>
        <button onClick={handleReset} className="btn-secondary">
          Reset Everything
        </button>
      </div>
      <ErrorBoundary key={resetKey}>
        <ComponentThatFails shouldFail={shouldError} />
      </ErrorBoundary>
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣ Click "Trigger Error" → Child component throws error during
            render
          </li>
          <li>
            2️⃣ Error Boundary catches error with{" "}
            <code>componentDidCatch()</code>
          </li>
          <li>3️⃣ Shows fallback UI → Rest of app continues working 🎉</li>
          <li>
            4️⃣ Click "Reset" → Remounts ErrorBoundary → Child gets fresh start
          </li>
          <li>
            💡 Error Boundaries must be class components (no hook equivalent...
            yet!)
          </li>
          <li>⚠️ Only catches errors in child components during render</li>
        </ul>
      </div>
    </section>
  );
}
