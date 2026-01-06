# Topic 1: React Hooks Fundamentals

**Learning Approach:** Project-Based Learning  
**Practice Project:** React Hooks Playground ([exercises/01-hooks/](../exercises/01-hooks/))  
**Completion Date:** January 6, 2026

> **🎯 Learning Goal:** Master React Hooks through hands-on practice - understand WHY each hook exists, WHEN to use it, and HOW to implement it correctly in real-world scenarios.

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Core Hooks](#core-hooks)
   - [useState](#usestate)
   - [useReducer](#usereducer)
   - [useEffect](#useeffect)
   - [useRef](#useref)
   - [useLayoutEffect](#uselayouteffect)
   - [useMemo](#usememo)
   - [useCallback](#usecallback)
3. [Custom Hooks](#custom-hooks)
   - [useDebounce](#usedebounce)
   - [useLocalStorage](#uselocalstorage)
   - [useApi](#useapi)
   - [useAuth](#useauth)
4. [TypeScript Integration](#typescript-integration)
5. [Error Boundaries](#error-boundaries)
6. [Performance Optimization](#performance-optimization)
7. [Key Learnings & Best Practices](#key-learnings--best-practices)
8. [Common Pitfalls](#common-pitfalls)
9. [Practice Project Overview](#practice-project-overview)

---

## Introduction

### What Are React Hooks?

React Hooks are functions that let you "hook into" React features like state and lifecycle methods from functional components. Introduced in React 16.8, they allow you to use state and other React features without writing class components.

### Why Were Hooks Introduced?

**Problems with Class Components:**
1. 🔴 **Complex and verbose** - Lots of boilerplate (constructor, this binding)
2. 🔴 **Confusing `this` keyword** - Hard for beginners and JavaScript
3. 🔴 **Logic scattered** - Related code split across lifecycle methods
4. 🔴 **Hard to reuse logic** - Required HOCs or render props (wrapper hell)
5. 🔴 **Hard to optimize** - Difficult for compilers to optimize

**Benefits of Hooks:**
1. ✅ **Simpler components** - No classes, just functions
2. ✅ **Reusable logic** - Custom hooks extract and share logic easily
3. ✅ **Better organization** - Related code stays together
4. ✅ **Smaller bundles** - Less code to ship
5. ✅ **Easier testing** - Pure functions are easier to test

### The Rules of Hooks

**Critical:** You MUST follow these rules or your app will break:

1. ✅ **Only call hooks at the top level**
   - ❌ Don't call in loops, conditions, or nested functions
   - ✅ Always use hooks in the same order

2. ✅ **Only call hooks from React functions**
   - ✅ React function components
   - ✅ Custom hooks (must start with `use`)
   - ❌ Not from regular JavaScript functions

```typescript
// ❌ WRONG - Hook in condition
function BadComponent({ showCounter }) {
  if (showCounter) {
    const [count, setCount] = useState(0); // ERROR!
  }
}

// ✅ CORRECT - Hook at top level
function GoodComponent({ showCounter }) {
  const [count, setCount] = useState(0);
  
  if (!showCounter) return null;
  return <div>{count}</div>;
}
```

---

## Core Hooks

### useState

#### Purpose
Manages simple state in functional components. The most fundamental hook you'll use.

#### Why Use It?
Before hooks, you needed a class component to have state. `useState` makes functional components stateful, allowing them to remember and update values between renders.

#### When to Use
- ✅ Single, independent values (counter, toggle, form input)
- ✅ Simple state that doesn't depend on other state
- ✅ State that doesn't require complex update logic
- ✅ When you need component-specific data that changes over time

#### When NOT to Use
- ❌ Multiple related state values (use `useReducer` instead)
- ❌ Complex state update logic (use `useReducer` instead)
- ❌ State shared across many components (use Context or state management)
- ❌ Derived state (use `useMemo` to compute from existing state)

#### How to Use

**Implementation Reference:** [App.tsx - Counter Component](../exercises/01-hooks/src/App.tsx#L22-L36)

```typescript
const [count, setCount] = useState(0);

// Update state directly
setCount(5);

// Functional update (preferred when new state depends on previous)
setCount(prev => prev + 1);

// Multiple state variables
const [name, setName] = useState('');
const [age, setAge] = useState(0);
const [isActive, setIsActive] = useState(true);
```

#### How It Works Internally
```typescript
// Simplified internal implementation
function useState(initialValue) {
  // React stores this in a "fiber" (component instance)
  const state = getCurrentState() ?? initialValue;
  
  const setState = (newValue) => {
    // Update state and trigger re-render
    setCurrentState(newValue);
    scheduleRerender();
  };
  
  return [state, setState];
}
```

#### Best Practices

1. **Use functional updates when new state depends on previous:**
```typescript
// ❌ BAD - May use stale state in rapid updates
setCount(count + 1);

// ✅ GOOD - Always uses latest state
setCount(prev => prev + 1);
```

2. **Initialize state efficiently:**
```typescript
// ❌ BAD - Expensive calculation runs every render
const [data, setData] = useState(expensiveOperation());

// ✅ GOOD - Lazy initialization (only runs once)
const [data, setData] = useState(() => expensiveOperation());
```

3. **Don't mutate state directly:**
```typescript
// ❌ BAD - Mutating state
const [user, setUser] = useState({ name: 'John', age: 30 });
user.age = 31; // React won't detect this change

// ✅ GOOD - Create new object
setUser({ ...user, age: 31 });
setUser(prev => ({ ...prev, age: 31 })); // Even better
```

#### Common Pitfalls

❌ **Forgetting state updates are asynchronous:**
```typescript
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  console.log(count); // Still 0! State hasn't updated yet
};
```

❌ **Multiple updates in same render:**
```typescript
// This will only increment by 1, not 3
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);

// ✅ Use functional updates
setCount(prev => prev + 1);
setCount(prev => prev + 1);
setCount(prev => prev + 1); // Now increments by 3
```

---

### useReducer

#### Purpose
Manages complex state with multiple related values and actions. Think of it as `useState` on steroids.

#### Why Use It?
When state logic becomes complex (multiple related values, many ways to update), `useState` becomes messy. `useReducer` organizes updates into actions, making state changes predictable and testable.

#### When to Use
- ✅ State has multiple sub-values that need coordinated updates
- ✅ Next state depends on previous state in complex ways
- ✅ Many different ways to update state
- ✅ State update logic is complex enough to test separately
- ✅ Want to make state changes more predictable and traceable

#### When NOT to Use
- ❌ Simple, independent state values (use `useState`)
- ❌ Only one or two ways to update state
- ❌ Updates don't depend on previous state

#### How to Use

**Implementation Reference:** [App.tsx - Settings Panel](../exercises/01-hooks/src/App.tsx#L66-L174)

```typescript
// 1. Define state shape
interface SettingsState {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'sans-serif' | 'serif' | 'monospace';
}

// 2. Define all possible actions
type SettingsAction =
  | { type: 'CHANGE_THEME'; payload: 'light' | 'dark' }
  | { type: 'CHANGE_FONT_SIZE'; payload: 'small' | 'medium' | 'large' }
  | { type: 'CHANGE_FONT_FAMILY'; payload: 'sans-serif' | 'serif' | 'monospace' }
  | { type: 'RESET' };

// 3. Create reducer function (pure function)
function settingsReducer(
  state: SettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case 'CHANGE_THEME':
      return { ...state, theme: action.payload };
    case 'CHANGE_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'CHANGE_FONT_FAMILY':
      return { ...state, fontFamily: action.payload };
    case 'RESET':
      return initialSettings;
    default:
      return state;
  }
}

// 4. Use in component
const initialSettings: SettingsState = {
  theme: 'light',
  fontSize: 'medium',
  fontFamily: 'sans-serif',
};

function SettingsPanel() {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  return (
    <>
      <button onClick={() => dispatch({ type: 'CHANGE_THEME', payload: 'dark' })}>
        Dark Theme
      </button>
      <button onClick={() => dispatch({ type: 'RESET' })}>
        Reset All
      </button>
    </>
  );
}
```

#### useState vs useReducer: When to Choose

| Scenario | Use useState | Use useReducer |
|----------|--------------|----------------|
| Single value | ✅ | ❌ |
| Multiple related values | ❌ | ✅ |
| Simple updates | ✅ | ❌ |
| Complex update logic | ❌ | ✅ |
| State depends on previous | Either | ✅ Cleaner |
| Need to test update logic | ❌ | ✅ |
| Multiple ways to update | ❌ | ✅ |

#### Best Practices

1. **Reducer must be pure (no side effects):**
```typescript
// ❌ BAD - Side effects in reducer
function reducer(state, action) {
  if (action.type === 'ADD_TODO') {
    saveTodoToAPI(action.payload); // NO! Side effect
    return { ...state, todos: [...state.todos, action.payload] };
  }
}

// ✅ GOOD - Side effects in useEffect
function Component() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    saveTodoToAPI(state.todos); // Side effects here
  }, [state.todos]);
}
```

2. **Use TypeScript discriminated unions for actions:**
```typescript
// ✅ TypeScript knows payload type based on action.type
type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_AGE'; payload: number }
  | { type: 'RESET' }; // No payload

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_NAME':
      // TypeScript knows payload is string here
      return { ...state, name: action.payload };
    case 'SET_AGE':
      // TypeScript knows payload is number here
      return { ...state, age: action.payload };
  }
}
```

3. **Action types as constants:**
```typescript
const ACTIONS = {
  ADD_TODO: 'ADD_TODO',
  REMOVE_TODO: 'REMOVE_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
} as const;

dispatch({ type: ACTIONS.ADD_TODO, payload: newTodo });
```

---

### useEffect

#### Purpose
Performs side effects in functional components. The Swiss Army knife of hooks for anything that "affects the outside world."

#### Why Use It?
Functional components are pure by default - they should only return JSX. But real apps need to do impure things: fetch data, subscribe to events, manipulate DOM. `useEffect` is your escape hatch for these side effects.

#### What Are Side Effects?

**Side effects** are operations that affect something outside the component:
- 🌐 API calls / data fetching
- ⏰ Timers (setTimeout, setInterval)
- 📡 Subscriptions (WebSocket, event listeners)
- 📝 DOM manipulation
- 💾 localStorage / sessionStorage
- 📊 Analytics / logging
- 🖨️ Printing / downloads

#### When to Use
- ✅ Fetching data when component mounts
- ✅ Setting up subscriptions or event listeners
- ✅ Running timers or intervals
- ✅ Synchronizing with external systems
- ✅ Cleaning up resources when component unmounts
- ✅ Reacting to prop/state changes

#### When NOT to Use
- ❌ Transforming data for rendering (use regular variables or `useMemo`)
- ❌ Event handlers (use regular functions)
- ❌ Initializing state (use `useState` initializer)
- ❌ Updating state based on other state (do it in event handler)

#### How to Use

**Implementation Reference:** [App.tsx - Timer Component](../exercises/01-hooks/src/App.tsx#L180-L223)

```typescript
useEffect(() => {
  // Effect code runs after render
  
  return () => {
    // Cleanup runs before next effect and on unmount
  };
}, [dependencies]); // When to re-run effect
```

#### The Three Forms of useEffect

**1. Run once on mount (empty dependency array):**
```typescript
useEffect(() => {
  console.log('Component mounted');
  fetchUserData();
  
  return () => {
    console.log('Component unmounting');
  };
}, []); // Empty array = run once
```

**2. Run when dependencies change:**
```typescript
useEffect(() => {
  console.log(`User ID changed to: ${userId}`);
  fetchUserData(userId);
}, [userId]); // Re-run when userId changes
```

**3. Run after every render (no dependency array):**
```typescript
useEffect(() => {
  console.log('Component rendered');
  // Usually wrong! Causes infinite loops
}); // No array = run every render (rarely needed)
```

#### The Cleanup Function: Critical for Preventing Memory Leaks

**Why cleanup is essential:**
- ⚠️ Without cleanup: timers keep running after unmount → memory leak
- ⚠️ Without cleanup: event listeners pile up → performance degradation
- ⚠️ Without cleanup: setState on unmounted component → React warnings/errors

**Example: Timer with Cleanup**
```typescript
useEffect(() => {
  let intervalId: number;

  if (isRunning) {
    intervalId = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }

  // Cleanup: Clear interval when component unmounts or isRunning changes
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log('Cleaned up interval');
    }
  };
}, [isRunning]);
```

**Example: Event Listener with Cleanup**
```typescript
useEffect(() => {
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  window.addEventListener('resize', handleResize);

  // Cleanup: Remove event listener
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []); // Empty array = setup once, cleanup on unmount
```

**Example: Fetch with Cleanup (Prevent Memory Leaks)**
```typescript
useEffect(() => {
  let isMounted = true; // Flag to track if component is mounted

  const fetchData = async () => {
    const result = await fetch('/api/data');
    const data = await result.json();
    
    // Only update state if still mounted
    if (isMounted) {
      setData(data);
    }
  };

  fetchData();

  // Cleanup: Set flag to false
  return () => {
    isMounted = false;
  };
}, []);
```

#### Dependency Array: The Source of All Bugs

**Rule:** Include ALL values from component scope that the effect uses.

```typescript
// ❌ BAD - Missing dependency
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`) // Uses 'query'
      .then(r => r.json())
      .then(setResults);
  }, []); // But doesn't list it! BUG!
  
  // Effect uses stale 'query' value
}

// ✅ GOOD - All dependencies listed
useEffect(() => {
  fetch(`/api/search?q=${query}`)
    .then(r => r.json())
    .then(setResults);
}, [query]); // Now re-fetches when query changes
```

**Use ESLint plugin:**
```json
// .eslintrc
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/exhaustive-deps": "error"
  }
}
```

#### Best Practices

1. **Each effect should do ONE thing:**
```typescript
// ❌ BAD - Multiple concerns in one effect
useEffect(() => {
  fetchUserData();
  setupWebSocket();
  trackAnalytics();
}, []);

// ✅ GOOD - Separate effects
useEffect(() => {
  fetchUserData();
}, []);

useEffect(() => {
  const ws = setupWebSocket();
  return () => ws.close();
}, []);

useEffect(() => {
  trackAnalytics('page_view');
}, []);
```

2. **Don't lie about dependencies:**
```typescript
// ❌ BAD - Lying to satisfy linter
useEffect(() => {
  fetchData(userId, filters);
}, [userId]); // Missing 'filters'! Stale closure bug

// ✅ GOOD - Be honest
useEffect(() => {
  fetchData(userId, filters);
}, [userId, filters]);

// ✅ ALSO GOOD - Use useCallback/useMemo to stabilize references
const fetchDataCallback = useCallback(() => {
  fetchData(userId, filters);
}, [userId, filters]);

useEffect(() => {
  fetchDataCallback();
}, [fetchDataCallback]);
```


// ✅ GOOD - Stable primitives
const url = '/api';
const method = 'GET';
useEffect(() => {
  fetch(url, { method });
}, [url, method]); // Strings are stable

// ✅ ALSO GOOD - useMemo for stable reference
const config = useMemo(() => ({ url: '/api', method: 'GET' }), []);
useEffect(() => {
  fetch(config.url);
}, [config]);
```

#### Common useEffect Patterns

**Pattern 1: Fetch Data on Mount**
```typescript
useEffect(() => {
  let ignore = false;

  async function fetchData() {
    const response = await fetch('/api/data');
    const data = await response.json();
    if (!ignore) {
      setData(data);
    }
  }

  fetchData();

  return () => { ignore = true; }; // Ignore results if component unmounts
}, []);
```

**Pattern 2: Subscribe to External Store**
```typescript
useEffect(() => {
  const subscription = externalStore.subscribe((data) => {
    setData(data);
  });

  return () => subscription.unsubscribe();
}, []);
```

**Pattern 3: Update Document Title**
```typescript
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```

---

### useRef

#### Purpose
Provides a mutable reference that persists across renders without causing re-renders. Used for accessing DOM elements directly and storing mutable values.

#### Why Use It?
`useRef` gives you two superpowers:
1. **Direct DOM access** - Focus inputs, measure elements, integrate with third-party libraries
2. **Persistent storage** - Store values that persist between renders but don't trigger re-renders when changed

#### When to Use
- ✅ Accessing and manipulating DOM elements (focus, scroll, measure)
- ✅ Storing mutable values that shouldn't trigger re-renders (timers, intervals, previous values)
- ✅ Keeping track of previous state/props
- ✅ Storing references to third-party library instances
- ✅ Counting renders without causing infinite loops

#### When NOT to Use
- ❌ When you need the component to re-render on value change (use `useState`)
- ❌ For derived state or computed values (use `useMemo`)
- ❌ As a replacement for proper state management

#### How to Use

**Implementation Reference:** [App.tsx - Ref Demo](../exercises/01-hooks/src/App.tsx)

```typescript
import { useRef, useEffect } from 'react';

// Use Case 1: DOM Access
function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFocus = () => {
    // Access DOM element directly
    inputRef.current?.focus();
    inputRef.current?.select();
  };
  
  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>Focus Input</button>
    </>
  );
}

// Use Case 2: Store Mutable Values
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number>();
  
  useEffect(() => {
    // Store interval ID in ref
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    return () => {
      // Clear using stored ref
      clearInterval(intervalRef.current);
    };
  }, []);
  
  return <div>{seconds} seconds</div>;
}

// Use Case 3: Track Previous Value
function Counter() {
  const [count, setCount] = useState(0);
  const previousCountRef = useRef<number>();
  
  useEffect(() => {
    // Update ref after render (doesn't cause re-render)
    previousCountRef.current = count;
  }, [count]);
  
  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCountRef.current}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Use Case 4: Count Renders (Without Causing Re-render)
function RenderCounter() {
  const renderCount = useRef(0);
  
  // This doesn't cause re-render!
  renderCount.current = renderCount.current + 1;
  
  return <div>Renders: {renderCount.current}</div>;
}
```

#### How It Works Internally

```typescript
// Simplified internal implementation
function useRef<T>(initialValue: T): { current: T } {
  // React stores this in the component's fiber
  const ref = { current: initialValue };
  
  // Returns same object on every render
  // Mutating .current doesn't trigger re-render
  return ref;
}
```

#### useRef vs useState: Key Differences

| Feature | useRef | useState |
|---------|--------|----------|
| Triggers re-render | ❌ No | ✅ Yes |
| Mutable | ✅ Yes (.current) | ❌ No (need setState) |
| Persists across renders | ✅ Yes | ✅ Yes |
| Use for UI values | ❌ No | ✅ Yes |
| Use for DOM access | ✅ Yes | ❌ No |
| Use for timers/intervals | ✅ Yes | ❌ No |

#### Best Practices

1. **Check for null before accessing DOM refs:**
```typescript
// ❌ BAD - Might be null
inputRef.current.focus();

// ✅ GOOD - Safe access
inputRef.current?.focus();

if (inputRef.current) {
  inputRef.current.focus();
}
```

2. **Don't read/write refs during rendering:**
```typescript
// ❌ BAD - Reading ref during render
function Component() {
  const renderCount = useRef(0);
  renderCount.current++; // Technically works but not recommended
  
  return <div>Count: {renderCount.current}</div>;
}

// ✅ GOOD - Update in useEffect
function Component() {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
  });
  
  return <div>Count: {renderCount.current}</div>;
}
```

3. **Use refs for imperative, not declarative code:**
```typescript
// ❌ BAD - Declarative (use state)
function Component() {
  const countRef = useRef(0);
  return (
    <button onClick={() => countRef.current++}>
      Count: {countRef.current}
    </button>
  );
}

// ✅ GOOD - Imperative DOM manipulation
function Component() {
  const divRef = useRef<HTMLDivElement>(null);
  
  const changeColor = () => {
    if (divRef.current) {
      divRef.current.style.backgroundColor = 'red';
    }
  };
  
  return <div ref={divRef} onClick={changeColor}>Click me</div>;
}
```

#### Common Pitfalls

❌ **Expecting re-render when ref changes:**
```typescript
const countRef = useRef(0);
countRef.current++; // Component won't re-render!
```

❌ **Using ref for state that should trigger UI updates:**
```typescript
// ❌ WRONG - UI won't update
const [items] = useState([]);
const countRef = useRef(0);

const addItem = () => {
  countRef.current++; // Count updates but UI doesn't!
};

// ✅ RIGHT - Use state
const [count, setCount] = useState(0);
const addItem = () => setCount(c => c + 1);
```

---

### useLayoutEffect

#### Purpose
Similar to `useEffect`, but runs synchronously after DOM mutations and before the browser paints. Used for reading layout and synchronously re-rendering.

#### Why Use It?
`useEffect` runs asynchronously *after* the browser paints, which can cause visual flickering. `useLayoutEffect` runs *before* paint, allowing you to measure and adjust the DOM without the user seeing any flicker.

#### When to Use
- ✅ Measuring DOM elements (width, height, position)
- ✅ Positioning tooltips, popovers, or modals based on other elements
- ✅ Preventing visual flicker or "jumps"
- ✅ Synchronizing with third-party libraries that manipulate DOM
- ✅ Animations that need to start before paint

#### When NOT to Use
- ❌ Data fetching (use `useEffect`)
- ❌ Subscriptions or event listeners (use `useEffect`)
- ❌ Any side effect that doesn't need to block paint
- ❌ When there's no visual difference (useEffect is faster)

#### How to Use

**Implementation Reference:** [App.tsx - Layout Effect Demo](../exercises/01-hooks/src/App.tsx)

```typescript
import { useState, useEffect, useLayoutEffect, useRef } from 'react';

// Measuring DOM elements
function Tooltip() {
  const [height, setHeight] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // ✅ useLayoutEffect - Measures BEFORE paint (no flicker)
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, []);
  
  return (
    <div 
      ref={tooltipRef}
      style={{ top: `${height}px` }} // Positioned correctly on first paint
    >
      Tooltip content
    </div>
  );
}

// Preventing flicker
function AnimatedComponent() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  
  // ✅ Runs synchronously before paint
  useLayoutEffect(() => {
    if (elementRef.current) {
      // Animate from here without flicker
      elementRef.current.style.transform = 'translateX(0)';
    }
  }, [isVisible]);
  
  return <div ref={elementRef}>Content</div>;
}
```

#### useEffect vs useLayoutEffect: Timing Comparison

**useEffect (Asynchronous):**
```
1. React renders component
2. Browser paints to screen
3. useEffect runs
4. If state changes → re-render → paint again
   ⚠️ User sees flicker/jump
```

**useLayoutEffect (Synchronous):**
```
1. React renders component
2. useLayoutEffect runs (blocks painting)
3. If state changes → React updates immediately
4. Browser paints to screen (only once)
   ✅ No flicker!
```

#### Visual Comparison

```typescript
function ComparisonDemo() {
  const [show, setShow] = useState(false);
  const [height, setHeight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  
  // ❌ useEffect - May see flicker
  useEffect(() => {
    if (show && boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setHeight(rect.height); // Re-render after paint = flicker
    }
  }, [show]);
  
  // ✅ useLayoutEffect - No flicker
  useLayoutEffect(() => {
    if (show && boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setHeight(rect.height); // Update before paint = smooth
    }
  }, [show]);
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && (
        <div ref={boxRef}>
          Content with dynamic height
          <p>Measured height: {height}px</p>
        </div>
      )}
    </div>
  );
}
```

#### Best Practices

1. **Prefer useEffect unless you have a specific reason:**
```typescript
// ✅ Most cases: Use useEffect
useEffect(() => {
  fetchData(); // Doesn't need to block paint
}, []);

// ✅ Only when needed: Use useLayoutEffect
useLayoutEffect(() => {
  const rect = element.getBoundingClientRect(); // Needs synchronous read
  positionTooltip(rect);
}, []);
```

2. **Be aware of performance implications:**
```typescript
// ⚠️ useLayoutEffect blocks painting
// Keep it fast!
useLayoutEffect(() => {
  // ❌ BAD - Expensive operation
  for (let i = 0; i < 1000000; i++) {
    // Heavy computation
  }
}, []);

// ✅ GOOD - Quick DOM measurements only
useLayoutEffect(() => {
  const height = element.getBoundingClientRect().height;
  setHeight(height);
}, []);
```

3. **Use for measurements, not side effects:**
```typescript
// ❌ WRONG - Use useEffect for this
useLayoutEffect(() => {
  const subscription = subscribe();
  return () => unsubscribe();
}, []);

// ✅ RIGHT - Measurements that affect layout
useLayoutEffect(() => {
  const { width, height } = element.getBoundingClientRect();
  updateTooltipPosition(width, height);
}, []);
```

#### Common Pitfalls

❌ **Using it when useEffect would work:**
```typescript
// ❌ Unnecessary - doesn't affect layout
useLayoutEffect(() => {
  console.log('Component mounted');
}, []);

// ✅ Use useEffect instead
useEffect(() => {
  console.log('Component mounted');
}, []);
```

❌ **Slow synchronous operations:**
```typescript
// ❌ BAD - Blocks painting for too long
useLayoutEffect(() => {
  // Heavy computation or API call
  const data = expensiveSync Operation();
  updateState(data);
}, []);

// ✅ GOOD - Use useEffect for async work
useEffect(() => {
  fetchData().then(updateState);
}, []);
```

#### Server-Side Rendering Warning

⚠️ **useLayoutEffect doesn't run on the server:**

```typescript
// Warning in console during SSR:
// "useLayoutEffect does nothing on the server"

// Solution: Use useEffect for SSR-compatible code
// Or conditionally use based on environment
const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
```

---

### useMemo

#### Purpose
Memoizes (caches) expensive computed values to prevent unnecessary recalculations on every render.

#### Why Use It?
React components re-render frequently (parent render, state change, props change). If you have expensive calculations in your component, they'll run on every render - even when their inputs haven't changed. `useMemo` caches the result and only recalculates when dependencies change.

#### When to Use
- ✅ Expensive calculations (filtering 10,000+ items, complex math, data transformations)
- ✅ Preventing unnecessary child re-renders (when passing objects/arrays as props)
- ✅ Calculations that run frequently but have stable inputs
- ✅ When you've measured and confirmed a performance issue

#### When NOT to Use
- ❌ Simple calculations (addition, string concatenation)
- ❌ Premature optimization (measure first!)
- ❌ Values that change on every render anyway
- ❌ When memoization overhead > calculation cost

#### How to Use

**Implementation Reference:** [App.tsx - List Filter Component](../exercises/01-hooks/src/App.tsx#L229-L312)

```typescript
// Expensive: Generate 10,000 items - only compute once
const largeList = useMemo(() => {
  console.log('🔵 Generating large list (expensive!)');
  return Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    category: i % 2 === 0 ? 'Electronics' : 'Books',
  }));
}, []); // Empty deps = compute only once on mount

// Expensive: Filter large list - recompute only when filter changes
const filteredList = useMemo(() => {
  console.log('🟢 Filtering list (expensive!)');
  return largeList.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
}, [largeList, filter]); // Recompute only when these change

return (
  <>
    <input value={filter} onChange={e => setFilter(e.target.value)} />
    <p>Showing {filteredList.length} of {largeList.length} items</p>
    {filteredList.slice(0, 100).map(item => <div key={item.id}>{item.name}</div>)}
  </>
);
```

#### Performance Impact Demo

**Check the console when running the practice code:**

1. Change the filter input → See "🟢 Filtering list" (expected - filter changed)
2. Click unrelated button → No "🟢 Filtering list" (memoized!)
3. **Without useMemo:** Would see "🟢 Filtering list" on EVERY render

#### useMemo vs Regular Variable

```typescript
// ❌ Without useMemo - Recalculates on EVERY render
function Component() {
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState('');
  
  // This runs every time count OR filter changes (wasteful!)
  const expensiveResult = expensiveCalculation(filter);
  
  return <div>{expensiveResult}</div>;
}

// ✅ With useMemo - Recalculates only when filter changes
function Component() {
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState('');
  
  // Only recalculates when filter changes
  const expensiveResult = useMemo(
    () => expensiveCalculation(filter),
    [filter]
  );
  
  return <div>{expensiveResult}</div>;
}
```

#### Preventing Child Re-renders

**useMemo for stable object/array references:**

```typescript
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // ❌ BAD - New object on every render → ChildComponent re-renders
  const user = { name: 'John', age: 30 };
  
  // ✅ GOOD - Same object reference unless dependencies change
  const user = useMemo(() => ({ name: 'John', age: 30 }), []);
  
  return <ChildComponent user={user} />;
}

// Child only re-renders when user actually changes
const ChildComponent = memo(({ user }) => {
  console.log('Child rendered');
  return <div>{user.name}</div>;
});
```

#### Best Practices

1. **Measure before optimizing:**
```typescript
// Use React DevTools Profiler to measure render time
// Only add useMemo if you see a real performance issue
```

2. **Don't memoize everything:**
```typescript
// ❌ Unnecessary - Simple calculation
const sum = useMemo(() => a + b, [a, b]);

// ✅ Just use a variable
const sum = a + b;
```

3. **Memoize expensive dependencies in useEffect:**
```typescript
const expensiveValue = useMemo(() => calculateExpensiveValue(input), [input]);

useEffect(() => {
  // This only runs when expensiveValue actually changes
  doSomethingWith(expensiveValue);
}, [expensiveValue]);
```

---

### useCallback

#### Purpose
Memoizes (caches) function definitions to prevent creating new function instances on every render.

#### Why Use It?
In JavaScript, `() => {}` creates a NEW function on every render. When passing callbacks to child components, this new reference causes unnecessary re-renders (even if the child is memoized). `useCallback` returns the same function reference between renders.

#### When to Use
- ✅ Passing callbacks to memoized child components (with `React.memo`)
- ✅ Functions used as dependencies in `useEffect`, `useMemo`, or other hooks
- ✅ Functions passed to many child components
- ✅ Functions that have expensive closures

#### When NOT to Use
- ❌ Simple event handlers not passed to children
- ❌ Functions that change on every render anyway
- ❌ Premature optimization (if child isn't memoized)
- ❌ When the overhead of useCallback > benefit

#### How to Use

**Implementation Reference:** [App.tsx - Parent-Child Memo Demo](../exercises/01-hooks/src/App.tsx#L318-L379)

```typescript
// Child component wrapped in React.memo - only re-renders when props change
const MemoizedChild = memo(({ name, onButtonClick }: ChildProps) => {
  console.log(`🔴 ${name} child rendered`);
  return (
    <div>
      <h4>{name}</h4>
      <button onClick={onButtonClick}>Click Me</button>
    </div>
  );
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ WITHOUT useCallback - Function recreated every render
  // const handleClick = () => { console.log('Clicked!'); };
  // Parent count changes → New function → Child re-renders (unnecessary!)

  // ✅ WITH useCallback - Same function reference
  const handleClick = useCallback(() => {
    console.log('Button clicked!');
  }, []); // Empty deps = never changes

  // Function that depends on state
  const handleClickWithCount = useCallback(() => {
    console.log(`Count is: ${count}`);
  }, [count]); // Recreated only when count changes

  return (
    <>
      <p>Parent count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <input value={text} onChange={e => setText(e.target.value)} />
      
      {/* Child won't re-render when count/text changes! */}
      <MemoizedChild name="Child 1" onButtonClick={handleClick} />
      <MemoizedChild name="Child 2" onButtonClick={handleClickWithCount} />
    </>
  );
}
```

#### Performance Impact Demo

**Check the console when running the practice code:**

1. Change parent state (count) → Child doesn't re-render ✅
2. Change parent state (text input) → Child doesn't re-render ✅
3. **Without useCallback:** Every parent render → Child re-renders (even though nothing changed for the child)

#### useCallback vs useMemo

They're related but serve different purposes:

```typescript
// useCallback memoizes the FUNCTION
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);

// Equivalent to:
const handleClick = useMemo(() => {
  return () => console.log('clicked');
}, []);

// useMemo memoizes the RESULT of calling a function
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(input);
}, [input]);
```

**Rule of thumb:**
- `useCallback(fn, deps)` = memoize function
- `useMemo(() => value, deps)` = memoize value

#### Best Practices

1. **Only useful with React.memo:**
```typescript
// ❌ Pointless - Child not memoized, will re-render anyway
const Child = ({ onClick }) => <button onClick={onClick}>Click</button>;

function Parent() {
  const handleClick = useCallback(() => console.log('clicked'), []);
  return <Child onClick={handleClick} />;
}

// ✅ Useful - Child memoized, won't re-render unnecessarily
const Child = memo(({ onClick }) => <button onClick={onClick}>Click</button>);

function Parent() {
  const handleClick = useCallback(() => console.log('clicked'), []);
  return <Child onClick={handleClick} />;
}
```

2. **Include all dependencies:**
```typescript
function Component() {
  const [count, setCount] = useState(0);

  // ❌ BAD - Using count but not in dependencies (stale closure)
  const handleClick = useCallback(() => {
    console.log(count); // Always logs 0!
  }, []);

  // ✅ GOOD - Count in dependencies
  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]); // Recreated when count changes
}
```

3. **Use for functions in dependencies:**
```typescript
function Component() {
  const [data, setData] = useState(null);

  // Stable function reference
  const fetchData = useCallback(async () => {
    const result = await fetch('/api/data');
    setData(await result.json());
  }, []);

  useEffect(() => {
    fetchData(); // Safe to use as dependency
  }, [fetchData]);
}
```

#### Common Pattern: Event Handlers with State

```typescript
function TodoList() {
  const [todos, setTodos] = useState([]);

  // This function needs todos in closure
  const handleToggle = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  }, []); // Empty deps! Using functional update to avoid depending on todos

  return (
    <>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle} // Stable reference
        />
      ))}
    </>
  );
}
```

---

## Custom Hooks

### What Are Custom Hooks?

Custom hooks are regular JavaScript functions that:
1. Start with `use` (e.g., `useAuth`, `useDebounce`)
2. Can call other hooks
3. Return anything you want (values, functions, objects)
4. Extract and reuse stateful logic between components

#### Why Create Custom Hooks?

**Problems they solve:**
- 🔴 Duplicated logic across components
- 🔴 Complex components with mixed concerns
- 🔴 Hard to test logic mixed with UI
- 🔴 Difficult to share logic without HOCs/render props

**Benefits:**
- ✅ Extract reusable logic
- ✅ Separate concerns (logic vs UI)
- ✅ Easier testing (test hook independently)
- ✅ Composition over inheritance
- ✅ Share logic across components

---

### useDebounce

#### Purpose
Delays updating a value until the user stops changing it for a specified time. Essential for optimizing search inputs and API calls.

#### Why Use It?
Without debouncing, every keystroke triggers an action (API call, calculation). If user types "react", that's 5 API calls for "r", "re", "rea", "reac", "react". With debouncing: 1 API call after user stops typing.

#### When to Use
- ✅ Search inputs / autocomplete
- ✅ Form validation that requires API calls
- ✅ Any input that triggers expensive operations
- ✅ Resize / scroll event handlers
- ✅ Auto-save functionality

#### When NOT to Use
- ❌ Instant feedback needed (button clicks)
- ❌ Simple local operations
- ❌ Time-sensitive updates

#### How to Use

**Implementation Reference:** [useDebounce.ts](../exercises/01-hooks/src/custom-hooks/useDebounce.ts)

```typescript
import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * Delays updating a value until after a specified delay.
 * Useful for optimizing API calls from search inputs.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timeout to update the debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Cancel the timeout if value changes before delay completes
    // This is the "debouncing" - only the last timeout completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### How It Works Internally

```
User types "r"     → setTimeout(500ms) started
User types "re"    → Previous timeout canceled, new setTimeout(500ms) started
User types "rea"   → Previous timeout canceled, new setTimeout(500ms) started  
User types "reac"  → Previous timeout canceled, new setTimeout(500ms) started
User types "react" → Previous timeout canceled, new setTimeout(500ms) started
[User stops typing]
Wait 500ms...
→ debouncedValue updates to "react"
→ API call triggered
```

#### Usage in Practice

**Implementation Reference:** [App.tsx - CustomHooksDemo](../exercises/01-hooks/src/App.tsx#L385-L549)

```typescript
function SearchComponent() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // This only runs 500ms after user stops typing
      console.log('🔍 API call would happen now for:', debouncedSearch);
      fetchSearchResults(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <div>
      <input
        type="text"
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        placeholder="Search..."
      />
      <p>Searching for: {debouncedSearch}</p>
    </div>
  );
}
```

#### Performance Impact

| Scenario | Without Debounce | With Debounce (500ms) |
|----------|------------------|----------------------|
| User types "react" (5 keystrokes) | 5 API calls | 1 API call |
| User types then deletes (10 keystrokes) | 10 API calls | 1 API call |
| User types, pauses, types more | Many API calls | 2 API calls |

**Savings:** 80-90% reduction in API calls!

---

### useLocalStorage

#### Purpose
Synchronizes React state with localStorage, automatically persisting data across page reloads and browser sessions.

#### Why Use It?
localStorage is browser storage that persists between sessions. But manually syncing it with React state is error-prone. This hook makes it work exactly like `useState`, but with automatic persistence.

#### When to Use
- ✅ User preferences (theme, language, font size)
- ✅ Form drafts (save user input)
- ✅ "Remember me" functionality
- ✅ Shopping cart (without backend)
- ✅ Recently viewed items
- ✅ User settings

#### When NOT to Use
- ❌ Sensitive data (passwords, tokens) - Use secure storage
- ❌ Large amounts of data (> 5MB limit)
- ❌ Data that should sync across devices (use backend)
- ❌ Temporary state (just use useState)

#### How to Use

**Implementation Reference:** [useLocalStorage.ts](../exercises/01-hooks/src/custom-hooks/useLocalStorage.ts)

```typescript
import { useState } from 'react';

/**
 * useLocalStorage Hook
 * 
 * Syncs state with localStorage. Works like useState but persists data.
 * 
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns [value, setValue] tuple like useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Wrapped setValue that also updates localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function (like useState)
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;

      // Update React state
      setStoredValue(valueToStore);

      // Update localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

#### Usage in Practice

**Implementation Reference:** [App.tsx - CustomHooksDemo](../exercises/01-hooks/src/App.tsx#L385-L549)

```typescript
function ThemeSettings() {
  // Works exactly like useState, but persists!
  const [theme, setTheme] = useLocalStorage('app-theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('font-size', 16);
  const [username, setUsername] = useLocalStorage('username', '');

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme (Current: {theme})
      </button>

      <input
        type="number"
        value={fontSize}
        onChange={e => setFontSize(Number(e.target.value))}
      />

      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Your name"
      />

      <p>Reload the page - your settings persist!</p>
    </div>
  );
}
```

#### Testing localStorage Persistence

1. Change theme to "dark"
2. Change font size to 20
3. Reload the page → Settings persist! ✅
4. Open DevTools → Application → Local Storage → See the stored values

#### Best Practices

1. **Use unique keys:**
```typescript
// ❌ Generic key - might conflict
const [theme, setTheme] = useLocalStorage('theme', 'light');

// ✅ App-specific key
const [theme, setTheme] = useLocalStorage('myapp-theme', 'light');
```

2. **Handle errors gracefully:**
```typescript
// The hook already handles errors, but you can add error state:
const [theme, setTheme, error] = useLocalStorageWithError('theme', 'light');

if (error) {
  return <div>Failed to load settings</div>;
}
```

3. **Be mindful of storage limits:**
```typescript
// localStorage typically limited to ~5MB
// Don't store huge objects
const [data, setData] = useLocalStorage('large-data', hugeObject); // ⚠️
```

---

### useApi

#### Purpose
Fetches data from REST APIs and manages loading, error, and success states. Provides a clean pattern for data fetching in React.

#### Why Use It?
Every app needs to fetch data from APIs. Without a standard pattern, you end up with:
- 🔴 Duplicated fetch logic in every component
- 🔴 Inconsistent loading/error handling
- 🔴 Race conditions (old requests completing after new ones)
- 🔴 Memory leaks (setting state on unmounted components)

This hook provides a clean, reusable pattern that handles all these concerns.

#### When to Use
- ✅ Fetching data from REST APIs on component mount
- ✅ Need consistent loading/error state management
- ✅ Want to avoid code duplication
- ✅ Simple GET requests without complex caching

#### When NOT to Use
- ❌ Complex data requirements (use React Query, SWR, or Apollo)
- ❌ Need caching, refetching, mutations (use React Query/SWR)
- ❌ GraphQL APIs (use Apollo Client/urql)
- ❌ Real-time data (use WebSocket hooks)

#### How to Use

**Implementation Reference:** [useApi.ts](../exercises/01-hooks/src/custom-hooks/useApi.ts)

```typescript
import { useState, useEffect } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useApi<T>(url: string): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true; // Prevent setting state on unmounted component

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup: Prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, [url]); // Re-fetch when URL changes

  return { data, isLoading, error };
}
```

#### Usage in Practice

**Implementation Reference:** [App.tsx - CustomHooksDemo](../exercises/01-hooks/src/App.tsx#L385-L549)

```typescript
import { useApi } from './custom-hooks';
import { getApiUrl, API_CONFIG } from './config/api';
import type { User } from './types';

function UsersList() {
  const { 
    data: users, 
    isLoading, 
    error 
  } = useApi<User[]>(getApiUrl(API_CONFIG.ENDPOINTS.USERS));

  // Handle loading state
  if (isLoading) {
    return <div>Loading users...</div>;
  }

  // Handle error state
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Handle empty data
  if (!users || users.length === 0) {
    return <div>No users found</div>;
  }

  // Render data
  return (
    <div>
      <h3>Users ({users.length})</h3>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

#### How It Works

**State Management:**
1. **Initial State:** `isLoading: true`, `data: null`, `error: null`
2. **Fetching:** Request sent to API
3. **Success:** `isLoading: false`, `data: result`, `error: null`
4. **Error:** `isLoading: false`, `data: null`, `error: Error`

**Race Condition Prevention:**
```typescript
// Component mounts, starts fetching users
useApi('/api/users'); // Request 1 starts

// URL changes before Request 1 completes
useApi('/api/posts'); // Request 2 starts

// Request 1 completes (but component already unmounted/changed)
// isMounted = false, so state not updated ✅

// Request 2 completes
// isMounted = true, state updated ✅
```

#### Best Practices

1. **Type the response data:**
```typescript
// ✅ Type-safe API response
const { data: users } = useApi<User[]>('/api/users');
// TypeScript knows 'users' is User[] or null
```

2. **Centralize API configuration:**
```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    USERS: '/users',
    TRANSACTIONS: '/transactions',
    CATEGORIES: '/categories',
  },
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Usage
const { data } = useApi<User[]>(getApiUrl(API_CONFIG.ENDPOINTS.USERS));
```

3. **Handle all three states:**
```typescript
// ✅ Handle loading, error, and success
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
return <DataView data={data} />;
```

---

### useAuth

#### Purpose
Manages user authentication state (logged in/out, user data) and provides login/logout functions in a reusable way.

#### Why Use It?
Authentication logic is needed across many components. Without centralization:
- 🔴 Duplicated auth logic in every component
- 🔴 Inconsistent auth checks
- 🔴 Hard to add features like "remember me"
- 🔴 Difficult to integrate with backend auth

This hook centralizes auth state and makes it reusable.

#### When to Use
- ✅ Simple authentication state management
- ✅ Client-side auth status tracking
- ✅ Consistent auth UI across components
- ✅ Learning authentication patterns

#### When NOT to Use
- ❌ Production apps with real auth (use NextAuth, Auth0, Firebase Auth)
- ❌ Need JWT token management (use dedicated auth library)
- ❌ Complex role-based access control
- ❌ Session management with backend

#### How to Use

**Implementation Reference:** [useAuth.ts](../exercises/01-hooks/src/custom-hooks/useAuth.ts)

```typescript
import { useState, useCallback } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
  });

  // Login function - memoized with useCallback
  const login = useCallback((user: AuthUser) => {
    setAuthState({
      isLoggedIn: true,
      user,
    });
    // In real app: store token, call API, etc.
  }, []);

  // Logout function - memoized with useCallback
  const logout = useCallback(() => {
    setAuthState({
      isLoggedIn: false,
      user: null,
    });
    // In real app: clear token, call API, etc.
  }, []);

  return {
    isLoggedIn: authState.isLoggedIn,
    user: authState.user,
    login,
    logout,
  };
}
```

#### Usage in Practice

**Implementation Reference:** [App.tsx - CustomHooksDemo](../exercises/01-hooks/src/App.tsx#L385-L549)

```typescript
function AuthDemo() {
  const { isLoggedIn, user, login, logout } = useAuth();

  const handleLogin = () => {
    login({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    });
  };

  return (
    <div>
      {isLoggedIn ? (
        <>
          <h4>Welcome, {user?.name}!</h4>
          <p>Email: {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <p>Please log in to continue</p>
          <button onClick={handleLogin}>Login</button>
        </>
      )}
    </div>
  );
}
```

#### Production-Ready Extensions

**Add localStorage persistence:**
```typescript
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : { isLoggedIn: false, user: null };
  });

  const login = useCallback((user: AuthUser) => {
    const newState = { isLoggedIn: true, user };
    setAuthState(newState);
    localStorage.setItem('auth', JSON.stringify(newState));
  }, []);

  const logout = useCallback(() => {
    const newState = { isLoggedIn: false, user: null };
    setAuthState(newState);
    localStorage.removeItem('auth');
  }, []);

  return { isLoggedIn: authState.isLoggedIn, user: authState.user, login, logout };
}
```

---

## Mock API Setup with json-server

The practice project uses **json-server** to provide a realistic REST API for learning data fetching patterns.

### Why Mock API?

- ✅ Practice real API patterns without backend setup
- ✅ Learn HTTP methods (GET, POST, PUT, DELETE)
- ✅ Experiment with loading/error states
- ✅ Test query parameters and filtering
- ✅ Understand CORS and API integration

### Available Endpoints

The mock API provides three main resources:

#### Users Endpoint
```bash
GET    /users           # Get all users
GET    /users/:id       # Get user by ID
POST   /users           # Create new user
PUT    /users/:id       # Update user (replace entire object)
PATCH  /users/:id       # Update user (partial update)
DELETE /users/:id       # Delete user
```

**Sample User:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "phone": "+1-234-567-8901",
  "website": "johndoe.com"
}
```

#### Transactions Endpoint
```bash
GET    /transactions           # Get all transactions
GET    /transactions/:id       # Get transaction by ID
POST   /transactions           # Create new transaction
PUT    /transactions/:id       # Update transaction
PATCH  /transactions/:id       # Partial update
DELETE /transactions/:id       # Delete transaction
```

**Sample Transaction:**
```json
{
  "id": "txn-001",
  "amount": 1200.50,
  "description": "Monthly Salary",
  "category": "salary",
  "date": "2026-01-01T10:00:00.000Z",
  "type": "income"
}
```

#### Categories Endpoint
```bash
GET    /categories           # Get all categories
GET    /categories/:id       # Get category by ID
POST   /categories           # Create new category
PUT    /categories/:id       # Update category
PATCH  /categories/:id       # Partial update
DELETE /categories/:id       # Delete category
```

**Sample Category:**
```json
{
  "id": "cat-001",
  "name": "Salary",
  "color": "#4CAF50",
  "icon": "💰"
}
```

### Advanced Query Parameters

json-server supports powerful query parameters for filtering, sorting, and pagination:

#### Filtering
```bash
# Filter by exact match
GET /users?name=John Doe

# Filter by multiple fields
GET /transactions?type=expense&category=groceries

# Filter with nested objects
GET /users?address.city=Boston
```

#### Pagination
```bash
# Get 10 items per page
GET /users?_page=1&_limit=10

# Get items 20-30
GET /users?_start=20&_end=30
```

#### Sorting
```bash
# Sort ascending
GET /users?_sort=name&_order=asc

# Sort descending
GET /transactions?_sort=amount&_order=desc

# Sort by multiple fields
GET /users?_sort=name,age&_order=asc,desc
```

#### Full-text Search
```bash
# Search across all fields
GET /users?q=john

# Finds matches in name, email, username, etc.
```

#### Relationships (Embedded Resources)
```bash
# Include related resources
GET /users?_embed=transactions

# Returns users with their transactions included
```

### Configuration Files

**db.json** - Mock data storage
```json
{
  "users": [...],
  "transactions": [...],
  "categories": [...]
}
```

**json-server.json** - Server configuration
```json
{
  "port": 3001,
  "watch": true,
  "delay": 0
}
```

**routes.json** - Custom route mappings
```json
{
  "/api/*": "/$1"
}
```

### Using the API in Code

**API Configuration** - `src/config/api.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    USERS: '/users',
    TRANSACTIONS: '/transactions',
    CATEGORIES: '/categories',
  },
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
```

**Usage Example:**
```typescript
import { useApi } from './custom-hooks';
import { getApiUrl, API_CONFIG } from './config/api';

function MyComponent() {
  const { data, isLoading, error } = useApi<User[]>(
    getApiUrl(API_CONFIG.ENDPOINTS.USERS)
  );
  
  // Use the data...
}
```

### Modifying Mock Data

1. **Edit db.json** - Changes persist automatically
2. **Through API calls** - POST, PUT, PATCH, DELETE persist to db.json
3. **Reset data** - Simply edit db.json back to original state

### Tips & Best Practices

**Persistence:**
- All changes via POST/PUT/PATCH/DELETE are saved to `db.json`
- Restart server to see changes if needed

**CORS:**
- json-server enables CORS by default
- No additional configuration needed for local development

**Testing Loading States:**
```bash
# Add artificial delay to test loading states
npm run api -- --delay 2000
```

**Watching for Changes:**
- json-server watches `db.json` for changes
- Automatically reloads when file is modified

---

## TypeScript Integration

### Why TypeScript with React?

TypeScript adds static typing to JavaScript, catching errors at compile-time instead of runtime. For React applications, this means:

✅ **Catch errors before they reach users**
✅ **Better IDE support** - Autocomplete, inline documentation
✅ **Self-documenting code** - Types serve as documentation
✅ **Refactoring confidence** - Rename/restructure safely
✅ **Better team collaboration** - Types as contracts

### Data Models: Interface vs Type

**Implementation Reference:** [types/](../exercises/01-hooks/src/types/)

#### When to Use Interface

Interfaces are best for object shapes that might be extended:

```typescript
// types/User.ts
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone?: string;        // Optional property
  website?: string;
}

// Can be extended
export interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// Can be merged (declaration merging)
interface User {
  createdAt?: Date;     // Adds new property to User
}
```

#### When to Use Type

Types are better for unions, primitives, tuples, and mapped types:

```typescript
// types/Transaction.ts
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';  // Union type
}

// Union types
type Theme = 'light' | 'dark';
type Status = 'idle' | 'loading' | 'success' | 'error';

// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T;

// Mapped types
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

#### Interface vs Type Comparison

| Feature | Interface | Type |
|---------|-----------|------|
| Extend other types | ✅ `extends` keyword | ✅ `&` intersection |
| Declaration merging | ✅ Yes | ❌ No |
| Union types | ❌ No | ✅ Yes |
| Tuple types | ❌ No | ✅ Yes |
| Mapped types | ❌ No | ✅ Yes |
| Computed properties | ✅ Yes | ✅ Yes |
| Performance | Slightly faster | Slightly slower |

**Rule of thumb:**
- Use `interface` for object shapes (React components props, API responses)
- Use `type` for everything else (unions, helpers, complex types)

### Typing React Components

#### Function Component Props

**Implementation Reference:** [components/UserCard.tsx](../exercises/01-hooks/src/components/UserCard.tsx)

```typescript
import type { User } from '../types';

// Define props interface
interface UserCardProps {
  user: User;                              // Required prop
  onSelect?: (user: User) => void;         // Optional callback
  className?: string;                      // Optional styling
  showDetails?: boolean;                   // Optional flag
}

// Type the component
export function UserCard({ 
  user, 
  onSelect, 
  className = '',
  showDetails = false 
}: UserCardProps) {
  return (
    <div className={className} onClick={() => onSelect?.(user)}>
      <h4>{user.name}</h4>
      <p>{user.email}</p>
      {showDetails && (
        <>
          <p>Username: {user.username}</p>
          <p>Phone: {user.phone}</p>
        </>
      )}
    </div>
  );
}
```

#### Typing useState

```typescript
// TypeScript infers type from initial value
const [count, setCount] = useState(0);          // number
const [name, setName] = useState('');           // string
const [isActive, setIsActive] = useState(true); // boolean

// Explicit type when initial value is null
const [user, setUser] = useState<User | null>(null);

// Union types
const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

// Array types
const [users, setUsers] = useState<User[]>([]);

// Object types
const [formData, setFormData] = useState<{
  name: string;
  email: string;
}>({ name: '', email: '' });
```

#### Typing Event Handlers

```typescript
function MyComponent() {
  // Button click
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(event.currentTarget.value);
  };

  // Input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
  };

  // Form submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form
  };

  // Generic event
  const handleEvent = (event: React.SyntheticEvent) => {
    // Handle any React event
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

#### Typing Custom Hooks

```typescript
// Return tuple (like useState)
function useToggle(initial: boolean): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(v => !v);
  return [value, toggle];
}

// Return object
function useAuth() {
  // ... hook logic
  return {
    isLoggedIn: boolean,
    user: User | null,
    login: (user: User) => void,
    logout: () => void,
  };
}

// Generic custom hook
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // ... implementation
}
```

### Benefits in Practice

**1. Autocomplete & IntelliSense**
```typescript
const user: User = { /* IDE suggests: id, name, email, username */ };
```

**2. Catch Errors Early**
```typescript
interface Props {
  count: number;
}

// ❌ TypeScript error: Type 'string' is not assignable to type 'number'
<MyComponent count="5" />

// ✅ Correct
<MyComponent count={5} />
```

**3. Refactoring Safety**
```typescript
// Rename User.name to User.fullName
// TypeScript shows all places that need updating
```

**4. Self-Documenting**
```typescript
// Anyone can see what data looks like
interface User {
  id: number;
  name: string;
  email: string;
}
// No need to check API docs or console.log
```

---

## Error Boundaries

### What Are Error Boundaries?

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire application.

### Why Are They Important?

**Without Error Boundaries:**
- 🔴 One component error crashes entire app
- 🔴 User sees blank screen
- 🔴 No way to recover gracefully
- 🔴 Poor user experience

**With Error Boundaries:**
- ✅ Errors contained to specific UI sections
- ✅ Show user-friendly error message
- ✅ Rest of app continues working
- ✅ Can log errors to monitoring service
- ✅ Professional error handling

### Critical Limitation

**Error boundaries MUST be class components** because they rely on lifecycle methods that don't have hook equivalents:
- `static getDerivedStateFromError()` - Update state when error caught
- `componentDidCatch()` - Log error information

There is no `useErrorBoundary` hook (yet).

### Implementation

**Implementation Reference:** [components/ErrorBoundary.tsx](../exercises/01-hooks/src/components/ErrorBoundary.tsx)

```typescript
import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;  // Custom error UI
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // Update state when error is caught
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  // Log error details (send to error tracking service)
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // In production: Send to Sentry, LogRocket, etc.
    // logErrorToService(error, errorInfo);
  }

  // Reset error state (for retry functionality)
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{ padding: '20px', border: '2px solid red' }}>
          <h2>⚠️ Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            {this.state.error?.toString()}
            <br />
            {this.state.error?.stack}
          </details>
          <button onClick={this.resetError}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Usage in Practice

**Implementation Reference:** [App.tsx - ErrorBoundaryDemo](../exercises/01-hooks/src/App.tsx#L505-L549)

```typescript
import ErrorBoundary from './components/ErrorBoundary';
import { ComponentThatFails } from './components/ComponentThatFails';

function App() {
  return (
    <div>
      {/* This section is protected */}
      <ErrorBoundary>
        <ComponentThatFails />
      </ErrorBoundary>

      {/* Rest of app continues working even if above crashes */}
      <div>
        <h2>Other Content</h2>
        <p>This still works!</p>
      </div>
    </div>
  );
}
```

### What Error Boundaries Catch

✅ **Errors in rendering**
```typescript
function Component() {
  return <div>{undefined.property}</div>; // Caught!
}
```

✅ **Errors in lifecycle methods**
```typescript
componentDidMount() {
  throw new Error('Oops!'); // Caught!
}
```

✅ **Errors in constructors**
```typescript
constructor() {
  throw new Error('Oops!'); // Caught!
}
```

### What Error Boundaries DON'T Catch

❌ **Event handlers** (use try-catch)
```typescript
function Component() {
  const handleClick = () => {
    throw new Error('Not caught by boundary!');
  };
  
  // ✅ Wrap in try-catch
  const handleClickSafe = () => {
    try {
      dangerousOperation();
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={handleClick}>Click</button>;
}
```

❌ **Asynchronous code** (setTimeout, promises)
```typescript
useEffect(() => {
  setTimeout(() => {
    throw new Error('Not caught!'); // Error boundary won't catch this
  }, 1000);

  // ✅ Catch async errors
  fetchData().catch(error => {
    setError(error);
  });
}, []);
```

❌ **Server-side rendering errors**

❌ **Errors in the error boundary itself**

### Best Practices

**1. Use multiple error boundaries for granular control:**
```typescript
function App() {
  return (
    <>
      <ErrorBoundary fallback={<HeaderError />}>
        <Header />
      </ErrorBoundary>

      <ErrorBoundary fallback={<MainError />}>
        <MainContent />
      </ErrorBoundary>

      <ErrorBoundary fallback={<SidebarError />}>
        <Sidebar />
      </ErrorBoundary>
    </>
  );
}
```

**2. Integrate with error monitoring:**
```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Send to Sentry
  Sentry.captureException(error, { extra: errorInfo });

  // Send to LogRocket
  LogRocket.captureException(error);

  // Custom logging
  logErrorToBackend(error, errorInfo, userContext);
}
```

**3. Provide user-friendly error messages:**
```typescript
render() {
  if (this.state.hasError) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
        <button onClick={this.resetError}>
          Try Again
        </button>
      </div>
    );
  }

  return this.props.children;
}
```

---

## Performance Optimization

### The Performance Optimization Hierarchy

Don't optimize prematurely! Follow this order:

1. ✅ **Measure first** - Use React DevTools Profiler
2. ✅ **Fix obvious issues** - Unnecessary renders, expensive operations in render
3. ✅ **Use React.memo** - Prevent component re-renders
4. ✅ **Use useMemo** - Cache expensive calculations
5. ✅ **Use useCallback** - Stabilize function references
6. ✅ **Code splitting** - Lazy load components
7. ✅ **Virtualization** - Render only visible items in long lists

### When to Use Each Optimization

#### React.memo - Memoize Entire Component

**When:** Component re-renders often but props rarely change

```typescript
// Child re-renders every time parent renders
function ExpensiveChild({ data }) {
  console.log('Rendering ExpensiveChild');
  return <div>{/* Expensive rendering */}</div>;
}

// ✅ Wrap in memo - only re-renders when 'data' changes
const ExpensiveChild = memo(function ExpensiveChild({ data }) {
  console.log('Rendering ExpensiveChild');
  return <div>{/* Expensive rendering */}</div>;
});
```

#### useMemo - Memoize Calculated Value

**When:** Expensive calculation that runs on every render

```typescript
function Component() {
  const [filter, setFilter] = useState('');
  const [count, setCount] = useState(0);

  // ❌ Filters 10,000 items on every render (even when count changes)
  const filtered = items.filter(item => item.name.includes(filter));

  // ✅ Only re-filters when 'filter' changes
  const filtered = useMemo(
    () => items.filter(item => item.name.includes(filter)),
    [filter]
  );

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {/* Changing count doesn't re-filter with useMemo ✅ */}
    </>
  );
}
```

#### useCallback - Memoize Function

**When:** Passing callbacks to memoized children

```typescript
const MemoizedChild = memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ❌ New function every render → child re-renders
  const handleClick = () => console.log('clicked');

  // ✅ Same function reference → child doesn't re-render
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <MemoizedChild onClick={handleClick} />
    </>
  );
}
```

### Measuring Performance

**Use React DevTools Profiler:**

1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Click record → Interact with app → Stop recording
4. See which components render and how long they take

**Identify problems:**
- ⚠️ Components rendering when they shouldn't
- ⚠️ Renders taking > 16ms (60 FPS threshold)
- ⚠️ Many unnecessary renders in a short time

### Common Performance Pitfalls

**1. Creating objects/arrays in render:**
```typescript
// ❌ New object every render
function Component() {
  return <Child style={{ color: 'red' }} />;
  // style is a new object, Child always re-renders
}

// ✅ Stable reference
const style = { color: 'red' };
function Component() {
  return <Child style={style} />;
}

// ✅ Or use useMemo
function Component() {
  const style = useMemo(() => ({ color: 'red' }), []);
  return <Child style={style} />;
}
```

**2. Expensive operations in render:**
```typescript
// ❌ Runs every render
function Component({ data }) {
  const processed = expensiveProcessing(data);  // SLOW!
  return <div>{processed}</div>;
}

// ✅ Only when data changes
function Component({ data }) {
  const processed = useMemo(
    () => expensiveProcessing(data),
    [data]
  );
  return <div>{processed}</div>;
}
```

**3. Not using keys properly:**
```typescript
// ❌ Index as key - causes issues when list changes
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// ✅ Unique ID as key
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

---

## Common Pitfalls & How to Avoid Them

### 1. Stale Closures in useEffect

**Problem:** Effect uses old values because they're "closed over"

```typescript
// ❌ BAD - count is stale
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count); // Always logs 0!
      setCount(count + 1); // Always sets to 1!
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty deps = effect only runs once

  return <div>{count}</div>;
}

// ✅ GOOD - Use functional update
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1); // Uses latest count
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Can keep empty deps

  return <div>{count}</div>;
}
```

### 2. Infinite Loops

**Problem:** Effect updates state that triggers the effect again

```typescript
// ❌ INFINITE LOOP
function Component() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData().then(result => {
      setData(result); // Triggers re-render
    });
  }, [data]); // Effect depends on data → infinite loop!
}

// ✅ FIXED - Only run once
useEffect(() => {
  fetchData().then(setData);
}, []); // Empty deps

// ✅ OR - Don't include data in deps
useEffect(() => {
  fetchData().then(setData);
  // Data changes don't trigger this effect
}, [/* other deps but not data */]);
```

### 3. Forgetting Cleanup

**Problem:** Side effects not cleaned up, causing memory leaks

```typescript
// ❌ Memory leak
function Component() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('tick');
    }, 1000);
    // No cleanup! Interval keeps running after unmount
  }, []);
}

// ✅ Proper cleanup
function Component() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('tick');
    }, 1000);

    return () => clearInterval(interval); // Cleanup!
  }, []);
}
```

### 4. Calling Hooks Conditionally

**Problem:** Breaks React's hook tracking

```typescript
// ❌ WRONG - Hook in condition
function Component({ show}) {
  if (show) {
    const [count, setCount] = useState(0); // ERROR!
  }
}

