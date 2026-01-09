import { useState, useCallback, memo } from "react";

interface ChildProps {
  onIncrement: () => void;
  label: string;
}

// Child component - React.memo prevents re-render if props haven't changed
const ExpensiveChild = memo(({ onIncrement, label }: ChildProps) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`🔄 ${label} rendered at ${timestamp}`);

  return (
    <div className="child-component">
      <p>
        <strong>{label}</strong> (Last render: {timestamp})
      </p>
      <button onClick={onIncrement} className="btn-primary">
        Increment from {label}
      </button>
      <p style={{ fontSize: "12px", color: "#666" }}>
        Check console to see when this component re-renders
      </p>
    </div>
  );
});

/**
 * Parent-Child Demo - useCallback
 * Demonstrates preventing unnecessary re-renders with useCallback
 */
export function ParentChildDemo() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);

  // ✅ useCallback: Function reference stays the same across re-renders
  const handleIncrement = useCallback(() => {
    setCount((c) => c + 1);
  }, []); // Empty deps = function never changes

  // ❌ Without useCallback: New function every render
  const handleIncrementNoCallback = () => {
    setCount((c) => c + 1);
  };

  return (
    <section className="demo-section">
      <h2>7. useCallback - Parent-Child Optimization</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Parent passes function
          to child. Without useCallback, child re-renders unnecessarily.
        </p>
        <p>
          <strong>✅ With useCallback:</strong> Function reference stays same →
          Child sees no prop change → Skips re-render! 🎉
        </p>
        <p>
          <strong>❌ Without useCallback:</strong> New function every render →
          Child sees "new" prop → Wastes re-renders.
        </p>
        <p>
          <strong>💡 Use when:</strong> Passing callbacks to optimized child
          components (with React.memo).
          <br />
          <strong>🚫 Don't use when:</strong> Child isn't optimized OR function
          is cheap (premature optimization).
        </p>
      </div>
      <div className="parent-section">
        <h3>Parent Component</h3>
        <p>Count: {count}</p>
        <p>Other State: {otherState}</p>
        <button
          onClick={() => setOtherState((o) => o + 1)}
          className="btn-secondary"
        >
          Change Other State (triggers parent re-render)
        </button>
      </div>
      <div className="children-comparison">
        <ExpensiveChild
          onIncrement={handleIncrement}
          label="Child 1 (with useCallback)"
        />
        <ExpensiveChild
          onIncrement={handleIncrementNoCallback}
          label="Child 2 (without useCallback)"
        />
      </div>
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣{" "}
            <code>const callback = useCallback(() ={"> {...}, [deps]"})</code> →
            Memoizes function
          </li>
          <li>
            2️⃣ Click "Change Other State" → Parent re-renders → Creates new
            functions
          </li>
          <li>
            3️⃣ Child 1 gets SAME function reference (useCallback) → React.memo
            blocks re-render ✅
          </li>
          <li>
            4️⃣ Child 2 gets NEW function reference → React.memo can't optimize →
            Re-renders ❌
          </li>
          <li>
            💡 Check console: Child 1 only renders when count changes, Child 2
            renders on every parent render
          </li>
        </ul>
      </div>
    </section>
  );
}
