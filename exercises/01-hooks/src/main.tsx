/**
 * Application Entry Point
 *
 * Initializes the React application with StrictMode enabled.
 * StrictMode helps identify potential problems in the application during development.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