// ✅ CORRECT - Hook at top level
function Component({ show }) {
  const [count, setCount] = useState(0);
  
  if (!show) return null;
  
  return <div>{count}</div>;
}
```

### 5. Not Listing All Dependencies

**Problem:** Stale values, bugs, unpredictable behavior

```typescript
// ❌ Missing dependency
function Component() {
  const [userId, setUserId] = useState(1);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // Missing userId!

// ✅ Include all dependencies
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]); // ✅ Re-fetch when userId changes
```

---

## Key Learnings & Best Practices

### Hook Rules (Critical!)

1. ✅ **Only call hooks at the top level**
   - Never in loops, conditions, or nested functions
   - Must be called in the same order every render

2. ✅ **Only call hooks from React functions**
   - React function components
   - Custom hooks (must start with `use`)

3. ✅ **Custom hooks must start with `use`**
   - Naming convention enables linter to check rules
   - Makes it clear the function is a hook

### useState Best Practices

- ✅ Use functional updates when new state depends on previous: `setState(prev => prev + 1)`
- ✅ Lazy initialization for expensive initial values: `useState(() => expensiveInit())`
- ✅ Don't mutate state - always create new objects/arrays
- ✅ Group related state with useReducer, not multiple useState

### useEffect Best Practices

- ✅ **Always include cleanup functions** for subscriptions/timers
- ✅ **List all dependencies** honestly (use ESLint plugin)
- ✅ **One effect = one concern** - split complex effects
- ✅ **Avoid object/array dependencies** - they change every render
- ✅ **Use functional updates** to avoid adding state to dependencies

### Performance Optimization

- ✅ **Measure first** - Don't optimize prematurely
- ✅ **React.memo** - Prevent component re-renders
- ✅ **useMemo** - Cache expensive calculations
- ✅ **useCallback** - Stabilize function references (with React.memo)
- ❌ **Don't memoize everything** - Has overhead

### Custom Hooks

- ✅ **Extract reusable logic** - Share between components
- ✅ **Separate concerns** - Keep UI and logic separate
- ✅ **Name with `use` prefix** - Required convention
- ✅ **Return values/functions** - Like built-in hooks
- ✅ **Compose hooks** - Build complex from simple

### TypeScript

- ✅ **Type component props** - Catch errors early
- ✅ **Type hook returns** - Clear contracts
- ✅ **Use `interface` for objects** - Better for React
- ✅ **Use `type` for unions** - Better for complex types
- ✅ **Type event handlers** - `React.MouseEvent`, `React.ChangeEvent`

---

## Practice Project Structure

The complete project structure with all files:

```
exercises/01-hooks/
├── src/
│   ├── App.tsx                    # Main demo showcase (9 sections)
│   ├── App.css                    # Styling for all demos
│   ├── main.tsx                   # App entry point
│   ├── index.css                  # Global styles
│   │
│   ├── config/
│   │   └── api.ts                 # API configuration & helpers
│   │
│   ├── types/
│   │   ├── index.ts              # Type exports
│   │   ├── User.ts               # User data model
│   │   ├── Transaction.ts        # Transaction data model
│   │   └── Category.ts           # Category data model
│   │
│   ├── custom-hooks/
│   │   ├── index.ts              # Hook exports
│   │   ├── useDebounce.ts        # Debounce hook
│   │   ├── useLocalStorage.ts    # localStorage sync hook
│   │   ├── useApi.ts             # Data fetching hook
│   │   └── useAuth.ts            # Authentication hook
│   │
│   └── components/
│       ├── ErrorBoundary.tsx     # Error boundary class component
│       ├── UserCard.tsx          # User display component
│       └── ComponentThatFails.tsx # Demo error component
│
├── public/                        # Static assets
│
├── db.json                        # Mock API data (json-server)
├── json-server.json              # json-server configuration
├── routes.json                   # API route mappings
│
├── package.json                  # Dependencies & scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.app.json            # App-specific TS config
├── tsconfig.node.json           # Node-specific TS config
├── eslint.config.js             # ESLint configuration
└── index.html                   # HTML entry point
```

### Key Files Explained

**App.tsx** - Main demonstration file with 9 sections:
1. Counter (useState)
2. Settings Panel (useReducer)
3. Timer/Stopwatch (useEffect)
4. Ref Demo (useRef)
5. Layout Effect Demo (useLayoutEffect)
6. List Filter (useMemo)
7. Parent-Child Demo (useCallback)
8. Custom Hooks Demo (all custom hooks)
9. Error Boundary Demo

**Custom Hooks** - Reusable logic extraction:
- `useDebounce` - Delay value updates for search optimization
- `useLocalStorage` - Persist state to localStorage
- `useApi` - Fetch data with loading/error states
- `useAuth` - Manage authentication state

**Types** - TypeScript definitions:
- `User` - User data structure
- `Transaction` - Financial transaction structure
- `Category` - Category data structure

**Components** - Reusable UI components:
- `ErrorBoundary` - Catch and handle errors gracefully
- `UserCard` - Display user information
- `ComponentThatFails` - Demo component for error boundary

**Configuration**:
- `db.json` - Mock API data (5 users, 6 transactions, 8 categories)
- `api.ts` - Centralized API configuration
- `vite.config.ts` - Build tool configuration

---

## Running the Project

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of React concepts

### Initial Setup

1. **Navigate to project directory:**
```bash
cd exercises/01-hooks
```

2. **Install dependencies:**
```bash
npm install
```

This installs:
- React 19 & React DOM
- TypeScript 5
- Vite (build tool)
- json-server (mock API)
- ESLint (code quality)

### Running the Application

You have three options:

#### Option 1: Run Both Servers Together (Recommended)

```bash
npm run dev:all
```

This starts:
- **Mock API Server** on `http://localhost:3001`
- **Vite Dev Server** on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

