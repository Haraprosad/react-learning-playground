import { useState } from "react";
import { useDebounce, useLocalStorage, useApi, useAuth } from "../custom-hooks";
import type { User } from "../types";

/**
 * Custom Hooks Demo
 * Demonstrates usage of custom hooks
 */
export function CustomHooksDemo() {
  // useDebounce Demo
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  // useLocalStorage Demo
  const [name, setName] = useLocalStorage<string>("userName", "");
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(
    "darkMode",
    false
  );

  // useApi Demo
  const {
    data: users,
    isLoading: loading,
    error,
  } = useApi<User[]>("http://localhost:3001/users");

  // useAuth Demo
  const { user, login, logout, isLoggedIn: isAuthenticated } = useAuth();
  const [loginEmail, setLoginEmail] = useState("john.doe@example.com");

  return (
    <section className="demo-section">
      <h2>8. Custom Hooks - Reusable Logic</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What are Custom Hooks?</strong> Your own hooks that package
          reusable logic. Just functions starting with "use".
        </p>
        <p>
          <strong>✅ Benefits:</strong> DRY code (Don't Repeat Yourself), better
          organization, easier testing.
        </p>
        <p>
          <strong>💡 Use when:</strong> Logic is reused across components OR
          complex logic needs cleaner abstraction.
        </p>
      </div>

      {/* useDebounce Demo */}
      <div className="custom-hook-example">
        <h3>1. useDebounce - Delay Updates</h3>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Delays expensive operations (like API calls) until user stops typing.
          Try typing quickly!
        </p>
        <input
          type="text"
          placeholder="Type to search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "10px", width: "100%" }}
        />
        <p>
          <strong>Immediate value:</strong> {searchQuery}
        </p>
        <p>
          <strong>Debounced value (500ms delay):</strong> {debouncedQuery}
        </p>
        <small style={{ color: "#666" }}>
          💡 The debounced value only updates 500ms after you stop typing. This
          saves API calls!
        </small>
      </div>

      {/* useLocalStorage Demo */}
      <div className="custom-hook-example">
        <h3>2. useLocalStorage - Persist State</h3>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Automatically syncs state with localStorage. Try refreshing the page!
        </p>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <p>
          Stored name: <strong>{name || "(empty)"}</strong>
        </p>
        <label>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={(e) => setIsDarkMode(e.target.checked)}
          />
          Dark Mode
        </label>
        <p style={{ fontSize: "12px", color: "#666" }}>
          Open DevTools → Application → Local Storage to see the stored values
        </p>
      </div>

      {/* useApi Demo */}
      <div className="custom-hook-example">
        <h3>3. useApi - Fetch Data</h3>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Handles loading, error, and data states for API calls. Start
          json-server to see data!
        </p>
        {loading && <p>Loading users...</p>}
        {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
        {users && (
          <div>
            <p>Found {users.length} users:</p>
            <ul style={{ maxHeight: "150px", overflowY: "auto" }}>
              {users.slice(0, 5).map((user) => (
                <li key={user.id}>
                  {user.name} ({user.email})
                </li>
              ))}
              {users.length > 5 && <li>... and {users.length - 5} more</li>}
            </ul>
          </div>
        )}
        <p style={{ fontSize: "12px", color: "#666" }}>
          💡 Run: <code>npm run json-server</code> to start the mock API
        </p>
      </div>

      {/* useAuth Demo */}
      <div className="custom-hook-example">
        <h3>4. useAuth - Authentication State</h3>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Manages user authentication with localStorage persistence.
        </p>
        {!isAuthenticated ? (
          <div>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
            <button
              onClick={() =>
                login({ id: "1", email: loginEmail, name: "Demo User" })
              }
              className="btn-primary"
            >
              Login
            </button>
          </div>
        ) : (
          <div>
            <p>
              Welcome, <strong>{user?.name}</strong> ({user?.email})
            </p>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="code-explanation">
        <p>
          📝 <strong>How Custom Hooks Work:</strong>
        </p>
        <ul>
          <li>
            1️⃣ Just functions that start with "use" and can call other hooks
          </li>
          <li>
            2️⃣ <code>useDebounce</code> → Uses useState + useEffect to delay
            updates
          </li>
          <li>
            3️⃣ <code>useLocalStorage</code> → Syncs state with localStorage
            automatically
          </li>
          <li>
            4️⃣ <code>useApi</code> → Abstracts fetch logic (loading, error, data
            states)
          </li>
          <li>
            5️⃣ <code>useAuth</code> → Manages login/logout with persistent
            storage
          </li>
          <li>
            💡 Extract repeated logic into custom hooks for cleaner, DRY-er
            code!
          </li>
        </ul>
      </div>
    </section>
  );
}
