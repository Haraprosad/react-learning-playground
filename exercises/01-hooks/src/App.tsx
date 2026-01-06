/**
 * React Hooks Playground - Main Application
 *
 * A comprehensive demonstration of React Hooks and patterns with TypeScript.
 * This file showcases 9 interactive demos covering:
 *
 * 1. useState - Simple state management (Counter)
 * 2. useReducer - Complex state management (Settings Panel)
 * 3. useEffect - Side effects and lifecycle (Timer/Stopwatch)
 * 4. useRef - DOM access and persistent values
 * 5. useLayoutEffect - Synchronous DOM measurements
 * 6. useMemo - Performance optimization (List Filter)
 * 7. useCallback - Function memoization (Parent-Child Demo)
 * 8. Custom Hooks - Reusable logic (useDebounce, useLocalStorage, useApi, useAuth)
 * 9. Error Boundaries - Error handling (Graceful error recovery)
 *
 * @requires json-server running on port 3001 for API demos
 * @see README.md for setup instructions
 */

import "./App.css";
import {
  CounterDemo,
  SettingsPanelDemo,
  TimerDemo,
  RefDemo,
  LayoutEffectDemo,
  ListFilterDemo,
  ParentChildDemo,
  CustomHooksDemo,
  ErrorBoundaryDemo,
} from "./demos";

/**
 * Main App Component
 * Renders all hook demonstrations in a single page
 */
function App() {
  return (
    <div className="App">
      <header>
        <h1>🎯 React Hooks Playground</h1>
        <p>Complete practice environment for React hooks and patterns</p>
      </header>

      <main>
        <CounterDemo />
        <SettingsPanelDemo />
        <TimerDemo />
        <RefDemo />
        <LayoutEffectDemo />
        <ListFilterDemo />
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