#### Option 2: Run Servers Separately

**Terminal 1 - API Server:**
```bash
npm run api
```

**Terminal 2 - Dev Server:**
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

#### Option 3: Run Only Dev Server (Without API)

```bash
npm run dev
```

Note: Custom hooks demo won't work without API server.

### Available Scripts

```bash
npm run dev        # Start Vite dev server
npm run api        # Start json-server mock API
npm run dev:all    # Start both servers
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### What to Explore

Once running, explore these 7 demo sections:

1. **useState - Counter**
   - Basic state management
   - Increment, decrement, reset

2. **useReducer - Settings Panel**
   - Complex state with multiple values
   - Theme, font size, font family controls

3. **useEffect - Timer/Stopwatch**
   - Side effects & cleanup
   - Start, pause, reset functionality

4. **useMemo - List Filter**
   - Performance optimization
   - Filter 10,000 items efficiently
   - Check console for render logs

5. **useCallback - Parent-Child Demo**
   - Function memoization
   - Prevent unnecessary child renders
   - Check console for render logs

6. **Custom Hooks Demo**
   - **useDebounce:** Search input with debouncing
   - **useLocalStorage:** Theme persistence (try refreshing!)
   - **useApi:** Fetch users from mock API
   - **useAuth:** Login/logout functionality

7. **Error Boundary Demo**
   - Click to trigger error
   - See fallback UI instead of crash

### Testing the Mock API

**View all users:**
```bash
curl http://localhost:3001/users
```

**Get specific user:**
```bash
curl http://localhost:3001/users/1
```

**Create new user:**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","username":"testuser"}'
```

