import { useRef, useState, useEffect } from "react";

/**
 * Ref Demo - useRef
 * Demonstrates DOM access and persistent values with useRef
 */
export function RefDemo() {
  // Refs for DOM manipulation
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  // Ref for tracking previous value
  const countRef = useRef<number | undefined>(undefined);
  const [count, setCount] = useState(0);

  // Display values using state instead of ref access during render
  const [inputFocused, setInputFocused] = useState(false);
  const [divWidth, setDivWidth] = useState(0);
  const [prevCount, setPrevCount] = useState<number | undefined>(undefined);

  // Update display value after render
  useEffect(() => {
    setPrevCount(countRef.current);
    countRef.current = count;
  }, [count]);

  const handleFocusInput = () => {
    inputRef.current?.focus();
    setInputFocused(true);
    setTimeout(() => setInputFocused(false), 2000);
  };

  const handleMeasureDiv = () => {
    if (divRef.current) {
      setDivWidth(divRef.current.offsetWidth);
    }
  };

  return (
    <section className="demo-section">
      <h2>4. useRef - DOM Access & Persistent Values</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Accessing DOM elements
          directly and tracking values without causing re-renders.
        </p>
        <p>
          <strong>✅ With useRef:</strong> Get DOM nodes, store mutable values,
          and track previous state - all without re-rendering.
        </p>
        <p>
          <strong>❌ Without useRef:</strong> Can't directly access DOM for
          focus, measurements, etc. Can't track previous values without extra
          re-renders.
        </p>
        <p>
          <strong>💡 Use when:</strong> Need DOM access (focus, scroll,
          measure), store values that don't trigger renders, or track previous
          values.
          <br />
          <strong>🚫 Don't use when:</strong> Data should trigger re-renders
          (use useState instead).
        </p>
      </div>

      {/* DOM Access: Focus Input */}
      <div className="ref-example">
        <h3>Example 1: Focus Input</h3>
        <input
          ref={inputRef}
          type="text"
          placeholder="Click button to focus me"
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleFocusInput} className="btn-primary">
          Focus Input
        </button>
        {inputFocused && (
          <span style={{ marginLeft: "10px", color: "green" }}>✓ Focused!</span>
        )}
      </div>

      {/* DOM Access: Measure Element */}
      <div className="ref-example">
        <h3>Example 2: Measure DOM Element</h3>
        <div
          ref={divRef}
          style={{
            width: "60%",
            padding: "20px",
            background: "#e3f2fd",
            border: "2px solid #2196F3",
            borderRadius: "8px",
            marginBottom: "15px",
            color: "#1565c0",
            fontWeight: "500",
          }}
        >
          📏 This div's width is being measured
        </div>
        <button onClick={handleMeasureDiv} className="btn-primary">
          📐 Measure Width
        </button>
        {divWidth > 0 && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#fff3e0",
              border: "1px solid #ff9800",
              borderRadius: "4px",
              color: "#e65100",
            }}
          >
            📊 Width: <strong style={{ fontSize: "18px" }}>{divWidth}px</strong>
          </div>
        )}
      </div>

      {/* Persistent Value: Track Previous State */}
      <div className="ref-example">
        <h3>Example 3: Track Previous Value</h3>
        <div style={{ marginBottom: "15px" }}>
          <button onClick={() => setCount(count + 1)} className="btn-primary">
            ➕ Increment Count
          </button>
          <button
            onClick={() => setCount(0)}
            className="btn-secondary"
            style={{ marginLeft: "10px" }}
          >
            🔄 Reset
          </button>
        </div>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f3e5f5",
            border: "2px solid #9c27b0",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{ fontSize: "18px", marginBottom: "8px", color: "#4a148c" }}
          >
            Current Count:{" "}
            <strong style={{ fontSize: "24px", color: "#6a1b9a" }}>
              {count}
            </strong>
          </div>
          <div style={{ fontSize: "16px", color: "#7b1fa2" }}>
            Previous Count:{" "}
            <strong style={{ fontSize: "20px", color: "#8e24aa" }}>
              {prevCount !== undefined ? prevCount : "N/A"}
            </strong>
          </div>
        </div>
      </div>

      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣{" "}
            <code>const inputRef = useRef&lt;HTMLInputElement&gt;(null)</code> →
            Creates ref
          </li>
          <li>
            2️⃣ <code>&lt;input ref={"{inputRef}"} /&gt;</code> → Attaches ref to
            DOM element
          </li>
          <li>
            3️⃣ <code>inputRef.current?.focus()</code> → Accesses real DOM node
          </li>
          <li>
            4️⃣ <code>countRef.current = count</code> → Stores value without
            re-render
          </li>
          <li>
            💡 Unlike useState, changing ref.current doesn't trigger re-render
          </li>
        </ul>
      </div>
    </section>
  );
}
