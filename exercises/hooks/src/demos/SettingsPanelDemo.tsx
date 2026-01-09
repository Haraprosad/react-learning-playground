import { useReducer, useState } from "react";

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

/**
 * Settings Panel Demo - useReducer
 * Demonstrates complex state management with useReducer
 */
export function SettingsPanelDemo() {
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