**Filter transactions:**
```bash
curl http://localhost:3001/transactions?type=expense
```

### Development Tips

**Hot Module Replacement (HMR):**
- Edit any file
- See changes instantly without full reload
- State is preserved when possible

**Console Logs:**
- Open browser DevTools (F12)
- Check Console tab for render logs
- See when useMemo/useCallback prevent re-calculations

**React DevTools:**
- Install React DevTools browser extension
- See component tree, props, state
- Profile component performance

**localStorage:**
- Open DevTools → Application → Local Storage
- See persisted data from useLocalStorage
- Try clearing and reloading

### Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3001
kill -9 $(lsof -t -i:3001)

# Kill process on port 5173
kill -9 $(lsof -t -i:5173)
```

**Dependencies not installing:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

**ESLint errors:**
```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## Next Steps & Further Learning

### ✅ Completed: Topic 1 - React Hooks

You've now learned:
- Core hooks (useState, useReducer, useEffect, useMemo, useCallback)
- Custom hooks (useDebounce, useLocalStorage, useApi, useAuth)
- TypeScript integration with React
- Error boundaries for error handling
- Performance optimization techniques
- Best practices and common pitfalls

### 🎯 Practice Exercises

To solidify your learning, try building:

1. **Todo App with Hooks**
   - useState for todo list
   - useLocalStorage to persist todos
   - useReducer for complex todo actions
   - Error boundary around todo list

