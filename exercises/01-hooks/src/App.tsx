/**
 * React Hooks Playground - Main Application
 *
 * A comprehensive demonstration of React Hooks and patterns with TypeScript.
 * This file showcases 7 interactive demos covering:
 *
 * 1. useState - Simple state management (Counter)
 * 2. useReducer - Complex state management (Settings Panel)
 * 3. useEffect - Side effects and lifecycle (Timer/Stopwatch)
 * 4. useMemo - Performance optimization (List Filter)
 * 5. useCallback - Function memoization (Parent-Child Demo)
 * 6. Custom Hooks - Reusable logic (useDebounce, useLocalStorage, useApi, useAuth)
 * 7. Error Boundaries - Error handling (Graceful error recovery)
 *
 * Each demo includes:
 * - Clear explanation of what, why, when to use
 * - Working code example
 * - Visual feedback and interaction
 * - Console logs for debugging
 *
 * @requires json-server running on port 3001 for API demos
 * @see README.md for setup instructions
 */

import {
  useState,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import "./App.css";
import { useDebounce, useLocalStorage, useApi, useAuth } from "./custom-hooks";
import type { User } from "./types";
import { UserCard } from "./components/UserCard";
import ErrorBoundary from "./components/ErrorBoundary";
import { ComponentThatFails } from "./components/ComponentThatFails";
import { getApiUrl, API_CONFIG } from "./config/api";

/**
 * ========================================
 * 1. COUNTER COMPONENT (useState)
 * ========================================
 * Demonstrates basic state management with useState
 */
function Counter() {
  const [count, setCount] = useState(0);
  const [lastAction, setLastAction] = useState<string>("");

  const handleIncrement = () => {
    setCount(count + 1);
    setLastAction("Incremented by 1");
  };

  const handleDecrement = () => {
    setCount(count - 1);
    setLastAction("Decremented by 1");
  };

  const handleReset = () => {
    setCount(0);
    setLastAction("Reset to 0");
  };

  return (
    <section className="demo-section">
      <h2>1. useState - Counter</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> This counter remembers
          the number even when you click buttons. That's state!
        </p>
        <p>
          <strong>✅ With useState:</strong> Click +/- and the number updates &
          stays. React re-renders automatically.
        </p>
        <p>
          <strong>❌ Without useState:</strong> Variables reset on every click.
          You'd see 0 forever!
        </p>
        <p>
          <strong>💡 Use when:</strong> You need data that changes (counts,
          toggles, form inputs).
          <br />
          <strong>🚫 Don't use when:</strong> Data never changes (use regular
          variables).
        </p>
      </div>
      <div className="counter">
        <button onClick={handleDecrement} className="btn-primary">
          -
        </button>
        <span className="count-display">{count}</span>
        <button onClick={handleIncrement} className="btn-primary">
          +
        </button>
        <button onClick={handleReset} className="btn-secondary">
          Reset
        </button>
      </div>
      {lastAction && (
        <div className="action-feedback">✓ Action: {lastAction}</div>
      )}
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣ <code>const [count, setCount] = useState(0)</code> → Creates
            state starting at 0
          </li>
          <li>
            2️⃣ Click + → Calls <code>setCount(count + 1)</code> → Updates count
          </li>
          <li>
            3️⃣ React sees state changed → Re-renders component → Shows new
            number
          </li>
          <li>
            4️⃣ State persists between renders (doesn't reset like normal
            variables)
          </li>
        </ul>
      </div>
    </section>
  );
}

/**
 * ========================================
 * 2. SETTINGS PANEL (useReducer)
 * ========================================
 * Demonstrates complex state management with useReducer
 * Managing multiple related state values with actions
 */

interface SettingsState {
  theme: "light" | "dark";
  fontSize: "small" | "medium" | "large";
  fontFamily: "sans-serif" | "serif" | "monospace";
}

type SettingsAction =
  | { type: "CHANGE_THEME"; payload: "light" | "dark" }
  | { type: "CHANGE_FONT_SIZE"; payload: "small" | "medium" | "large" }
  | {
      type: "CHANGE_FONT_FAMILY";
      payload: "sans-serif" | "serif" | "monospace";
    }
  | { type: "RESET" };

const initialSettings: SettingsState = {
  theme: "light",
  fontSize: "medium",
  fontFamily: "sans-serif",
};

