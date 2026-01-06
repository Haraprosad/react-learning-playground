# React Learning Playground 🚀

A comprehensive, hands-on learning journey through React concepts with TypeScript. This repository follows a project-based learning approach where each topic is explored through practical, real-world examples.

## 📚 Quick Navigation

- **[Topic 1: React Hooks - Complete Guide](docs/01-hooks.md)** - Master useState, useReducer, useEffect, useMemo, useCallback, and custom hooks

## 📚 Learning Philosophy

**Learn by Building** - Each topic includes:
- ✅ Detailed explanations (WHY, WHEN, HOW)
- ✅ Working code examples you can run and modify
- ✅ TypeScript integration from day one
- ✅ Best practices and common pitfalls
- ✅ Real-world scenarios and use cases

## 🗂️ Repository Structure

```
react-learning-playground/
├── docs/                          # Detailed documentation for each topic
│   └── 01-hooks.md               # React Hooks deep dive
├── exercises/                     # Hands-on practice projects
│   └── 01-hooks/                 # Hooks playground with 7 interactive demos
│       ├── src/
│       │   ├── App.tsx           # Main demo showcase
│       │   ├── custom-hooks/     # Reusable custom hooks
│       │   ├── components/       # Demo components
│       │   ├── types/            # TypeScript type definitions
│       │   └── config/           # API configuration
│       ├── db.json               # Mock API data (json-server)
│       └── API.md                # API documentation
├── projects/                      # Full-featured projects (coming soon)
└── shared/                        # Shared utilities and components
```

## 📖 Learning Modules

### ✅ Topic 1: React Hooks Fundamentals

**Status:** Complete | **Documentation:** [docs/01-hooks.md](docs/01-hooks.md) | **Practice:** [exercises/01-hooks](exercises/01-hooks)

Master React Hooks through 9 interactive demos covering:

#### Core Hooks
1. **useState** - Simple state management
   - **Why:** Add state to functional components
   - **When:** Single, independent values (counters, toggles, form inputs)
   - **Practice:** [Counter Demo](exercises/01-hooks/src/App.tsx)

2. **useReducer** - Complex state management
   - **Why:** Handle multiple related state values with coordinated updates
   - **When:** Complex state logic, state depends on previous state, multiple actions
   - **Practice:** [Settings Panel Demo](exercises/01-hooks/src/App.tsx)

3. **useEffect** - Side effects & lifecycle
   - **Why:** Perform side effects (API calls, subscriptions, timers)
   - **When:** Data fetching, event listeners, DOM manipulation, cleanup needed
   - **Practice:** [Timer/Stopwatch Demo](exercises/01-hooks/src/App.tsx)

4. **useRef** - DOM access & persistent values
   - **Why:** Access DOM directly, store values without re-rendering
   - **When:** Focus inputs, track previous values, store timers
   - **Practice:** [Ref Demo](exercises/01-hooks/src/App.tsx)

5. **useLayoutEffect** - Synchronous DOM updates
   - **Why:** Measure DOM before paint, prevent visual flicker
   - **When:** DOM measurements, tooltips, positioning
   - **Practice:** [Layout Effect Demo](exercises/01-hooks/src/App.tsx)

6. **useMemo** - Performance optimization
   - **Why:** Prevent expensive recalculations on every render
   - **When:** Heavy computations, filtering large datasets, preventing wasted work
   - **Practice:** [List Filter Demo](exercises/01-hooks/src/App.tsx)

7. **useCallback** - Function memoization
   - **Why:** Prevent unnecessary function recreation and child re-renders
   - **When:** Passing callbacks to memoized children, functions as hook dependencies
   - **Practice:** [Parent-Child Memo Demo](exercises/01-hooks/src/App.tsx)

#### Custom Hooks
Build reusable logic that works across components:

8. **useDebounce** - Optimize search inputs
   - **Why:** Reduce API calls by delaying updates until user stops typing
   - **When:** Search bars, autocomplete, any rapid input changes
   - **Practice:** [useDebounce.ts](exercises/01-hooks/src/custom-hooks/useDebounce.ts)

9. **useLocalStorage** - Persistent state
   - **Why:** Sync state with localStorage automatically
   - **When:** Theme preferences, form drafts, user settings
   - **Practice:** [useLocalStorage.ts](exercises/01-hooks/src/custom-hooks/useLocalStorage.ts)

