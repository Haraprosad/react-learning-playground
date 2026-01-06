import { useEffect, useState } from "react";

/**
 * Timer Demo - useEffect
 * Demonstrates side effects and cleanup with useEffect
 */
export function TimerDemo() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <section className="demo-section">
      <h2>3. useEffect - Timer</h2>
      <div className="explanation">
        <p>
          <strong>🎯 What's this example doing?</strong> Running a timer that
          needs cleanup to avoid memory leaks.
        </p>
        <p>
          <strong>✅ With useEffect:</strong> Start interval when running. Clean
          up when stopped or component unmounts.
        </p>
        <p>
          <strong>❌ Without useEffect:</strong> You'd create intervals but
          never clean them up = memory leak! 💥
        </p>
        <p>
          <strong>💡 Use when:</strong> Need subscriptions, timers, data
          fetching, or DOM updates.
          <br />
          <strong>🚫 Don't use when:</strong> Just transforming data (do that
          during render).
        </p>
      </div>
      <div className="timer">
        <div className="time-display">{seconds}s</div>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="btn-primary"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button onClick={() => setSeconds(0)} className="btn-secondary">
          Reset
        </button>
      </div>
      <div className="code-explanation">
        <p>
          📝 <strong>How it works:</strong>
        </p>
        <ul>
          <li>
            1️⃣ <code>useEffect(() ={"> {...}, [isRunning])"}</code> → Runs when
            isRunning changes
          </li>
          <li>
            2️⃣ Click Start → <code>setIsRunning(true)</code> → useEffect runs
          </li>
          <li>
            3️⃣ Creates interval → Updates seconds every 1000ms → Timer counts up
          </li>
          <li>
            4️⃣ <code>return () ={"> clearInterval(interval)"}</code> → Cleanup
            prevents memory leaks
          </li>
          <li>
            5️⃣ Click Pause → Cleanup runs → Interval cleared → Timer stops
          </li>
        </ul>
      </div>
    </section>
  );
}