function settingsReducer(
  state: SettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case "CHANGE_THEME":
      return { ...state, theme: action.payload };
    case "CHANGE_FONT_SIZE":
      return { ...state, fontSize: action.payload };
    case "CHANGE_FONT_FAMILY":
      return { ...state, fontFamily: action.payload };
    case "RESET":
      return initialSettings;
    default:
      return state;
  }
}

function SettingsPanel() {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);
  const [lastAction, setLastAction] = useState<string>("");

  const handleDispatch = (action: SettingsAction, actionName: string) => {
    dispatch(action);
    setLastAction(actionName);
    setTimeout(() => setLastAction(""), 2000);
  };

  const previewStyle = {
    padding: "20px",
    marginTop: "15px",
    backgroundColor: settings.theme === "dark" ? "#333" : "#fff",
    color: settings.theme === "dark" ? "#fff" : "#333",
    fontSize:
      settings.fontSize === "small"
        ? "12px"
        : settings.fontSize === "large"
        ? "18px"
        : "14px",
    fontFamily: settings.fontFamily,
    border: "1px solid #ddd",
    borderRadius: "4px",
  };

  return (
    <section className="demo-section">
      <h2>2. useReducer - Settings Panel</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Managing 3 related
          settings (theme, fontSize, fontFamily) together.
        </p>
        <p>
          <strong>✅ With useReducer:</strong> One reducer handles all settings.
          Changes are organized by action types.
        </p>
        <p>
          <strong>❌ Without useReducer:</strong> You'd need 3 separate useState
          calls. Messy when settings are related!
        </p>
        <p>
          <strong>💡 Use when:</strong> Multiple related states OR complex
          update logic.
          <br />
          <strong>🚫 Don't use when:</strong> Simple state (just use useState -
          it's easier!).
        </p>
      </div>
      <div className="settings-controls">
        <div>
          <label>Theme: </label>
          <button
            onClick={() =>
              handleDispatch(
                { type: "CHANGE_THEME", payload: "light" },
                "Changed theme to Light"
              )
            }
            className={settings.theme === "light" ? "btn-active" : ""}
          >
            Light
          </button>
          <button
            onClick={() =>
              handleDispatch(
                { type: "CHANGE_THEME", payload: "dark" },
                "Changed theme to Dark"
              )
            }
            className={settings.theme === "dark" ? "btn-active" : ""}
          >
            Dark
          </button>
        </div>
        <div>
          <label>Font Size: </label>
          <button
            onClick={() =>
              handleDispatch(
                { type: "CHANGE_FONT_SIZE", payload: "small" },
                "Changed font size to Small"
              )
            }
            className={settings.fontSize === "small" ? "btn-active" : ""}
          >
            Small
          </button>
          <button
            onClick={() =>
              handleDispatch(
                { type: "CHANGE_FONT_SIZE", payload: "medium" },
                "Changed font size to Medium"
              )
            }
            className={settings.fontSize === "medium" ? "btn-active" : ""}
          >
            Medium
          </button>
          <button
            onClick={() =>
              handleDispatch(
                { type: "CHANGE_FONT_SIZE", payload: "large" },
                "Changed font size to Large"
              )
            }
            className={settings.fontSize === "large" ? "btn-active" : ""}
          >
            Large
          </button>
        </div>
        <div>
          <label>Font Family: </label>
          <button
            onClick={() =>
              handleDispatch(
                { type: "CHANGE_FONT_FAMILY", payload: "sans-serif" },
                "Changed font to Sans-serif"
              )
            }
            className={settings.fontFamily === "sans-serif" ? "btn-active" : ""}
          >
            Sans
          </button>
          <button
            onClick={() =>
              handleDispatch(
                { type: "CHANGE_FONT_FAMILY", payload: "serif" },
                "Changed font to Serif"
              )
            }
            className={settings.fontFamily === "serif" ? "btn-active" : ""}
          >
            Serif
          </button>
          <button
            onClick={() =>
              handleDispatch(
                { type: "CHANGE_FONT_FAMILY", payload: "monospace" },
                "Changed font to Monospace"
              )
            }
            className={settings.fontFamily === "monospace" ? "btn-active" : ""}
          >
            Mono
          </button>
        </div>
        <button
          onClick={() =>
            handleDispatch({ type: "RESET" }, "Reset all settings to default")
          }
          className="btn-secondary"
        >
          Reset All
        </button>
      </div>
      {lastAction && (
        <div className="action-feedback">✓ Action: {lastAction}</div>
      )}
      <div style={previewStyle}>
        <strong>Preview:</strong> The quick brown fox jumps over the lazy dog.
        <br />
        <small>
          Current settings: {settings.theme} theme, {settings.fontSize} font,{" "}
          {settings.fontFamily}
        </small>
      </div>
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣{" "}
            <code>
              const [state, dispatch] = useReducer(reducer, initialState)
            </code>
          </li>
          <li>
            2️⃣ Click "Dark" →{" "}
            <code>
              dispatch({"{"}type: 'CHANGE_THEME', payload: 'dark'{"}"})
            </code>
          </li>
          <li>
            3️⃣ Reducer sees action → Updates state →{" "}
            <code>
              {"{"} ...state, theme: 'dark' {"}"}
            </code>
          </li>
          <li>4️⃣ Preview box shows new settings → All in sync!</li>
          <li>💡 Better than 3 useState when changes are related</li>
        </ul>
      </div>
    </section>
  );
}