10. **useApi** - Data fetching pattern
    - **Why:** Standardize API calls with loading/error states
    - **When:** Fetching data from REST APIs, managing async operations
    - **Practice:** [useApi.ts](exercises/01-hooks/src/custom-hooks/useApi.ts)

11. **useAuth** - Authentication management
    - **Why:** Centralize auth state and logic
    - **When:** User login/logout, protected routes, auth-dependent UI
    - **Practice:** [useAuth.ts](exercises/01-hooks/src/custom-hooks/useAuth.ts)

#### Advanced Concepts

12. **Error Boundaries** - Graceful error handling
    - **Why:** Catch errors in component tree without crashing the app
    - **When:** Wrap risky components, provide fallback UI
    - **Practice:** [ErrorBoundary.tsx](exercises/01-hooks/src/components/ErrorBoundary.tsx)

13. **TypeScript Integration** - Type-safe React
    - **Why:** Catch errors at compile time, better IDE support
    - **When:** Always! Production apps should use TypeScript
    - **Practice:** [types/](exercises/01-hooks/src/types/)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Basic JavaScript/TypeScript knowledge
- Understanding of React fundamentals (components, JSX, props)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd react-learning-playground
```

2. **Start with Topic 1: Hooks**
```bash
cd exercises/01-hooks
npm install
```

3. **Run the mock API server and dev server**
```bash
npm run dev:all
```

This starts:
- **Mock API** on `http://localhost:3001` (json-server with realistic data)
- **Vite dev server** on `http://localhost:5173` (React app)

4. **Explore the demos**
   - Open your browser and interact with all 7 demo sections
   - Check the console for performance insights (useMemo/useCallback logs)
   - Modify the code and see live updates with HMR

### Alternative: Run servers separately

```bash
# Terminal 1 - API Server
npm run api

# Terminal 2 - Dev Server
npm run dev
```

## 📝 How to Use This Repository

### For Self-Learners

1. **Read the documentation first** - Start with [docs/01-hooks.md](docs/01-hooks.md)
2. **Understand WHY before HOW** - Each concept explains the reasoning
3. **Run the code** - See the concepts in action
4. **Experiment** - Modify the code, break things, fix them
5. **Build your own** - Apply concepts to your own projects

### For Instructors

- Use as a teaching curriculum
- Share the documentation with students
- Live code along with the examples
- Assign exercises based on the practice projects

### Learning Path

```
1. Read docs/01-hooks.md (theory + WHY/WHEN/HOW)
   ↓
2. Run exercises/01-hooks (see it working)
   ↓
3. Experiment with the code (modify, break, fix)
   ↓
4. Read the source code (understand implementation)
   ↓
5. Build something new (apply what you learned)
```

## 🎯 Key Features

### ✨ Interactive Demos
- **7 Working Examples** - Each demo is fully functional and demonstrates specific concepts
- **Console Logging** - See exactly when components render and effects run
- **Real-time Updates** - Hot Module Replacement for instant feedback

### 🛠️ Mock API with json-server
- **Realistic Data** - Users, transactions, categories with proper structure
- **Full REST API** - GET, POST, PUT, PATCH, DELETE operations
- **Filtering & Pagination** - Query parameters for advanced operations
- **Persistent Changes** - Modifications saved to db.json
- **Documentation** - [API.md](exercises/01-hooks/API.md) with all endpoints

### 📘 TypeScript First
- **Type Safety** - Catch errors before runtime
- **Better DX** - Autocomplete and inline documentation
- **Real-world Approach** - How modern React apps are built
- **Type Definitions** - Interfaces for User, Transaction, Category

### 🎨 Production-Ready Patterns
- **Custom Hooks** - Reusable logic extraction
- **Error Boundaries** - Graceful error handling
- **Component Structure** - Organized, maintainable code
- **Configuration Management** - Centralized API config

## 📊 What You'll Learn

### Fundamental Understanding
- ✅ **Why** each hook exists and what problem it solves
- ✅ **When** to use each hook (and when not to)
- ✅ **How** to use hooks correctly with best practices
- ✅ **Common pitfalls** and how to avoid them

### Practical Skills
- ✅ Build custom hooks for reusable logic
- ✅ Optimize performance with memoization
- ✅ Handle side effects and cleanup properly
- ✅ Integrate TypeScript for type safety
- ✅ Structure React applications professionally

### Performance Optimization
- ✅ When to use useMemo vs useCallback vs React.memo
- ✅ How to measure and improve performance
- ✅ Avoid common performance bottlenecks
- ✅ Debouncing and throttling patterns

## 🔍 Code Examples

