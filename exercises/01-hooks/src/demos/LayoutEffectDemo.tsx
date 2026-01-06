import { useLayoutEffect, useEffect, useState, useRef } from "react";

/**
 * Layout Effect Demo - useLayoutEffect
 * Demonstrates synchronous DOM measurements vs useEffect
 */
export function LayoutEffectDemo() {
  const [showBox, setShowBox] = useState(false);
  const [useLayoutVersion, setUseLayoutVersion] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);

  // State to store measurements (displayed after render)
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [effectHeight, setEffectHeight] = useState(0);

  // useLayoutEffect - runs BEFORE browser paints
  useLayoutEffect(() => {
    if (useLayoutVersion && showBox && boxRef.current) {
      const height = boxRef.current.offsetHeight;
      setLayoutHeight(height);
      // Synchronous DOM mutation - no flicker!
      boxRef.current.style.backgroundColor =
        height > 100 ? "#4CAF50" : "#2196F3";
    }
  }, [showBox, useLayoutVersion]);

  // useEffect - runs AFTER browser paints
  useEffect(() => {
    if (!useLayoutVersion && showBox && boxRef.current) {
      const height = boxRef.current.offsetHeight;
      setEffectHeight(height);
      // Async DOM mutation - might see flicker on slow devices
      boxRef.current.style.backgroundColor =
        height > 100 ? "#4CAF50" : "#2196F3";
    }
  }, [showBox, useLayoutVersion]);

  return (
    <section className="demo-section">
      <h2>5. useLayoutEffect - Synchronous DOM Measurements</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Measuring and styling a
          box immediately after render, before the user sees it.
        </p>
        <p>
          <strong>✅ With useLayoutEffect:</strong> Measures height and applies
          color BEFORE paint → No visual flicker. Synchronous execution.
        </p>
        <p>
          <strong>⚠️ With useEffect:</strong> Measures AFTER paint → You might
          see a brief flicker (blue → green). Async execution.
        </p>
        <p>
          <strong>💡 Use when:</strong> Need to measure/mutate DOM before user
          sees it (tooltips, scroll position, animations).
          <br />
          <strong>🚫 Don't use when:</strong> Don't need synchronous DOM access
          (useEffect is preferred - it doesn't block painting).
        </p>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <input
            type="checkbox"
            checked={useLayoutVersion}
            onChange={(e) => setUseLayoutVersion(e.target.checked)}
          />
          Use useLayoutEffect (uncheck to use useEffect)
        </label>
      </div>

      <button
        onClick={() => setShowBox(!showBox)}
        className="btn-primary"
        style={{ marginBottom: "15px" }}
      >
        {showBox ? "Hide" : "Show"} Box
      </button>

      {showBox && (
        <div
          ref={boxRef}
          style={{
            padding: "20px",
            minHeight: "80px",
            border: "2px solid #333",
            borderRadius: "4px",
            marginTop: "10px",
            transition: "background-color 0.3s",
          }}
        >
          <p>
            This box is measured{" "}
            {useLayoutVersion ? "synchronously" : "asynchronously"}.
          </p>
          <p>Height: {useLayoutVersion ? layoutHeight : effectHeight}px</p>
          <p>
            Color changes based on height:{" "}
            {useLayoutVersion ? layoutHeight : effectHeight}{" "}
            {useLayoutVersion ? layoutHeight : effectHeight} &gt; 100 ? Green :
            Blue
          </p>
          {!useLayoutVersion && (
            <p style={{ fontSize: "12px", color: "#666" }}>
              Note: On fast computers, you might not see flicker with useEffect.
              Try throttling your CPU in DevTools to see the difference.
            </p>
          )}
        </div>
      )}

      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣ <code>useLayoutEffect(() ={"> {...}, [showBox])"}</code> → Runs
            synchronously
          </li>
          <li>
            2️⃣ Click "Show Box" → Component renders (but browser hasn't painted
            yet!)
          </li>
          <li>3️⃣ useLayoutEffect measures height → Changes background color</li>
          <li>4️⃣ Browser paints → User sees final result (no flicker! 🎨)</li>
          <li>
            ⚠️ With useEffect: Browser paints first → Then measures/changes
            color → Flicker!
          </li>
          <li>💡 Timeline: Render → useLayoutEffect → Paint → useEffect</li>
        </ul>
      </div>
    </section>
  );
}