/**
 * ========================================
 * 3. TIMER/STOPWATCH (useEffect)
 * ========================================
 * Demonstrates useEffect with cleanup function
 * Starts timer on mount, cleans up on unmount
 */
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastAction, setLastAction] = useState<string>("Timer ready");

  useEffect(() => {
    let intervalId: number | undefined;

    if (isRunning) {
      // Start the interval
      intervalId = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    // Cleanup function: clear interval when component unmounts or isRunning changes
    // This prevents memory leaks and unwanted behavior
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
    setLastAction(isRunning ? "Timer paused" : "Timer started");
  };

  const handleReset = () => {
    setSeconds(0);
    setIsRunning(false);
    setLastAction("Timer reset to 00:00");
  };

  return (
    <section className="demo-section">
      <h2>3. useEffect - Timer/Stopwatch</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Timer that counts
          seconds. Runs in background (side effect!).
        </p>
        <p>
          <strong>✅ With useEffect:</strong> Timer starts/stops properly.
          Cleanup prevents memory leaks.
        </p>
        <p>
          <strong>❌ Without useEffect:</strong> Timer would create infinite
          loops or never stop. Chaos!
        </p>
        <p>
          <strong>💡 Use when:</strong> Timers, API calls, subscriptions, DOM
          updates.
          <br />
          <strong>🚫 Don't use when:</strong> Calculating values (use
          variables/useMemo instead).
        </p>
      </div>
      <div className="timer">
        <div className="time-display">{formatTime(seconds)}</div>
        <div className="timer-status">
          Status:{" "}
          <span className={isRunning ? "status-running" : "status-stopped"}>
            {isRunning ? "🟢 Running" : "🔴 Stopped"}
          </span>
        </div>
        <div>
          <button onClick={handleStartPause} className="btn-primary">
            {isRunning ? "⏸ Pause" : "▶ Start"}
          </button>
          <button onClick={handleReset} className="btn-secondary">
            🔄 Reset
          </button>
        </div>
        {lastAction && <div className="action-feedback">✓ {lastAction}</div>}
      </div>
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣ Click Start → <code>setIsRunning(true)</code>
          </li>
          <li>2️⃣ useEffect sees isRunning changed → Runs effect</li>
          <li>
            3️⃣ <code>setInterval()</code> creates timer → Updates seconds every
            1000ms
          </li>
          <li>
            4️⃣ Click Pause → Cleanup runs → <code>clearInterval()</code> stops
            timer
          </li>
          <li>5️⃣ Without cleanup, old timers keep running = memory leak! 💥</li>
        </ul>
      </div>
    </section>
  );
}

/**
 * ========================================
 * 4. LIST FILTER (useMemo)
 * ========================================
 * Demonstrates useMemo for expensive computations
 * Filters a large list without re-filtering on unrelated state changes
 */
