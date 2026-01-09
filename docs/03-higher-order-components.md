# Topic 3: Higher Order Components (HOCs)

**Learning Approach:** Project-Based Learning  
**Practice Project:** HOC Authentication Demo ([exercises/hoc/](../exercises/hoc/))  
**Completion Date:** January 9, 2026

> **🎯 Learning Goal:** Master Higher Order Components through a real-world authentication system - understand WHAT HOCs are, WHY they're powerful, WHEN to use them, and HOW to implement them for production-ready React applications.

---

## 📋 Table of Contents

1. [Introduction to HOCs](#introduction-to-hocs)
2. [Understanding the Pattern](#understanding-the-pattern)
3. [Real-World Implementation](#real-world-implementation)
   - [Authentication HOC (withAuth)](#authentication-hoc-withauth)
   - [Role-Based Access HOC (withRole)](#role-based-access-hoc-withrole)
4. [Complete Walkthrough](#complete-walkthrough)
5. [When to Use HOCs](#when-to-use-hocs)
6. [HOCs vs Other Patterns](#hocs-vs-other-patterns)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)
9. [TypeScript with HOCs](#typescript-with-hocs)
10. [Production Considerations](#production-considerations)
11. [Key Takeaways](#key-takeaways)

---

## Introduction to HOCs

### What is a Higher Order Component?

A **Higher Order Component (HOC)** is a function that takes a component and returns a new component with additional props or behavior.

```typescript
// Simple concept
const EnhancedComponent = higherOrderComponent(OriginalComponent);
```

**Think of it like:**
- 🎁 **Gift wrapping** - You wrap a component with extra functionality
- 🏗️ **Decorator pattern** - Add features without modifying the original
- 🔌 **Plugin system** - Plug in functionality to any component

### The Core Concept

```typescript
// HOC Definition
function withSomething<P extends object>(
  Component: ComponentType<P>
) {
  return function EnhancedComponent(props: P) {
    // 1. Add extra logic here
    const extraData = useSomeLogic();
    
    // 2. Return the original component with enhancements
    return <Component {...props} extraProp={extraData} />;
  };
}

// Usage
const MyComponent = ({ name, extraProp }) => <div>{name}: {extraProp}</div>;
const Enhanced = withSomething(MyComponent);

// Use it like a normal component
<Enhanced name="John" />
```

### Why HOCs Were Created

**The Problem:**
Before HOCs (and hooks), sharing logic between components was difficult:

```typescript
// ❌ WITHOUT HOC - Duplicate logic everywhere
function UserDashboard() {
  const user = checkAuth(); // Duplicate
  if (!user) return <Navigate to="/login" />; // Duplicate
  return <div>Dashboard for {user.name}</div>;
}

function AdminPanel() {
  const user = checkAuth(); // Duplicate again!
  if (!user) return <Navigate to="/login" />; // Duplicate again!
  if (user.role !== 'admin') return <div>Access Denied</div>; // More duplicate logic
  return <div>Admin Panel</div>;
}

function Profile() {
  const user = checkAuth(); // Still duplicating!
  if (!user) return <Navigate to="/login" />; // Still duplicating!
  return <div>Profile: {user.name}</div>;
}
```

**The Solution with HOCs:**

```typescript
// ✅ WITH HOC - Write logic once, reuse everywhere!
function withAuth(Component) {
  return function(props) {
    const user = checkAuth();
    if (!user) return <Navigate to="/login" />;
    return <Component {...props} />;
  };
}

// Now just wrap your components
const UserDashboard = withAuth(({ user }) => <div>Dashboard for {user.name}</div>);
const Profile = withAuth(({ user }) => <div>Profile: {user.name}</div>);
const AdminPanel = withAuth(withRole(AdminPanelComponent, ['admin']));
```

### Benefits of HOCs

1. ✅ **DRY Principle** - Don't Repeat Yourself
2. ✅ **Separation of Concerns** - Keep logic and UI separate
3. ✅ **Reusability** - One HOC, unlimited components
4. ✅ **Composition** - Stack multiple HOCs together
5. ✅ **Testing** - Test HOC logic separately from UI
6. ✅ **Maintainability** - Fix a bug once, fixes everywhere

---

## Understanding the Pattern

### HOC Anatomy

Let's break down a HOC piece by piece:

```typescript
// 1. HOC Function - Takes a component as input
function withEnhancement<P extends object>(
  Component: ComponentType<P>,
  config?: ConfigType  // Optional configuration
) {
  // 2. Return a new component (wrapper)
  return function WrappedComponent(props: P) {
    
    // 3. Add your enhancement logic here
    const [data, setData] = useState();
    const specialLogic = useYourLogic();
    
    // 4. Handle edge cases
    if (loading) return <Loading />;
    if (error) return <Error />;
    
    // 5. Pass everything to the original component
    return (
      <Component 
        {...props}           // Original props
        extraProp={data}     // New props
      />
    );
  };
}
```

### Mental Model

Think of an HOC as a **function factory**:

```typescript
// Factory that creates authenticated components
const withAuth = (Component) => {
  // Returns a NEW component that:
  // 1. Checks authentication
  // 2. Renders the original component if authenticated
  // 3. Redirects if not authenticated
  return (props) => {
    // Authentication logic
    if (authenticated) {
      return <Component {...props} />;
    } else {
      return <Navigate to="/login" />;
    }
  };
};
```

### Simple Example: Adding Loading State

```typescript
// HOC that adds loading state to any component
function withLoading<P extends object>(
  Component: ComponentType<P>
) {
  return function ComponentWithLoading(props: P & { isLoading?: boolean }) {
    const { isLoading, ...restProps } = props;
    
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div>Loading...</div>
        </div>
      );
    }
    
    return <Component {...restProps as P} />;
  };
}

// Usage
const UserList = ({ users }) => (
  <ul>
    {users.map(user => <li key={user.id}>{user.name}</li>)}
  </ul>
);

const UserListWithLoading = withLoading(UserList);

// Now you can use it with loading state
<UserListWithLoading users={data} isLoading={isLoading} />
```

---

## Real-World Implementation

In our practice project, we built a complete authentication system with two HOCs:
1. **`withAuth`** - Protects routes requiring any authentication
2. **`withRole`** - Protects routes based on user roles (admin, user, etc.)

### Project Structure

```
exercises/hoc/
├── db.json                    # Mock user database (JSON Server)
├── src/
│   ├── types/
│   │   └── auth.types.ts     # TypeScript definitions
│   ├── context/
│   │   └── AuthContext.tsx   # Authentication state management
│   ├── hoc/
│   │   ├── withAuth.tsx      # Authentication HOC
│   │   └── withRole.tsx      # Role-based access HOC
│   └── components/
│       ├── Login.tsx         # Public - anyone can access
│       ├── Dashboard.tsx     # Protected with withAuth
│       ├── UserProfile.tsx   # Protected with withAuth
│       └── AdminPanel.tsx    # Protected with withRole(['admin'])
```

### Authentication HOC (withAuth)

**Purpose:** Protect routes that require any authenticated user.

**File:** `src/hoc/withAuth.tsx`

```typescript
import type { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Higher Order Component for authentication protection.
 * 
 * Wraps a component and checks if user is authenticated.
 * If not authenticated, redirects to login page.
 * If authenticated, renders the wrapped component.
 * 
 * @example
 * const Dashboard = ({ user }) => <div>Welcome {user.name}</div>;
 * const ProtectedDashboard = withAuth(Dashboard);
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <h2>Loading...</h2>
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the component
    return <Component {...props} />;
  };
}
```

**How it Works:**

1. **Takes a Component** - Any component you want to protect
2. **Returns a Wrapper** - New component with auth logic
3. **Checks Authentication** - Uses `useAuth()` hook
4. **Loading State** - Shows loading while checking
5. **Guards Access** - Redirects if not logged in
6. **Passes Props** - Original component gets all its props

**Usage Example:**

```typescript
// Original component
function Dashboard() {
  const { user } = useAuth();
  return <div>Welcome {user?.name}!</div>;
}

// Wrap it with authentication
const ProtectedDashboard = withAuth(Dashboard);

// Use in routes
<Route path="/dashboard" element={<ProtectedDashboard />} />

// What happens:
// ❌ Not logged in? → Redirect to /login
// ✅ Logged in? → Show Dashboard
```

### Role-Based Access HOC (withRole)

**Purpose:** Protect routes that require specific user roles (admin, moderator, etc.).

**File:** `src/hoc/withRole.tsx`

```typescript
import type { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth.types";

/**
 * Higher Order Component for role-based access control.
 * 
 * Wraps a component and checks if user has required role(s).
 * First checks authentication, then checks role permission.
 * 
 * @param allowedRoles - Array of roles that can access the component
 * 
 * @example
 * // Only admins can access
 * const AdminPanel = withRole(AdminPanelComponent, ['admin']);
 * 
 * @example
 * // Admins OR moderators can access
 * const ModPanel = withRole(ModPanelComponent, ['admin', 'moderator']);
 */
export function withRole<P extends object>(
  Component: ComponentType<P>,
  allowedRoles: Role[]
) {
  return function RoleProtectedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Show loading state
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <h2>Loading...</h2>
        </div>
      );
    }

    // First: Check authentication
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }

    // Second: Check role permission
    if (!allowedRoles.includes(user.role)) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: '20px'
        }}>
          <h1>🚫 Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <p>Required role: <strong>{allowedRoles.join(' or ')}</strong></p>
          <p>Your role: <strong>{user.role}</strong></p>
          <button onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      );
    }

    // User has correct role, render component
    return <Component {...props} />;
  };
}
```

**How it Works:**

1. **Takes Component + Roles** - Component to protect and allowed roles
2. **Returns Protected Component** - New component with role checking
3. **Checks Authentication** - Must be logged in first
4. **Checks Role** - User's role must be in allowedRoles array
5. **Shows Access Denied** - Clear message if wrong role
6. **Passes Props** - Original component gets all its props

**Usage Examples:**

```typescript
// Example 1: Admin-only page
function AdminPanel() {
  return <div>Admin Controls</div>;
}
const ProtectedAdminPanel = withRole(AdminPanel, ['admin']);

// Example 2: Admin OR Moderator page
function ModerationPanel() {
  return <div>Moderation Tools</div>;
}
const ProtectedModPanel = withRole(ModerationPanel, ['admin', 'moderator']);

// Example 3: Direct export
export default withRole(AdminPanel, ['admin']);

// In routes:
<Route path="/admin" element={<ProtectedAdminPanel />} />
<Route path="/moderate" element={<ProtectedModPanel />} />

// What happens:
// ❌ Not logged in? → Redirect to /login
// ❌ Wrong role? → Show "Access Denied"
// ✅ Correct role? → Show component
```

---

## Complete Walkthrough

Let's walk through the entire authentication system step by step.

### Step 1: Type Definitions

**File:** `src/types/auth.types.ts`

```typescript
// Define possible user roles
export type Role = 'admin' | 'user';

// User data structure
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: Role;
}

// Login form data
export interface LoginCredentials {
  username: string;
  password: string;
}

// Authentication context interface
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
```

**Why this matters:**
- Type safety prevents bugs
- Clear contracts for what data looks like
- IntelliSense support in your IDE
- Self-documenting code

### Step 2: Authentication Context

**File:** `src/context/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, AuthContextType, LoginCredentials } from "../types/auth.types";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // Call API to verify credentials
      const response = await fetch(
        `http://localhost:3001/users?username=${credentials.username}&password=${credentials.password}`
      );

      if (!response.ok) {
        throw new Error("Failed to authenticate");
      }

      const users = await response.json();

      if (users.length === 0) {
        throw new Error("Invalid username or password");
      }

      const authenticatedUser = users[0];

      // Remove password from user object before storing
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = authenticatedUser;

      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

**Key Features:**
- Manages authentication state globally
- Persists login across page refreshes (localStorage)
- Provides `useAuth()` hook for easy access
- Handles loading states
- Communicates with backend (JSON Server)

### Step 3: Using the HOCs

**Protected Dashboard (Any Authenticated User):**

```typescript
// src/components/Dashboard.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { withAuth } from "../hoc/withAuth";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>Your role: {user?.role}</p>
      
      <Link to="/profile">My Profile</Link>
      <Link to="/admin">Admin Panel</Link>
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Wrap with withAuth HOC
const DashboardWithAuth = withAuth(Dashboard);
export default DashboardWithAuth;
```

**Admin-Only Panel:**

```typescript
// src/components/AdminPanel.tsx
import { useAuth } from "../context/AuthContext";
import { withRole } from "../hoc/withRole";

function AdminPanel() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome, Admin {user?.name}!</p>
      
      <div>
        <h3>Admin Actions:</h3>
        <ul>
          <li>Manage Users</li>
          <li>System Settings</li>
          <li>View Analytics</li>
        </ul>
      </div>
    </div>
  );
}

// Wrap with withRole HOC - only admins allowed
const AdminPanelWithRole = withRole(AdminPanel, ["admin"]);
export default AdminPanelWithRole;
```

### Step 4: Setting Up Routes

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";      // Already wrapped with withAuth
import AdminPanel from "./components/AdminPanel";    // Already wrapped with withRole
import UserProfile from "./components/UserProfile";  // Already wrapped with withAuth

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - withAuth HOC applied */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          
          {/* Admin Only - withRole HOC applied */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### Step 5: Test Scenarios

**Scenario 1: Unauthenticated User**
```
User visits → /dashboard
↓
withAuth HOC checks: isAuthenticated? NO
↓
Redirect to → /login
```

**Scenario 2: Regular User (role: 'user')**
```
User logs in with: user / user123
↓
Can access:
  ✅ /dashboard (withAuth - authenticated)
  ✅ /profile (withAuth - authenticated)
  ❌ /admin (withRole(['admin']) - wrong role)
↓
Admin panel shows: "Access Denied - Required role: admin, Your role: user"
```

**Scenario 3: Admin User (role: 'admin')**
```
User logs in with: admin / admin123
↓
Can access:
  ✅ /dashboard (withAuth - authenticated)
  ✅ /profile (withAuth - authenticated)
  ✅ /admin (withRole(['admin']) - correct role)
↓
Full access to everything!
```

---

## When to Use HOCs

### Perfect Use Cases ✅

**1. Authentication & Authorization**
```typescript
const ProtectedRoute = withAuth(Component);
const AdminRoute = withRole(Component, ['admin']);
```
- Every app needs this
- Clean separation of concerns
- Reusable across entire app

**2. Data Fetching**
```typescript
const withData = (Component, dataSource) => {
  return (props) => {
    const data = useFetch(dataSource);
    if (loading) return <Loading />;
    if (error) return <Error />;
    return <Component {...props} data={data} />;
  };
};

const UserListWithData = withData(UserList, '/api/users');
```

**3. Analytics & Tracking**
```typescript
const withAnalytics = (Component, eventName) => {
  return (props) => {
    useEffect(() => {
      trackPageView(eventName);
    }, []);
    return <Component {...props} />;
  };
};

const DashboardWithTracking = withAnalytics(Dashboard, 'dashboard_view');
```

**4. Error Boundaries**
```typescript
const withErrorBoundary = (Component) => {
  return (props) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};
```

**5. Theme/Styling**
```typescript
const withTheme = (Component, theme) => {
  return (props) => (
    <ThemeProvider theme={theme}>
      <Component {...props} />
    </ThemeProvider>
  );
};
```

### When NOT to Use HOCs ❌

**1. Simple Props Passing**
```typescript
// ❌ DON'T - Overkill for simple props
const withName = (Component) => {
  return (props) => <Component {...props} name="John" />;
};

// ✅ DO - Just pass props directly
<Component name="John" />
```

**2. One-Time Use Logic**
```typescript
// ❌ DON'T - Not reusable
const withSpecificLogic = (Component) => {
  return (props) => {
    // Logic only used once
    return <Component {...props} />;
  };
};

// ✅ DO - Keep it in the component
function Component() {
  // Logic here
}
```

**3. When Hooks Are Better**
```typescript
// ❌ OLD WAY - HOC
const withWindowSize = (Component) => {
  return (props) => {
    const [width, setWidth] = useState(window.innerWidth);
    // ... window resize logic
    return <Component {...props} width={width} />;
  };
};

// ✅ NEW WAY - Custom Hook (Better!)
function useWindowSize() {
  const [width, setWidth] = useState(window.innerWidth);
  // ... window resize logic
  return width;
}

function Component() {
  const width = useWindowSize(); // Much cleaner!
}
```

---

## HOCs vs Other Patterns

### HOCs vs Hooks

**HOCs:**
```typescript
// Wrap component
const Enhanced = withAuth(Component);
<Enhanced />
```

**Hooks:**
```typescript
// Use inside component
function Component() {
  const auth = useAuth();
  if (!auth.isAuthenticated) return <Navigate to="/login" />;
  return <div>Content</div>;
}
```

**When to choose:**

| Feature | HOCs | Hooks |
|---------|------|-------|
| Reusable logic | ✅ Good | ✅ Better |
| Composition | ✅ Good (stacking) | ✅ Better (multiple calls) |
| Wrapper components | ✅ Perfect | ❌ Not applicable |
| Conditional logic | ✅ Clean | ✅ Clean |
| Props manipulation | ✅ Easy | ⚠️ Manual |
| Learning curve | ⚠️ Medium | ✅ Easier |

**Recommendation:** Use Hooks for most logic, HOCs for wrapping/protecting components.

### HOCs vs Render Props

**HOCs:**
```typescript
const Enhanced = withAuth(Component);
```

**Render Props:**
```typescript
<Auth>
  {({ user, isAuthenticated }) => (
    isAuthenticated ? <Component user={user} /> : <Navigate to="/login" />
  )}
</Auth>
```

**When to choose:**

- ✅ **HOC**: When logic is always the same (auth check + redirect)
- ✅ **Render Props**: When you need custom rendering logic
- ✅ **Hooks**: Modern approach for most cases

### Combining Patterns

You can combine HOCs with Hooks! Our auth HOC does exactly that:

```typescript
export function withAuth(Component) {
  return function(props) {
    // Using a hook inside an HOC!
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) return <Loading />;
    if (!isAuthenticated) return <Navigate to="/login" />;
    
    return <Component {...props} />;
  };
}
```

**Best of both worlds:**
- HOC for wrapping/protection
- Hook for accessing context

---

## Best Practices

### 1. Naming Convention

```typescript
// ✅ DO - Use "with" prefix
withAuth(Component)
withRole(Component, ['admin'])
withLoading(Component)
withErrorBoundary(Component)

// ❌ DON'T
authHOC(Component)
protectRoute(Component)
addAuth(Component)
```

### 2. Display Names

```typescript
// ✅ DO - Set display name for debugging
function withAuth(Component) {
  const WrappedComponent = (props) => {
    // ... logic
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// In React DevTools, you'll see:
// withAuth(Dashboard) instead of Anonymous
```

### 3. Copy Static Methods

```typescript
// ✅ DO - Preserve static methods
import hoistNonReactStatics from 'hoist-non-react-statics';

function withAuth(Component) {
  const WrappedComponent = (props) => {
    return <Component {...props} />;
  };
  
  // Copy static methods to wrapper
  hoistNonReactStatics(WrappedComponent, Component);
  
  return WrappedComponent;
}
```

### 4. Forward Refs

```typescript
// ✅ DO - Forward refs when needed
function withAuth(Component) {
  const WrappedComponent = forwardRef((props, ref) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) return <Navigate to="/login" />;
    
    return <Component {...props} ref={ref} />;
  });
  
  return WrappedComponent;
}
```

### 5. TypeScript Generics

```typescript
// ✅ DO - Use generics for type safety
function withAuth<P extends object>(
  Component: ComponentType<P>
): ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    // ... logic
    return <Component {...props} />;
  };
}

// Props are properly typed!
```

### 6. Don't Mutate Original Component

```typescript
// ❌ DON'T - Mutate original
function withAuth(Component) {
  Component.prototype.componentDidMount = function() {
    // This modifies the original!
  };
  return Component;
}

// ✅ DO - Return new component
function withAuth(Component) {
  return function Wrapped(props) {
    // Original component unchanged
    return <Component {...props} />;
  };
}
```

### 7. Compose HOCs

```typescript
// Multiple HOCs? Compose them!
import { compose } from 'redux'; // or use lodash/flowRight

// ✅ GOOD
const enhance = compose(
  withAuth,
  withRole(['admin']),
  withErrorBoundary,
  withAnalytics('page_view')
);

const EnhancedComponent = enhance(MyComponent);

// Same as:
// withAuth(withRole(withErrorBoundary(withAnalytics(MyComponent))))
```

---

## Common Pitfalls

### 1. Using HOCs Inside Render

```typescript
// ❌ WRONG - Creates new component every render!
function MyComponent() {
  const EnhancedComponent = withAuth(SomeComponent); // BAD!
  return <EnhancedComponent />;
}

// ✅ CORRECT - Create outside component
const EnhancedComponent = withAuth(SomeComponent);

function MyComponent() {
  return <EnhancedComponent />;
}
```

**Why it's bad:**
- New component created every render
- Loses state on every re-render
- React sees different component type
- Performance nightmare

### 2. Not Passing Props

```typescript
// ❌ WRONG - Original props lost!
function withAuth(Component) {
  return function(props) {
    const { user } = useAuth();
    return <Component user={user} />; // Where are the original props?!
  };
}

// ✅ CORRECT - Spread all props
function withAuth(Component) {
  return function(props) {
    const { user } = useAuth();
    return <Component {...props} user={user} />;
  };
}
```

### 3. Naming Collisions

```typescript
// ❌ PROBLEM - What if Component already has 'data' prop?
function withData(Component) {
  return (props) => {
    const data = fetchData();
    return <Component {...props} data={data} />; // Collision!
  };
}

// ✅ SOLUTION - Use unique names or namespacing
function withData(Component) {
  return (props) => {
    const fetchedData = fetchData();
    return <Component {...props} fetchedData={fetchedData} />;
  };
}

// Or use namespacing
function withData(Component) {
  return (props) => {
    const data = fetchData();
    return <Component {...props} withData={{ data }} />;
  };
}
```

### 4. HOC Order Matters

```typescript
// Order matters when composing!

// ❌ WRONG - Auth check happens AFTER role check
const Component = withRole(withAuth(MyComponent), ['admin']);
// Problem: Role check runs first, but user might not be authenticated!

// ✅ CORRECT - Auth check happens FIRST
const Component = withAuth(withRole(MyComponent, ['admin']));
// Good: First check auth, then check role
```

**Think of it as layers:**
```
withAuth(
  withRole(
    MyComponent  // ← Inner component
  ) // ← Second check: role
) // ← First check: authentication
```

### 5. Forgetting Loading States

```typescript
// ❌ WRONG - No loading state
function withAuth(Component) {
  return (props) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <Component {...props} />;
  };
}
// Problem: What if auth state is loading? User sees flash of redirect!

// ✅ CORRECT - Handle loading
function withAuth(Component) {
  return (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) return <Loading />;
    if (!isAuthenticated) return <Navigate to="/login" />;
    
    return <Component {...props} />;
  };
}
```

---

## TypeScript with HOCs

### Basic TypeScript HOC

```typescript
import type { ComponentType } from 'react';

// Simple HOC with types
function withSimple<P extends object>(
  Component: ComponentType<P>
): ComponentType<P> {
  return function Wrapped(props: P) {
    return <Component {...props} />;
  };
}
```

### HOC with Additional Props

```typescript
// HOC that adds props
interface WithLoadingProps {
  isLoading: boolean;
}

function withLoading<P extends object>(
  Component: ComponentType<P>
): ComponentType<P & WithLoadingProps> {
  return function Wrapped(props: P & WithLoadingProps) {
    const { isLoading, ...restProps } = props;
    
    if (isLoading) return <div>Loading...</div>;
    
    return <Component {...restProps as P} />;
  };
}

// Usage
interface MyComponentProps {
  name: string;
  age: number;
}

const MyComponent = ({ name, age }: MyComponentProps) => (
  <div>{name} - {age}</div>
);

const Enhanced = withLoading(MyComponent);

// Now Enhanced accepts: name, age, AND isLoading
<Enhanced name="John" age={30} isLoading={false} />
```

### HOC with Config Parameter

```typescript
// HOC that takes configuration
type Role = 'admin' | 'user' | 'moderator';

function withRole<P extends object>(
  Component: ComponentType<P>,
  allowedRoles: Role[]
): ComponentType<P> {
  return function RoleProtected(props: P) {
    const { user } = useAuth();
    
    if (!user || !allowedRoles.includes(user.role)) {
      return <div>Access Denied</div>;
    }
    
    return <Component {...props} />;
  };
}

// Usage
const AdminPanel = withRole(Panel, ['admin']);
const ModPanel = withRole(Panel, ['admin', 'moderator']);
```

### Complete Type-Safe Example

```typescript
import type { ComponentType } from 'react';

// Types
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

interface WithAuthProps {
  user: User;
}

// HOC that injects user prop
function withAuth<P extends object>(
  Component: ComponentType<P & WithAuthProps>
): ComponentType<Omit<P, keyof WithAuthProps>> {
  return function AuthenticatedComponent(
    props: Omit<P, keyof WithAuthProps>
  ) {
    const { user, isAuthenticated } = useAuth();
    
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" />;
    }
    
    // Add user prop
    return <Component {...props as P} user={user} />;
  };
}

// Usage
interface DashboardProps {
  title: string;
  user: User; // Will be injected by HOC
}

const Dashboard = ({ title, user }: DashboardProps) => (
  <div>
    <h1>{title}</h1>
    <p>Welcome {user.name}</p>
  </div>
);

const ProtectedDashboard = withAuth(Dashboard);

// TypeScript knows: only needs 'title', 'user' is injected!
<ProtectedDashboard title="My Dashboard" />
```

---

## Production Considerations

### 1. Error Handling

```typescript
function withAuth<P extends object>(Component: ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, error } = useAuth();

    // Handle errors
    if (error) {
      return (
        <div role="alert">
          <h2>Authentication Error</h2>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      );
    }

    if (isLoading) return <Loading />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Component {...props} />;
  };
}
```

### 2. Accessibility

```typescript
function withRole<P extends object>(
  Component: ComponentType<P>,
  allowedRoles: Role[]
) {
  return function RoleProtectedComponent(props: P) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
      return (
        <div
          role="alert"
          aria-live="polite"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem'
          }}
        >
          <h1 id="error-title">Access Denied</h1>
          <p aria-describedby="error-title">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            aria-label="Go back to previous page"
          >
            Go Back
          </button>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
```

### 3. Performance Optimization

```typescript
import { memo } from 'react';

function withAuth<P extends object>(Component: ComponentType<P>) {
  // Memoize the wrapper component
  const AuthenticatedComponent = memo(function(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <Loading />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Component {...props} />;
  });

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return AuthenticatedComponent;
}
```

### 4. Testing HOCs

```typescript
// Testing the HOC
import { render, screen } from '@testing-library/react';
import { withAuth } from './withAuth';

// Mock the useAuth hook
jest.mock('./useAuth', () => ({
  useAuth: jest.fn()
}));

describe('withAuth HOC', () => {
  const TestComponent = () => <div>Protected Content</div>;
  const ProtectedComponent = withAuth(TestComponent);

  it('shows loading state', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    });

    render(<ProtectedComponent />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects when not authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    });

    render(<ProtectedComponent />);
    // Check for redirect...
  });

  it('renders component when authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, name: 'John' }
    });

    render(<ProtectedComponent />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
```

### 5. Logging & Monitoring

```typescript
function withAuth<P extends object>(Component: ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();

    useEffect(() => {
      // Log authentication events
      if (!isLoading && !isAuthenticated) {
        console.log('[withAuth] Unauthenticated access attempt', {
          component: Component.displayName || Component.name,
          timestamp: new Date().toISOString()
        });

        // Send to monitoring service
        analytics.track('unauthenticated_access', {
          component: Component.displayName || Component.name
        });
      }
    }, [isLoading, isAuthenticated]);

    if (isLoading) return <Loading />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Component {...props} />;
  };
}
```

---

## Key Takeaways

### What You Should Remember 🎯

1. **HOCs are functions** that take a component and return a new enhanced component
2. **Perfect for cross-cutting concerns** - authentication, logging, error handling
3. **Reusability is key** - Write once, use everywhere
4. **Composition over inheritance** - Stack HOCs to combine behaviors
5. **Don't create inside render** - Always define HOCs outside components
6. **Pass all props** - Use spread operator `{...props}`
7. **TypeScript + Generics** - Type safety makes HOCs powerful
8. **Modern approach** - Combine HOCs with Hooks for best results

### When to Use HOCs vs Hooks

**Use HOCs when:**
- ✅ Wrapping components with UI (Error boundaries, layouts)
- ✅ Protecting routes (Authentication, authorization)
- ✅ Adding consistent behavior across many components
- ✅ Working with class components (legacy code)

**Use Hooks when:**
- ✅ Sharing stateful logic
- ✅ Side effects management
- ✅ Accessing context
- ✅ Building new components (modern approach)

**Use Both when:**
- ✅ HOC wraps component, Hook provides logic (like our auth example!)

### Real-World Scenarios

Our practice project demonstrates the most common real-world HOC pattern:

```typescript
// Authentication (withAuth)
- Protects ANY route requiring login
- Used by: Dashboard, Profile, Settings, etc.

// Authorization (withRole)
- Protects routes by user role
- Used by: Admin Panel, Moderator Tools, etc.

// Composition
const SuperProtected = withAuth(withRole(Component, ['admin']));
- First checks if logged in
- Then checks if user is admin
- Used by: Critical admin-only pages
```

### Practice Project Setup

To run the complete authentication demo:

```bash
# 1. Start JSON Server (Mock Backend)
npm run server
# Runs on http://localhost:3001

# 2. Start React App
npm run dev
# Runs on http://localhost:5173
```

**Test Accounts:**
- **Admin:** username: `admin`, password: `admin123`
- **User:** username: `user`, password: `user123`

**Try these scenarios:**
1. Access `/dashboard` without logging in → Redirected to login
2. Login as regular user → Try accessing `/admin` → See "Access Denied"
3. Logout and login as admin → Access everything!

---

## Summary

Higher Order Components are a powerful pattern for:
- 🔐 **Authentication & Authorization** (our project)
- 📊 **Analytics & Tracking**
- 🎨 **Theming & Styling**
- ⚠️ **Error Handling**
- 📡 **Data Fetching**

They solve the problem of **reusable logic** by letting you wrap components with behavior.

**The Pattern:**
```typescript
function withSomething(Component) {
  return function Enhanced(props) {
    // Add logic here
    return <Component {...props} />;
  };
}
```

**Modern Approach:**
Combine HOCs (for wrapping) with Hooks (for logic):

```typescript
function withAuth(Component) {
  return (props) => {
    const auth = useAuth(); // Hook for logic
    // HOC for wrapping/protection
    if (!auth.isAuthenticated) return <Navigate to="/login" />;
    return <Component {...props} />;
  };
}
```

Now go build something awesome! 🚀

---

## Production-Ready Authentication with JWT & RTK Query

### Why JWT + Refresh Tokens?

In production, authentication requires:
1. **Stateless authentication** - JWT tokens contain user data
2. **Short-lived access tokens** - Expire quickly (15 minutes) for security
3. **Long-lived refresh tokens** - Renew access tokens without re-login (7 days)
4. **Automatic token refresh** - Seamless user experience
5. **Secure storage** - localStorage for web, secure storage for mobile

### Architecture Overview

```
┌─────────────┐     Login      ┌──────────────┐
│   Client    │───────────────>│   Backend    │
│             │<───────────────│              │
│             │  Access Token  │              │
│             │  Refresh Token │              │
└─────────────┘                └──────────────┘
       │                              │
       │ API Request (Access Token)   │
       │─────────────────────────────>│
       │                              │
       │ 401 Token Expired            │
       │<─────────────────────────────│
       │                              │
       │ Refresh Request              │
       │─────────────────────────────>│
       │                              │
       │ New Access Token             │
       │<─────────────────────────────│
       │                              │
       │ Retry Original Request       │
       │─────────────────────────────>│
       │                              │
       │ Success Response             │
       │<─────────────────────────────│
```

### Step 1: Install Dependencies

```bash
cd exercises/hoc
npm install @reduxjs/toolkit react-redux jwt-decode
```

**Dependencies:**
- `@reduxjs/toolkit` - Redux + RTK Query for state management
- `react-redux` - React bindings for Redux
- `jwt-decode` - Decode JWT tokens to check expiration

### Step 2: Token Utilities

Create `src/utils/tokenUtils.ts`:

```typescript
/**
 * Token management utilities for JWT authentication
 */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Store access and refresh tokens in localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
};

/**
 * Decode JWT token payload
 */
export const decodeToken = (token: string): any => {
  try {
    // JWT format: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired (with 1 minute buffer)
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    // Check with 1 minute buffer
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime + 60;
  } catch {
    return true;
  }
};

/**
 * Generate mock JWT token for development
 * In production, this comes from your backend
 */
export const generateMockToken = (
  payload: any,
  expiresIn: number = 900 // 15 minutes default
): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };
  
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(tokenPayload));
  const signature = 'mock_signature';
  
  return `${base64Header}.${base64Payload}.${signature}`;
};
```

**Key Functions:**
- `setTokens()` - Store both tokens
- `getAccessToken()` / `getRefreshToken()` - Retrieve tokens
- `clearTokens()` - Remove all auth data
- `isTokenExpired()` - Check if token needs refresh (with 1-min buffer)
- `generateMockToken()` - Create JWT for development

### Step 3: RTK Query Auth API

Create `src/services/authApi.ts`:

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { User, LoginCredentials } from '../types/auth.types';
import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  generateMockToken,
} from '../utils/tokenUtils';

/**
 * Base query with automatic token refresh on 401
 */
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3001',
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Custom base query that handles token refresh automatically
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If 401 unauthorized, try to refresh token
  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshToken();
    
    if (refreshToken) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store new tokens and retry original request
        const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as any;
        setTokens(accessToken, newRefreshToken);
        
        // Retry the original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, clear tokens and redirect to login
        clearTokens();
        window.location.href = '/login';
      }
    } else {
      // No refresh token, redirect to login
      clearTokens();
      window.location.href = '/login';
    }
  }

  return result;
};

/**
 * Auth API with RTK Query
 */
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    /**
     * Login mutation - authenticate user and generate tokens
     */
    login: builder.mutation<
      { user: User; accessToken: string; refreshToken: string },
      LoginCredentials
    >({
      async queryFn(credentials) {
        try {
          // Query JSON Server to find user
          const response = await fetch(
            `http://localhost:3001/users?username=${credentials.username}&password=${credentials.password}`
          );

          if (!response.ok) {
            return { error: { status: response.status, data: 'Authentication failed' } };
          }

          const users = await response.json();

          if (users.length === 0) {
            return { error: { status: 401, data: 'Invalid username or password' } };
          }

          const user = users[0];
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userWithoutPassword } = user;

          // Generate JWT tokens (in production, backend generates these)
          const accessToken = generateMockToken(
            { userId: user.id, username: user.username, role: user.role },
            900 // 15 minutes
          );
          const refreshToken = generateMockToken(
            { userId: user.id, type: 'refresh' },
            604800 // 7 days
          );

          // Store tokens
          setTokens(accessToken, refreshToken);
          
          // Store user data
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));

          return {
            data: {
              user: userWithoutPassword,
              accessToken,
              refreshToken,
            },
          };
        } catch (error) {
          return { error: { status: 500, data: 'Network error' } };
        }
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Refresh token mutation - get new access token
     */
    refreshToken: builder.mutation<
      { accessToken: string; refreshToken: string },
      { refreshToken: string }
    >({
      async queryFn({ refreshToken }) {
        try {
          // In production, backend validates refresh token
          // For now, generate new tokens
          const storedUser = localStorage.getItem('user');
          if (!storedUser) {
            return { error: { status: 401, data: 'User not found' } };
          }

          const user = JSON.parse(storedUser);

          const newAccessToken = generateMockToken(
            { userId: user.id, username: user.username, role: user.role },
            900 // 15 minutes
          );
          const newRefreshToken = generateMockToken(
            { userId: user.id, type: 'refresh' },
            604800 // 7 days
          );

          setTokens(newAccessToken, newRefreshToken);

          return {
            data: {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            },
          };
        } catch (error) {
          return { error: { status: 500, data: 'Token refresh failed' } };
        }
      },
    }),

    /**
     * Logout mutation - clear all tokens
     */
    logout: builder.mutation<void, void>({
      async queryFn() {
        clearTokens();
        return { data: undefined };
      },
      invalidatesTags: ['User'],
    }),

    /**
     * Get current user - read from localStorage (already validated by token)
     */
    getCurrentUser: builder.query<User | null, void>({
      async queryFn() {
        const storedUser = localStorage.getItem('user');
        const accessToken = getAccessToken();
        
        if (storedUser && accessToken) {
          return { data: JSON.parse(storedUser) };
        }
        
        return { data: null };
      },
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi;
```

**Key Features:**
- `baseQueryWithReauth` - Automatically refreshes tokens on 401 errors
- `login` - Authenticates user, generates JWT tokens (15min access, 7day refresh)
- `refreshToken` - Generates new tokens when access token expires
- `logout` - Clears all tokens
- `getCurrentUser` - Retrieves user from localStorage

### Step 4: Redux Store Configuration

Create `src/store/store.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from '../services/authApi';

/**
 * Redux store configuration with RTK Query
 */
export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [authApi.reducerPath]: authApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Store Setup:**
- Adds `authApi` reducer to Redux store
- Configures RTK Query middleware for caching and automatic refetching
- Exports types for TypeScript

### Step 5: Update AuthContext with RTK Query

Update `src/context/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type {
  User,
  AuthContextType,
  LoginCredentials,
} from "../types/auth.types";
import { useLoginMutation, useLogoutMutation } from "../services/authApi";
import { getAccessToken, clearTokens } from "../utils/tokenUtils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // RTK Query hooks
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  // Load user from localStorage on mount and validate token
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = getAccessToken();
    
    if (storedUser && accessToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await loginMutation(credentials).unwrap();
      setUser(result.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Clear anyway
      setUser(null);
      clearTokens();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getAccessToken(),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

**Changes:**
- Uses `useLoginMutation` and `useLogoutMutation` from RTK Query
- Validates token existence on mount
- Login now uses RTK Query mutation which handles token storage
- Logout uses mutation to clear tokens properly

### Step 6: Wrap App with Redux Provider

Update `src/App.tsx`:

```typescript
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

            {/* Protected Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={<AdminPanel />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
```

**Critical:** Redux `Provider` must wrap `AuthProvider` for RTK Query to work.

### How It Works - Complete Flow

```
┌────────────────────────────────────────────────────────────┐
│ 1. User Login                                              │
├────────────────────────────────────────────────────────────┤
│ Login.tsx → useAuth().login()                             │
│   → AuthContext.tsx → loginMutation()                     │
│     → authApi.ts login endpoint                           │
│       → Query JSON Server (username/password)             │
│       → Generate JWT access token (15 min)                │
│       → Generate refresh token (7 days)                   │
│       → Store tokens: setTokens(access, refresh)          │
│       → Store user: localStorage.setItem('user', ...)     │
│       → Return { user, accessToken, refreshToken }        │
│   → AuthContext sets user state                           │
│   → Login.tsx navigates to dashboard                      │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ 2. Protected Route Access                                  │
├────────────────────────────────────────────────────────────┤
│ Dashboard.tsx (wrapped with withAuth HOC)                 │
│   → withAuth checks useAuth().isAuthenticated             │
│   → AuthContext checks: !!user && !!getAccessToken()      │
│   → If valid: render Dashboard                            │
│   → If invalid: redirect to /login                        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ 3. Token Expiration & Auto-Refresh                        │
├────────────────────────────────────────────────────────────┤
│ Any API call with expired access token                    │
│   → baseQueryWithReauth intercepts 401 error              │
│   → Gets refresh token: getRefreshToken()                 │
│   → Calls /auth/refresh with refresh token                │
│   → Generates new access token (15 min)                   │
│   → Generates new refresh token (7 days)                  │
│   → Stores new tokens: setTokens(new, new)                │
│   → Retries original API request                          │
│   → Returns successful response                           │
│                                                            │
│ If refresh fails (refresh token expired):                 │
│   → clearTokens() removes all auth data                   │
│   → Redirects to /login                                   │
│   → User must re-authenticate                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ 4. User Logout                                             │
├────────────────────────────────────────────────────────────┤
│ Navigation.tsx → useAuth().logout()                       │
│   → AuthContext.tsx → logoutMutation()                    │
│     → authApi.ts logout endpoint                          │
│       → clearTokens() removes tokens & user               │
│   → AuthContext sets user to null                         │
│   → User redirected to home page                          │
└────────────────────────────────────────────────────────────┘
```

### Token Storage Strategy

```typescript
// localStorage structure
{
  "access_token": "eyJhbGc...15min",
  "refresh_token": "eyJhbGc...7days",
  "user": "{\"id\":1,\"username\":\"admin\",\"role\":\"admin\"}"
}

// Access token payload
{
  "userId": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1704844800,  // Issued at: Jan 10, 2024
  "exp": 1704845700   // Expires: 15 minutes later
}

// Refresh token payload
{
  "userId": 1,
  "type": "refresh",
  "iat": 1704844800,  // Issued at: Jan 10, 2024
  "exp": 1705449600   // Expires: 7 days later
}
```

### Security Considerations

**✅ What This Implementation Does:**
1. **Short-lived access tokens** (15 minutes)
2. **Long-lived refresh tokens** (7 days)
3. **Automatic token refresh** on 401 errors
4. **Token validation** before each request
5. **Secure logout** clears all tokens

**⚠️ Production Enhancements Needed:**
1. **HTTPS only** - Never send tokens over HTTP
2. **HttpOnly cookies** - Store refresh tokens in HttpOnly cookies (safer than localStorage)
3. **Backend validation** - Real JWT signing and validation
4. **CSRF protection** - Add CSRF tokens for state-changing requests
5. **Rate limiting** - Limit login and refresh attempts
6. **Token rotation** - Issue new refresh token on each refresh
7. **Revocation list** - Backend maintains list of revoked tokens

### Testing the Authentication

```bash
# Terminal 1: Start JSON Server
cd exercises/hoc
npm run dev:server

# Terminal 2: Start React App
npm run dev

# Open browser: http://localhost:5173
```

**Test Scenarios:**

1. **Login as Admin:**
   - Username: `admin`, Password: `admin123`
   - Should access Dashboard, Profile, and Admin Panel
   - Check DevTools → Application → localStorage for tokens

2. **Login as User:**
   - Username: `user`, Password: `user123`
   - Should access Dashboard and Profile
   - Admin Panel should show "Access Denied"

3. **Token Expiration:**
   - Login and wait 15 minutes
   - Make an API call
   - Should automatically refresh token and continue
   - Check Network tab for refresh request

4. **Logout:**
   - Click logout
   - Tokens should be cleared from localStorage
   - Protected routes should redirect to login

### Benefits of This Architecture

**1. Separation of Concerns:**
```
tokenUtils.ts     → Token management only
authApi.ts        → API calls and token refresh
AuthContext.tsx   → User state management
withAuth.tsx      → Route protection
withRole.tsx      → Permission checking
```

**2. Reusability:**
- Token utilities work with any storage mechanism
- Auth API can be used outside React components
- HOCs can protect any component
- RTK Query handles caching automatically

**3. Type Safety:**
- Full TypeScript coverage
- Prevents token-related bugs
- IDE autocomplete for all auth operations

**4. Developer Experience:**
- No manual token management in components
- Automatic token refresh
- Clear error messages
- Easy to test and debug

**5. Production Ready:**
- Follows industry best practices
- Easy to replace mock tokens with real backend
- Scalable architecture
- Clear upgrade path

### Upgrading to Real Backend

When you have a real backend, only modify `authApi.ts`:

```typescript
// Before (Mock)
const accessToken = generateMockToken(...);

// After (Real Backend)
const response = await fetch('https://api.example.com/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});
const { accessToken, refreshToken } = await response.json();
```

Everything else stays the same! 🎉

---

## Additional Resources

- [React Docs - Higher-Order Components](https://react.dev/reference/react/Component#static-getderivedstatefromprops)
- [RTK Query - Authentication](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#automatic-re-authorization-by-extending-fetchbasequery)
- [JWT.io - JWT Debugger](https://jwt.io/)
- [Practice Project](../exercises/hoc/)
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [React Router - Protected Routes](https://reactrouter.com/en/main/start/overview)

**Next Steps:**
1. Complete the practice project
2. Try adding a new HOC (e.g., `withLogging`)
3. Implement role combinations (e.g., `['admin', 'moderator']`)
4. Build your own authentication system with a real backend
