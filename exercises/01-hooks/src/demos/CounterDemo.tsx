import { useState } from "react";

/**
 * Counter Demo - useState
 * Demonstrates basic state management with useState
 */
export function CounterDemo() {
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