function ListFilter() {
  const [filter, setFilter] = useState("");
  const [unrelatedState, setUnrelatedState] = useState(0);

  // Generate a large list of items (10,000 items)
  const largeList = useMemo(() => {
    console.log("🔵 Generating large list (expensive operation)");
    return Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      category: ["Electronics", "Books", "Clothing", "Food"][i % 4],
    }));
  }, []); // Only generate once

  // useMemo prevents re-filtering when unrelatedState changes
  const filteredList = useMemo(() => {
    console.log("🟢 Filtering list (memoized)");
    return largeList.filter(
      (item) =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.toLowerCase())
    );
  }, [largeList, filter]); // Only re-filter when filter changes

  return (
    <section className="demo-section">
      <h2>4. useMemo - List Filter</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Filtering 10,000 items.
          Expensive! Open Console (F12) to watch.
        </p>
        <p>
          <strong>✅ With useMemo:</strong> Type in filter → Filters. Click
          "Unrelated State" → NO filtering! (Check console)
        </p>
        <p>
          <strong>❌ Without useMemo:</strong> Every button click re-filters
          10,000 items. Slow & wasteful!
        </p>
        <p>
          <strong>💡 Use when:</strong> Heavy calculations, filtering large
          lists, complex operations.
          <br />
          <strong>🚫 Don't use when:</strong> Simple/fast calculations (useMemo
          has overhead too!).
        </p>
      </div>
      <div>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Filter items by name or category..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
            style={{ width: "300px" }}
          />
          <button
            onClick={() => setUnrelatedState(unrelatedState + 1)}
            className="btn-secondary"
            style={{ marginLeft: "10px" }}
          >
            Unrelated State: {unrelatedState}
          </button>
        </div>
        <div className="stats-bar">
          <span>
            📊 Showing <strong>{filteredList.length}</strong> of{" "}
            <strong>{largeList.length}</strong> items
          </span>
        </div>
        <div className="list-container">
          {filteredList.slice(0, 50).map((item) => (
            <div key={item.id} className="list-item">
              <span className="item-name">{item.name}</span>
              <span className="item-category">{item.category}</span>
            </div>
          ))}
          {filteredList.length > 50 && (
            <div className="list-item-more">
              ... and {filteredList.length - 50} more items
            </div>
          )}
          {filteredList.length === 0 && (
            <div className="no-results">No items match your filter</div>
          )}
        </div>
      </div>
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣ <code>useMemo(() =&gt; filter10000items, [filter])</code> → Cache
            result
          </li>
          <li>
            2️⃣ Type "Book" → <code>filter</code> changed → Re-filter → "🟢
            Filtering" in console
          </li>
          <li>
            3️⃣ Click "Unrelated State" → <code>filter</code> same → Uses cached
            result → No console log!
          </li>
          <li>
            4️⃣ Without useMemo: Every click = re-filter = Lag on big lists
          </li>
          <li>💡 Only re-calculates when dependencies [filter] change</li>
        </ul>
      </div>
    </section>
  );
}

/**
 * ========================================
 * 5. PARENT/CHILD COMPONENTS (useCallback)
 * ========================================
 * Demonstrates useCallback to prevent unnecessary child re-renders
 * Child component is memoized and only re-renders when its props change
 */

interface ChildProps {
  name: string;
  onButtonClick: () => void;
}

// Memoized child component - only re-renders when props change
const MemoizedChild = memo(({ name, onButtonClick }: ChildProps) => {
  const renderTime = new Date().toLocaleTimeString();
  console.log(`🔴 ${name} rendered at ${renderTime}`);
  return (
    <div className="child-component">
      <p>
        <strong>{name}</strong>
      </p>
      <p style={{ fontSize: "12px", color: "#666" }}>
        Last rendered: {renderTime}
      </p>
      <button onClick={onButtonClick} className="btn-primary">
        Click me
      </button>
    </div>
  );
});

function ParentChildDemo() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);

  // useCallback prevents function from being recreated on every render
  // Without useCallback, child would re-render on every parent render
  const handleClick = useCallback(() => {
    console.log("Button clicked!");
    alert("✓ Button clicked! Check console for render logs.");
  }, []); // Empty deps = function never changes

  return (
    <section className="demo-section">
      <h2>5. useCallback - Parent/Child Components</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Parent has state. Child
          has button. Open Console (F12) to watch renders.
        </p>
        <p>
          <strong>✅ With useCallback:</strong> Click "Increment Count" → Child
          does NOT re-render! (Check console)
        </p>
        <p>
          <strong>❌ Without useCallback:</strong> Parent state changes → New
          function created → Child re-renders (unnecessary!).
        </p>
        <p>
          <strong>💡 Use when:</strong> Passing callbacks to memoized child
          components.
          <br />
          <strong>🚫 Don't use when:</strong> Not using React.memo or no
          performance issue.
        </p>
      </div>
      <div>
        <div className="parent-controls">
          <div>
            <p>
              Parent Count: <strong className="highlight">{count}</strong>
            </p>
            <button onClick={() => setCount(count + 1)} className="btn-primary">
              Increment Count
            </button>
          </div>
          <div>
            <p>
              Other State: <strong className="highlight">{otherState}</strong>
            </p>
            <button
              onClick={() => setOtherState(otherState + 1)}
              className="btn-secondary"
            >
              Change Other State
            </button>
          </div>
        </div>
        <div className="child-container">
          <MemoizedChild
            name="Memoized Child (with useCallback)"
            onButtonClick={handleClick}
          />
        </div>
      </div>
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣{" "}
            <code>
              const handleClick = useCallback(() =&gt; alert('Hi'), [])
            </code>{" "}
            → Cache function
          </li>
          <li>
            2️⃣ Child wrapped in <code>React.memo()</code> → Only re-renders if
            props change
          </li>
          <li>
            3️⃣ Click "Increment" → Parent re-renders → handleClick reference
            SAME (cached)
          </li>
          <li>
            4️⃣ Child sees same props → Skips re-render → "🔴 rendered" NOT in
            console!
          </li>
          <li>
            5️⃣ Without useCallback: New function each time → Child always
            re-renders
          </li>
        </ul>
      </div>
    </section>
  );
}