### useState - Simple State
```typescript
// exercises/01-hooks/src/App.tsx - Counter Component
const [count, setCount] = useState(0);

// Functional update when new state depends on previous
setCount(prev => prev + 1);
```

### useEffect - Side Effects with Cleanup
```typescript
// exercises/01-hooks/src/App.tsx - Timer Component
useEffect(() => {
  const intervalId = setInterval(() => {
    setSeconds(prev => prev + 1);
  }, 1000);

  // Cleanup function prevents memory leaks
  return () => clearInterval(intervalId);
}, [isRunning]);
```

### Custom Hook - useDebounce
```typescript
// exercises/01-hooks/src/custom-hooks/useDebounce.ts
const debouncedValue = useDebounce(searchInput, 500);

// API calls only happen after user stops typing
useEffect(() => {
  if (debouncedValue) {
    fetchSearchResults(debouncedValue);
  }
}, [debouncedValue]);
```

### API Integration with useApi
```typescript
// exercises/01-hooks/src/App.tsx - Custom Hooks Demo
const { data: users, isLoading, error } = useApi<User[]>(
  getApiUrl(API_CONFIG.ENDPOINTS.USERS)
);

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;
return <UserList users={users} />;
```

## 📚 Documentation Structure

Each topic includes comprehensive documentation:

### For Each Hook/Concept
- **Purpose** - What it does in plain English
- **Why** - The problem it solves
- **When to use** - Specific scenarios and use cases
- **When NOT to use** - Common misuses
- **How to use** - Code examples with explanations
- **Best practices** - Do's and don'ts
- **Common pitfalls** - Mistakes to avoid
- **Performance considerations** - Optimization tips
- **Code reference** - Link to working example

## 🧪 Testing Your Knowledge

After completing Topic 1, you should be able to:

- [ ] Explain when to use useState vs useReducer
- [ ] Write useEffect with proper cleanup functions
- [ ] Optimize components with useMemo and useCallback
- [ ] Build custom hooks for reusable logic
- [ ] Handle errors with Error Boundaries
- [ ] Type React components with TypeScript
- [ ] Fetch data from APIs with proper loading/error states
- [ ] Implement debouncing for search inputs
- [ ] Persist state to localStorage
- [ ] Structure a React application professionally

## 🛠️ Tech Stack

- **React 19** - Latest features and patterns
- **TypeScript 5** - Type safety and better DX
- **Vite** - Fast build tool with HMR
- **json-server** - Mock REST API for development
- **ESLint** - Code quality and consistency

## 📈 Progress Tracking

- ✅ **Topic 1: React Hooks** (Complete - January 6, 2026)
  - Core Hooks: useState, useReducer, useEffect, useMemo, useCallback
  - Custom Hooks: useDebounce, useLocalStorage, useApi, useAuth
  - TypeScript Integration
  - Error Boundaries
  - Mock API Setup

- 🔜 **Topic 2: Component Patterns** (Coming Soon)
- 🔜 **Topic 3: State Management** (Coming Soon)
- 🔜 **Topic 4: Routing & Navigation** (Coming Soon)
- 🔜 **Topic 5: Testing** (Coming Soon)

## 🤝 Contributing

This is a learning repository. Feel free to:
- Report issues or unclear explanations
- Suggest improvements to examples
- Add more practice scenarios
- Share your learning experience

## 📖 Additional Resources

### Official Documentation
- [React Docs](https://react.dev/) - Official React documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide

### Recommended Reading
- React Hooks [Rules](https://react.dev/reference/rules/rules-of-hooks)
- [Performance Optimization](https://react.dev/learn/render-and-commit)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## 💡 Tips for Success

1. **Don't rush** - Take time to understand WHY, not just HOW
2. **Experiment** - Break things and fix them to learn
3. **Read the source** - All code is commented and explained
4. **Console is your friend** - Check logs to see render patterns
5. **Practice regularly** - Build small projects using these concepts
6. **Ask questions** - If something is unclear, research or ask

## 🎓 Learning Outcomes

By completing this learning path, you'll be able to:

✅ Build production-ready React applications
✅ Write clean, maintainable, type-safe code
✅ Optimize performance effectively
✅ Handle complex state management
✅ Create reusable custom hooks
✅ Implement error handling properly
✅ Work with APIs and async operations
✅ Follow React best practices

---

**Start Learning:** [Topic 1 - React Hooks](docs/01-hooks.md)

**Last Updated:** January 6, 2026  
**Status:** Active Development 🚀