2. **Real-time Search**
   - useDebounce for search input
   - useApi to fetch search results
   - useMemo to filter/sort results
   - Loading and error states

3. **Theme Switcher**
   - useLocalStorage for theme persistence
   - Custom useTheme hook
   - Context + hooks for global state

4. **Dashboard with Widgets**
   - Multiple error boundaries for each widget
   - useApi for data fetching
   - useMemo for data processing
   - useCallback for event handlers

### 📚 Recommended Resources

**Official Documentation:**
- [React Docs - Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

**Advanced Topics:**
- React Query / TanStack Query (advanced data fetching)
- React Hook Form (form management)
- Zustand / Jotai (state management)
- React Router (navigation with hooks)

**Performance:**
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Web Vitals](https://web.dev/vitals/)
- [Million.js](https://million.dev/) (React optimization)

### 🔜 Coming Next: Topic 2

Topics to explore next:
- **Component Patterns** - Compound components, render props, HOCs
- **Advanced State Management** - Context API, Zustand, Redux Toolkit
- **Routing** - React Router, protected routes, nested routing
- **Forms** - React Hook Form, validation, file uploads
- **Testing** - Jest, React Testing Library, E2E tests

---

## Summary

React Hooks revolutionized how we write React applications. Key takeaways:

### Why Hooks Matter

✅ **Simpler code** - No classes, just functions
✅ **Reusable logic** - Custom hooks extract shared logic
✅ **Better organization** - Related code stays together
✅ **Easier to learn** - More intuitive than lifecycle methods
✅ **Better performance** - Easier for React to optimize

### The Essential Hooks

| Hook | Purpose | When to Use |
|------|---------|-------------|
| useState | Simple state | Single values, toggles |
| useReducer | Complex state | Multiple related values, actions |
| useEffect | Side effects | API calls, subscriptions, timers |
| useRef | Mutable ref | DOM access, persistent values |
| useLayoutEffect | Sync DOM updates | Measurements, positioning |
| useMemo | Memoize value | Expensive calculations |
| useCallback | Memoize function | Callbacks to memoized children |
| Custom Hooks | Reusable logic | Share logic between components |

### Remember

1. **Follow the Rules of Hooks** - Top level, React functions only
2. **Include cleanup in useEffect** - Prevent memory leaks
3. **List all dependencies** - Use ESLint plugin
4. **Measure before optimizing** - Don't guess, profile
5. **Build custom hooks** - Extract reusable logic
6. **Use TypeScript** - Catch errors early
7. **Handle errors gracefully** - Error boundaries for better UX

### You're Ready When...

- [ ] Can explain when to use each core hook
- [ ] Understand useEffect cleanup and dependencies
- [ ] Know when to optimize with useMemo/useCallback
- [ ] Can build custom hooks for reusable logic
- [ ] Implement error boundaries properly
- [ ] Type React components with TypeScript
- [ ] Avoid common pitfalls and anti-patterns

---

**Documentation Last Updated:** January 6, 2026  
**Status:** Complete ✅  
**Practice Project:** [exercises/01-hooks/](../exercises/01-hooks/)  
**Main Repository:** [Back to README](../README.md)