/**
 * ========================================
 * 6. CUSTOM HOOKS DEMO
 * ========================================
 * Demonstrates all four custom hooks in action
 */
function CustomHooksDemo() {
  // useDebounce: delays search API calls until user stops typing
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const prevDebouncedRef = useRef<string>("");

  // useLocalStorage: persists theme preference
  const [theme, setTheme] = useLocalStorage("app-theme", "light");

  // useApi: fetches users from API
  const {
    data: users,
    isLoading,
    error,
  } = useApi<User[]>(getApiUrl(API_CONFIG.ENDPOINTS.USERS));

  // useAuth: manages authentication state
  const { isLoggedIn, user, login, logout } = useAuth();

  // Log when debounced value changes (for demo purposes)
  useEffect(() => {
    if (debouncedSearch && debouncedSearch !== prevDebouncedRef.current) {
      prevDebouncedRef.current = debouncedSearch;
      console.log("🔍 Search API call would happen now for:", debouncedSearch);
    }
  }, [debouncedSearch]);

  const handleLogin = () => {
    login({
      id: "1",
      name: "John Doe",
      email: "john@example.com",
    });
  };

  return (
    <section className="demo-section">
      <h2>6. Custom Hooks Demo</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What are these examples doing?</strong> 4 real-world
          problems solved with custom hooks!
        </p>
        <p>
          <strong>✅ With Custom Hooks:</strong> Complex logic hidden in
          reusable functions. Use anywhere!
        </p>
        <p>
          <strong>❌ Without Custom Hooks:</strong> Copy-paste same logic
          everywhere. Messy & hard to maintain.
        </p>
        <p>
          <strong>💡 Use when:</strong> Same logic needed in multiple
          components.
          <br />
          <strong>🚫 Don't use when:</strong> Logic only used once (keep it in
          component).
        </p>
      </div>

      {/* useDebounce */}
      <div className="custom-hook-demo">
        <h3>🔍 useDebounce</h3>
        <p className="hook-description">
          Delays value updates until user stops typing. Prevents excessive API
          calls during typing.
        </p>
        <input
          type="text"
          placeholder="Type to search (500ms debounce)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input-field"
          style={{ width: "100%", maxWidth: "400px" }}
        />
        <div className="debounce-info">
          <p>
            <strong>Immediate value:</strong> "{searchInput}"
          </p>
          <p>
            <strong>Debounced value:</strong> "{debouncedSearch}"{" "}
            <span className="info-badge">API calls use this</span>
          </p>
          <p className="info-text">
            📝 Check the console to see when API calls would be made
          </p>
        </div>
        <p className="benefit">
          ✓ Benefit: If you type "react", only 1 API call instead of 5!
        </p>
      </div>

      {/* useLocalStorage */}
      <div className="custom-hook-demo">
        <h3>💾 useLocalStorage</h3>
        <p className="hook-description">
          Syncs state with browser localStorage. Data persists across page
          reloads!
        </p>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="btn-primary"
        >
          Toggle Theme (Current: <strong>{theme}</strong>)
        </button>
        <p className="benefit">
          ✓ Try reloading the page - your theme preference is saved!
        </p>
        <p className="info-text">
          Open DevTools → Application → Local Storage to see the stored value
        </p>
      </div>

      {/* useAuth */}
      <div className="custom-hook-demo">
        <h3>🔐 useAuth</h3>
        <p className="hook-description">
          Manages authentication state and provides login/logout functions.
        </p>
        {isLoggedIn ? (
          <div className="auth-info">
            <div className="user-card">
              <p className="welcome-text">Welcome back!</p>
              <p>
                <strong>{user?.name}</strong>
              </p>
              <p className="user-email">{user?.email}</p>
            </div>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p className="info-text">You are not logged in</p>
            <button onClick={handleLogin} className="btn-primary">
              Login as John Doe
            </button>
          </div>
        )}
      </div>

      {/* useApi */}
      <div className="custom-hook-demo">
        <h3>🌍 useApi</h3>
        <p className="hook-description">
          Fetches data from APIs and manages loading/error states automatically.
        </p>
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users from API...</p>
          </div>
        )}
        {error && (
          <div className="error-state">
            <p>⚠️ Error: {error.message}</p>
            <p className="info-text">
              Make sure json-server is running: <code>npm run api</code>
            </p>
          </div>
        )}
        {users && (
          <div>
            <p className="success-text">
              ✓ Successfully fetched {users.length} users from API
            </p>
            <div className="user-grid">
              {users.slice(0, 3).map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
            {users.length > 3 && (
              <p className="info-text">... and {users.length - 3} more users</p>
            )}
          </div>
        )}
      </div>

      <div className="code-explanation">
        <p>
          📝 <strong>Custom hooks are just functions!</strong>
        </p>
        <ul>
          <li>Name must start with "use" (e.g., useDebounce, useAuth)</li>
          <li>Can call other hooks inside them</li>
          <li>Reusable across multiple components</li>
          <li>Extract and share logic without HOCs or render props</li>
        </ul>
      </div>
    </section>
  );
}

