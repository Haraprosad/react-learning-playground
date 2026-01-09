import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AuthProvider } from "./context/AuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import UserProfile from "./components/UserProfile";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes - Require Authentication */}
            {/* Dashboard is wrapped with withAuth HOC */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* UserProfile is wrapped with withAuth HOC */}
            <Route path="/profile" element={<UserProfile />} />

            {/* Admin Panel is wrapped with withRole HOC - only admins can access */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