/**
 * ========================================
 * 7. ERROR BOUNDARY DEMO
 * ========================================
 * Demonstrates error handling with ErrorBoundary
 */
function ErrorBoundaryDemo() {
  const [showBrokenComponent, setShowBrokenComponent] = useState(false);

  return (
    <section className="demo-section">
      <h2>7. Error Boundary</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> ComponentThatFails
          crashes on purpose. ErrorBoundary catches it!
        </p>
        <p>
          <strong>✅ With Error Boundary:</strong> Click "Show" → Component
          crashes → Shows error message. App still works!
        </p>
        <p>
          <strong>❌ Without Error Boundary:</strong> Crash → Entire app white
          screen → User sees nothing. Bad UX!
        </p>
        <p>
          <strong>💡 Use when:</strong> Wrap risky components (third-party,
          user-generated content).
          <br />
          <strong>🚫 Can't use hooks:</strong> Must be class component (React
          limitation).
        </p>
      </div>
      <button
        onClick={() => setShowBrokenComponent(!showBrokenComponent)}
        className={showBrokenComponent ? "btn-secondary" : "btn-primary"}
      >
        {showBrokenComponent ? "❌ Hide" : "⚠️ Show"} Broken Component
      </button>
      {showBrokenComponent && (
        <div className="error-demo-container">
          <ErrorBoundary>
            <ComponentThatFails />
          </ErrorBoundary>
        </div>
      )}
      {!showBrokenComponent && (
        <div className="info-box">
          <p>ℹ️ Click the button above to see error boundary in action</p>
        </div>
      )}
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣{" "}
            <code>
              &lt;ErrorBoundary&gt;&lt;ComponentThatFails
              /&gt;&lt;/ErrorBoundary&gt;
            </code>
          </li>
          <li>
            2️⃣ Component throws error → <code>null.property</code> crashes
          </li>
          <li>
            3️⃣ ErrorBoundary <code>componentDidCatch()</code> catches it
          </li>
          <li>4️⃣ Shows fallback UI → "Something went wrong"</li>
          <li>5️⃣ Rest of app works → Counter/Timer still clickable!</li>
          <li>💡 Production: Log errors to Sentry/LogRocket for debugging</li>
        </ul>
      </div>
    </section>
  );
}

/**
 * ========================================
 * MAIN APP
 * ========================================
 */
function App() {
  return (
    <div className="App">
      <header>
        <h1>🎯 React Hooks Playground</h1>
        <p>Complete practice environment for React hooks and patterns</p>
      </header>

      <main>
        <Counter />
        <SettingsPanel />
        <Timer />
        <ListFilter />
        <ParentChildDemo />
        <CustomHooksDemo />
        <ErrorBoundaryDemo />
      </main>

      <footer>
        <p>Built with React + TypeScript + Vite</p>
      </footer>
    </div>
  );
}

export default App;
