# Topic 2: RTK Query, React Hook Form & Zod

**Learning Approach:** Project-Based Learning  
**Practice Project:** E-Commerce CRUD App ([projects/rtk-query-ecommerce-crud/](../projects/rtk-query-ecommerce-crud/))  
**Completion Date:** January 8, 2026

> **🎯 Learning Goal:** Master modern React data fetching with RTK Query, form handling with React Hook Form, and schema validation with Zod - understand how to build production-ready CRUD applications with TypeScript type safety, optimistic updates, and automatic cache management.

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [RTK Query](#rtk-query)
   - [What is RTK Query?](#what-is-rtk-query)
   - [Core Concepts](#core-concepts)
   - [Setting Up RTK Query](#setting-up-rtk-query)
   - [Creating API Slice](#creating-api-slice)
   - [Query Hooks](#query-hooks)
   - [Mutation Hooks](#mutation-hooks)
   - [Cache Management & Tags](#cache-management--tags)
   - [Automatic Refetching](#automatic-refetching)
3. [React Hook Form](#react-hook-form)
   - [What is React Hook Form?](#what-is-react-hook-form)
   - [Core Features](#core-features)
   - [Basic Usage](#basic-usage)
   - [Form Validation](#form-validation)
   - [TypeScript Integration](#typescript-integration-with-forms)
4. [Zod Schema Validation](#zod-schema-validation)
   - [What is Zod?](#what-is-zod)
   - [Schema Definition](#schema-definition)
   - [Type Inference](#type-inference)
   - [Integration with React Hook Form](#integration-with-react-hook-form)
5. [React Router DOM](#react-router-dom)
   - [Setting Up Routes](#setting-up-routes)
   - [Navigation & Params](#navigation--params)
   - [Route State](#route-state)
6. [Complete CRUD Implementation](#complete-crud-implementation)
7. [Key Learnings & Best Practices](#key-learnings--best-practices)
8. [Common Pitfalls](#common-pitfalls)
9. [Practice Project Overview](#practice-project-overview)

---

## Introduction

### The Modern React Stack

Modern React applications require efficient data fetching, form handling, and validation. This guide covers the industry-standard tools that solve these problems:

**The Problem:**
1. 🔴 **Manual API Management** - Writing fetch calls, loading states, error handling repeatedly
2. 🔴 **Cache Headaches** - When to refetch? How to invalidate? Manual cache management
3. 🔴 **Form Complexity** - Re-renders on every keystroke, complex validation logic
4. 🔴 **Type Safety** - Runtime vs compile-time validation mismatch
5. 🔴 **Boilerplate Code** - Hundreds of lines for simple CRUD operations

**The Solution:**
1. ✅ **RTK Query** - Automated data fetching, caching, and state management
2. ✅ **React Hook Form** - Performant forms with minimal re-renders
3. ✅ **Zod** - TypeScript-first schema validation with type inference
4. ✅ **React Router** - Declarative routing with type-safe navigation

---

## RTK Query

### What is RTK Query?

RTK Query is a powerful data fetching and caching tool built into Redux Toolkit. It's Redux Toolkit's answer to React Query, but fully integrated with Redux.

### Why RTK Query?

**Traditional Approach Problems:**
```typescript
// ❌ Traditional way - SO MUCH CODE!
function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Manually handle refetch, cache invalidation, optimistic updates...
}
```

**RTK Query Way:**
```typescript
// ✅ RTK Query - ONE LINE!
function ProductsList() {
  const { data, isLoading, error } = useGetProductsQuery();
  // Automatic caching, refetching, error handling! 🎉
}
```

### Core Concepts

#### 1. **API Slice**
A single source of truth for all API endpoints

#### 2. **Endpoints**
Define your API operations (queries and mutations)

#### 3. **Queries**
Read operations (GET) - automatic caching and refetching

#### 4. **Mutations**
Write operations (POST, PUT, DELETE) - trigger cache invalidation

#### 5. **Tags**
Label cached data for smart invalidation

---

### Setting Up RTK Query

**Implementation Reference:** [store.ts](../projects/rtk-query-ecommerce-crud/app/store.ts)

#### Step 1: Install Dependencies

```bash
npm install @reduxjs/toolkit react-redux
```

#### Step 2: Create API Slice

**Implementation Reference:** [productsApi.ts](../projects/rtk-query-ecommerce-crud/src/services/productsApi.ts)

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  rating: {
    rate: number;
    count: number;
  };
}

export const productsApi = createApi({
  // Unique key for the API slice in Redux store
  reducerPath: "productsApi",
  
  // Base query configuration
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3003/' }),
  
  // Tag types for cache invalidation
  tagTypes: ['Products'],
  
  // Define endpoints
  endpoints: (builder) => ({
    // Define your queries and mutations here
  }),
});
```

#### Step 3: Configure Store

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { productsApi } from '../src/services/productsApi'
import { setupListeners } from '@reduxjs/toolkit/query'

export const store = configureStore({
  reducer: {
    // Add the API slice reducer to the store
    [productsApi.reducerPath]: productsApi.reducer,
  },
  
  // Add the API middleware for caching, invalidation, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware),
})

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch)
```

#### Step 4: Provide Store to App

```typescript
import { Provider } from 'react-redux';
import { store } from './app/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

---

### Creating API Slice

### Query Endpoints (Read Operations)

#### Get All Products

```typescript
endpoints: (builder) => ({
  getProducts: builder.query<Product[], void>({
    // The API endpoint path
    query: () => 'products',
    
    // Provide tags for cache management
    providesTags: (result) => 
      result
        ? [
            // Tag each individual product
            ...result.map(({ id }) => ({ type: 'Products' as const, id })),
            // Tag the list itself
            { type: 'Products', id: 'LIST' }
          ]
        : [{ type: 'Products', id: 'LIST' }],
  }),
})
```

**What's happening here?**
- `builder.query<ReturnType, ArgumentType>` - Type-safe query definition
- `query: () => 'products'` - Returns URL path (GET /products)
- `providesTags` - Labels this cached data for invalidation

#### Get Single Product

```typescript
getProduct: builder.query<Product, number>({
  // Use parameter in URL
  query: (id) => `products/${id}`,
  
  // Tag this specific product
  providesTags: (result, error, id) => [{ type: 'Products', id }],
}),
```

---

### Mutation Endpoints (Write Operations)

#### Create Product (POST)

```typescript
addProduct: builder.mutation<Product, Omit<Product, 'id'>>({
  query: (body) => ({
    url: `products/`,
    method: 'POST',
    body,
  }),
  
  // Invalidate the products list to trigger refetch
  invalidatesTags: [{ type: 'Products', id: 'LIST' }],
}),
```

**What's happening?**
- `builder.mutation<ReturnType, ArgumentType>` - Defines a mutation
- `invalidatesTags` - After success, refetch all queries with these tags
- Server returns new product, list automatically refetches! 🎉

#### Update Product (PUT)

```typescript
updateProduct: builder.mutation<Product, Product>({
  query: ({ id, ...body }) => ({
    url: `products/${id}`,
    method: 'PUT',
    body,
  }),
  
  // Invalidate both the specific product and the list
  invalidatesTags: (result, error, { id }) => [
    { type: 'Products', id },
    { type: 'Products', id: 'LIST' }
  ],
}),
```

#### Delete Product (DELETE)

```typescript
deleteProduct: builder.mutation<{ success: boolean; id: number }, number>({
  query: (id) => ({
    url: `products/${id}`,
    method: 'DELETE',
  }),
  
  // Invalidate after deletion
  invalidatesTags: (result, error, id) => [
    { type: 'Products', id },
    { type: 'Products', id: 'LIST' }
  ],
}),
```

---

### Query Hooks

RTK Query automatically generates React hooks from your endpoints!

**Implementation Reference:** [ProductsView.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsView.tsx)

#### Using Query Hooks

```typescript
import { useGetProductsQuery } from '../services/productsApi';

function ProductsView() {
  const { 
    data,           // The fetched data
    isLoading,      // First load
    isFetching,     // Background refetch
    isError,        // Error occurred
    error,          // Error details
    refetch         // Manual refetch function
  } = useGetProductsQuery();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.toString()}</p>;
  
  return (
    <div>
      {data?.map(product => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
}
```

#### Query with Parameters

```typescript
import { useGetProductQuery } from '../services/productsApi';

function ProductDetail({ productId }: { productId: number }) {
  const { data: product, isLoading } = useGetProductQuery(productId);
  
  if (isLoading) return <p>Loading product...</p>;
  return <div>{product?.title}</div>;
}
```

#### Conditional Fetching (Skip Query)

**Implementation Reference:** [ProductsForm.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsForm.tsx#L36-L40)

```typescript
function ProductForm({ id }: { id?: string }) {
  const productFromState = location.state?.product;
  
  // Only fetch if in edit mode AND no state data available
  const { data: product, isLoading } = useGetProductQuery(Number(id), {
    skip: !id || !!productFromState,  // Skip the query if conditions met
  });
  
  // Use state data if available, otherwise API data
  const actualProduct = productFromState || product;
}
```

**Why skip?** Prevents unnecessary API calls when data is already available!

---

### Mutation Hooks

#### Using Mutation Hooks

**Implementation Reference:** [ProductsView.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsView.tsx#L12-L15)

```typescript
import { useDeleteProductMutation } from '../services/productsApi';

function ProductCard({ product }: { product: Product }) {
  // Returns [trigger function, result object]
  const [deleteProduct, { isLoading, isError }] = useDeleteProductMutation();

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id).unwrap();
      // Success! RTK Query automatically refetches the list
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isLoading}
    >
      {isLoading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

#### Add/Update Pattern

**Implementation Reference:** [ProductsForm.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsForm.tsx#L44-L48)

```typescript
function ProductForm({ id }: { id?: string }) {
  const isEditMode = !!id;
  
  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditMode) {
        await updateProduct({ ...data, id: Number(id) }).unwrap();
      } else {
        await addProduct(data).unwrap();
      }
      navigate('/'); // Navigate after success
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const isSubmitting = isAdding || isUpdating;
}
```

**Key Points:**
- `.unwrap()` - Returns promise with data or throws error
- Automatic cache invalidation triggers list refetch
- Loading states for better UX

---

### Cache Management & Tags

#### Understanding Tags

Tags are labels for cached data. They enable smart cache invalidation:

```typescript
// When you QUERY (read), you PROVIDE tags
getProducts: builder.query({
  query: () => 'products',
  providesTags: [{ type: 'Products', id: 'LIST' }],
}),

// When you MUTATE (write), you INVALIDATE tags
addProduct: builder.mutation({
  query: (body) => ({
    url: 'products',
    method: 'POST',
    body,
  }),
  invalidatesTags: [{ type: 'Products', id: 'LIST' }],
}),
```

**Flow:**
1. `useGetProductsQuery()` fetches and caches data with tag `{type: 'Products', id: 'LIST'}`
2. Later, `addProduct()` runs successfully
3. It invalidates tag `{type: 'Products', id: 'LIST'}`
4. RTK Query automatically refetches all queries with that tag
5. List updates automatically! 🎉

#### Tag Patterns

**List + Detail Pattern:**
```typescript
getProducts: builder.query<Product[], void>({
  providesTags: (result) => 
    result
      ? [
          ...result.map(({ id }) => ({ type: 'Products', id })),
          { type: 'Products', id: 'LIST' }
        ]
      : [{ type: 'Products', id: 'LIST' }],
}),

updateProduct: builder.mutation<Product, Product>({
  invalidatesTags: (result, error, { id }) => [
    { type: 'Products', id },      // Invalidate specific product
    { type: 'Products', id: 'LIST' } // Also invalidate list
  ],
}),
```

**Why both?** 
- Invalidating `{id}` updates detail views
- Invalidating `{id: 'LIST'}` updates list views
- Both stay in sync! 🔄

---

### Automatic Refetching

RTK Query automatically refetches in these scenarios:

#### 1. **On Mount**
First component using a query fetches data

#### 2. **On Window Focus**
User returns to tab (configurable)

```typescript
setupListeners(store.dispatch); // Enables this behavior
```

#### 3. **After Mutations**
When tags are invalidated

#### 4. **Manual Refetch**
```typescript
const { data, refetch } = useGetProductsQuery();

<button onClick={refetch}>Refresh</button>
```

#### 5. **Polling (Optional)**
```typescript
const { data } = useGetProductsQuery(undefined, {
  pollingInterval: 3000, // Refetch every 3 seconds
});
```

---

## React Hook Form

### What is React Hook Form?

React Hook Form is a performant, flexible form library with easy-to-use validation. It minimizes re-renders and reduces boilerplate.

### Why React Hook Form?

**Traditional Controlled Form Problems:**
```typescript
// ❌ Traditional way - Re-renders on EVERY keystroke!
function Form() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  // ... many more fields
  
  return (
    <>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <input value={price} onChange={e => setPrice(Number(e.target.value))} />
      <input value={description} onChange={e => setDescription(e.target.value)} />
      {/* Component re-renders 3 times for 3 characters typed! */}
    </>
  );
}
```

**React Hook Form Way:**
```typescript
// ✅ React Hook Form - Uncontrolled, minimal re-renders!
function Form() {
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      <input {...register('price', { valueAsNumber: true })} />
      <input {...register('description')} />
      {/* Only re-renders on submit! */}
    </form>
  );
}
```

---

### Core Features

#### 1. **Uncontrolled Components**
Uses refs instead of state - fewer re-renders

#### 2. **Built-in Validation**
Native HTML5 validation + custom rules

#### 3. **TypeScript Support**
Full type safety for form data

#### 4. **Tiny Bundle Size**
~9KB minified + gzipped

#### 5. **Easy Integration**
Works with any UI library (Material-UI, Chakra, etc.)

---

### Basic Usage

**Implementation Reference:** [ProductsForm.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsForm.tsx#L50-L62)

#### Setup

```bash
npm install react-hook-form
```

#### Simple Form

```typescript
import { useForm } from 'react-hook-form';

interface FormData {
  title: string;
  price: number;
}

function ProductForm() {
  const {
    register,           // Register inputs
    handleSubmit,       // Handle form submission
    formState: { errors }, // Validation errors
    reset,              // Reset form
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data); // { title: "...", price: 123 }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      <input {...register('price', { valueAsNumber: true })} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**What's `{...register('title')}`?**
```typescript
// It spreads these props onto your input:
{
  name: 'title',
  ref: (ref) => { /* register ref */ },
  onChange: (e) => { /* track changes */ },
  onBlur: (e) => { /* track blur */ }
}
```

---

### Form Validation

#### Built-in HTML5 Validation

```typescript
<input
  {...register('title', {
    required: 'Title is required',
    minLength: {
      value: 3,
      message: 'Title must be at least 3 characters'
    },
    maxLength: {
      value: 100,
      message: 'Title must be less than 100 characters'
    }
  })}
/>

{errors.title && (
  <p className="error">{errors.title.message}</p>
)}
```

#### Custom Validation

```typescript
<input
  {...register('price', {
    required: 'Price is required',
    validate: {
      positive: (value) => value > 0 || 'Price must be positive',
      realistic: (value) => value < 1000000 || 'Price seems unrealistic',
    }
  })}
/>
```

#### Async Validation

```typescript
<input
  {...register('email', {
    validate: async (value) => {
      const exists = await checkEmailExists(value);
      return !exists || 'Email already taken';
    }
  })}
/>
```

---

### TypeScript Integration with Forms

**Implementation Reference:** [ProductsForm.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsForm.tsx#L13-L24)

#### Type-Safe Form

```typescript
import { useForm } from 'react-hook-form';

interface ProductFormData {
  title: string;
  price: number;
  description: string;
  category: string;
  rating: {
    rate: number;
    count: number;
  };
}

function ProductForm() {
  // Type parameter gives full autocomplete and type checking
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>();

  const onSubmit = (data: ProductFormData) => {
    // data is fully typed!
    console.log(data.title);     // ✅ Autocomplete works
    console.log(data.invalid);   // ❌ TypeScript error
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Full autocomplete for field names */}
      <input {...register('title')} />
      <input {...register('price', { valueAsNumber: true })} />
      
      {/* Nested fields work too */}
      <input {...register('rating.rate', { valueAsNumber: true })} />
      <input {...register('rating.count', { valueAsNumber: true })} />
    </form>
  );
}
```

---

## Zod Schema Validation

### What is Zod?

Zod is a TypeScript-first schema validation library. It validates data at runtime AND provides TypeScript types at compile time.

### Why Zod?

**The Problem:**
```typescript
// TypeScript types only exist at compile time
interface User {
  email: string;
  age: number;
}

// But runtime data might be wrong!
const userData = await api.fetchUser(); // Returns 'any'
// userData.age could be a string, null, undefined, etc.
// TypeScript can't help you here! 😱
```

**Zod Solution:**
```typescript
import { z } from 'zod';

// Define schema (validates + creates type)
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(120),
});

// Type inference - TypeScript type from schema!
type User = z.infer<typeof userSchema>;

// Runtime validation
const result = userSchema.safeParse(userData);
if (result.success) {
  const user: User = result.data; // Fully typed and validated! ✅
}
```

---

### Schema Definition

**Implementation Reference:** [ProductsForm.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsForm.tsx#L13-L23)

#### Basic Schema

```bash
npm install zod
```

```typescript
import { z } from 'zod';

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  rating: z.object({
    rate: z.number().min(0).max(5, "Rating must be between 0 and 5"),
    count: z.number().min(0, "Count must be positive"),
  }),
});
```

#### Common Validators

```typescript
// Strings
z.string()
  .min(3, "Too short")
  .max(100, "Too long")
  .email("Invalid email")
  .url("Invalid URL")
  .regex(/^[A-Z]/, "Must start with capital")
  .trim()
  .toLowerCase()

// Numbers
z.number()
  .min(0, "Must be positive")
  .max(100, "Too high")
  .int("Must be integer")
  .positive("Must be positive")
  .nonnegative("Cannot be negative")

// Booleans
z.boolean()

// Dates
z.date()
  .min(new Date('2020-01-01'))
  .max(new Date())

// Arrays
z.array(z.string())
  .min(1, "At least one item required")
  .max(10, "Too many items")

// Enums
z.enum(['small', 'medium', 'large'])

// Unions
z.union([z.string(), z.number()])

// Optional
z.string().optional()
z.number().nullable()
z.string().nullish() // null or undefined

// Default values
z.string().default("default value")
z.number().default(0)
```

---

### Type Inference

The magic of Zod - get TypeScript types from your schema:

```typescript
const productSchema = z.object({
  title: z.string(),
  price: z.number(),
  category: z.enum(['electronics', 'clothing', 'books']),
  inStock: z.boolean(),
  tags: z.array(z.string()),
});

// Infer TypeScript type from schema
type Product = z.infer<typeof productSchema>;

// Equivalent to:
// interface Product {
//   title: string;
//   price: number;
//   category: 'electronics' | 'clothing' | 'books';
//   inStock: boolean;
//   tags: string[];
// }
```

**One schema, double benefit:**
1. ✅ Runtime validation
2. ✅ Compile-time types

---

### Integration with React Hook Form

**Implementation Reference:** [ProductsForm.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsForm.tsx)

#### Setup

```bash
npm install @hookform/resolvers
```

#### Complete Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define Zod schema
const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  rating: z.object({
    rate: z.number().min(0).max(5, "Rating must be between 0 and 5"),
    count: z.number().min(0, "Count must be positive"),
  }),
});

// 2. Infer TypeScript type
type ProductFormData = z.infer<typeof productSchema>;

// 3. Use in form with zodResolver
function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema), // 🎉 Zod validates on submit!
  });

  const onSubmit = (data: ProductFormData) => {
    // data is validated AND typed!
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <p>{errors.title.message}</p>}
      
      <input {...register('price', { valueAsNumber: true })} />
      {errors.price && <p>{errors.price.message}</p>}
      
      <input {...register('rating.rate', { valueAsNumber: true })} />
      {errors.rating?.rate && <p>{errors.rating.rate.message}</p>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Benefits:**
1. ✅ Single source of truth for validation
2. ✅ TypeScript types automatically generated
3. ✅ Validation messages defined with schema
4. ✅ Reusable across components

---

## React Router DOM

### Setting Up Routes

**Implementation Reference:** [App.tsx](../projects/rtk-query-ecommerce-crud/src/App.tsx)

#### Installation

```bash
npm install react-router-dom
```

#### Basic Routing

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductsView />} />
        <Route path="/products/add" element={<ProductsForm />} />
        <Route path="/products/edit/:id" element={<ProductsForm />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Route Patterns:**
- `/` - Home/list page
- `/products/add` - Add form
- `/products/edit/:id` - Edit form (`:id` is a parameter)

---

### Navigation & Params

**Implementation Reference:** [ProductsForm.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsForm.tsx#L27-L31)

#### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom';

function ProductForm() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await saveProduct(data);
    navigate('/'); // Navigate back to list
  };

  return (
    <>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate('/')}>Home</button>
    </>
  );
}
```

#### Reading URL Parameters

```typescript
import { useParams } from 'react-router-dom';

function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  return <h2>{isEditMode ? `Edit Product ${id}` : 'Add Product'}</h2>;
}
```

#### Link Navigation

**Implementation Reference:** [ProductsView.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsView.tsx#L32-L43)

```typescript
import { Link } from 'react-router-dom';

<Link to="/products/add">Add Product</Link>
<Link to={`/products/edit/${product.id}`}>Edit</Link>
```

---

### Route State

Pass data between routes without URL parameters:

**Implementation Reference:** [ProductsView.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsView.tsx#L86-L90)

#### Passing State

```typescript
import { useNavigate } from 'react-router-dom';

function ProductsView() {
  const navigate = useNavigate();

  const handleEdit = (product: Product) => {
    navigate(`/products/edit/${product.id}`, {
      state: { product } // Pass product data
    });
  };

  return (
    <button onClick={() => handleEdit(product)}>
      Edit
    </button>
  );
}
```

#### Receiving State

**Implementation Reference:** [ProductsForm.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsForm.tsx#L33-L40)

```typescript
import { useLocation } from 'react-router-dom';

function ProductForm() {
  const location = useLocation();
  const { id } = useParams();
  
  // Get product from router state (instant, no loading)
  const productFromState = location.state?.product as Product | undefined;

  // Only fetch from API if no state data (direct URL access/refresh)
  const { data: productFromAPI } = useGetProductQuery(Number(id), {
    skip: !!productFromState, // Skip API call if we have state data
  });

  // Use state data if available, otherwise API data
  const product = productFromState || productFromAPI;
}
```

**Why this pattern?**
- ✅ Instant navigation (no loading) when navigating from list
- ✅ Still works on direct URL access or refresh (fetches from API)
- ✅ Best user experience!

---

## Complete CRUD Implementation

### The Full Picture

Here's how everything works together in a real CRUD app:

#### 1. **API Layer** (RTK Query)
```typescript
// services/productsApi.ts
export const productsApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3003/' }),
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({ /* ... */ }),
    getProduct: builder.query<Product, number>({ /* ... */ }),
    addProduct: builder.mutation<Product, Omit<Product, 'id'>>({ /* ... */ }),
    updateProduct: builder.mutation<Product, Product>({ /* ... */ }),
    deleteProduct: builder.mutation<void, number>({ /* ... */ }),
  }),
});
```

#### 2. **Store Configuration**
```typescript
// app/store.ts
export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware),
});
```

#### 3. **Routing**
```typescript
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<ProductsView />} />
    <Route path="/products/add" element={<ProductsForm />} />
    <Route path="/products/edit/:id" element={<ProductsForm />} />
  </Routes>
</BrowserRouter>
```

#### 4. **List View**
```typescript
// features/products/ProductsView.tsx
const { data, isLoading } = useGetProductsQuery();
const [deleteProduct] = useDeleteProductMutation();

// Automatically refetches after mutations!
```

#### 5. **Form View** (Add/Edit)
```typescript
// features/products/ProductsForm.tsx
const { register, handleSubmit } = useForm({
  resolver: zodResolver(productSchema), // Zod validation
});

const [addProduct] = useAddProductMutation();
const [updateProduct] = useUpdateProductMutation();

// Automatically invalidates cache and refetches list!
```

### Data Flow

```
User Action → Form Submit → Zod Validation → 
RTK Mutation → API Call → Cache Invalidation → 
Automatic Refetch → UI Update
```

**Example: Adding a Product**
1. User fills form
2. Clicks "Submit"
3. Zod validates (client-side)
4. `addProduct()` sends POST request
5. Server creates product
6. RTK Query invalidates `Products` tag
7. All components using `useGetProductsQuery()` refetch
8. List updates with new product
9. Form navigates back to list

**All automatic! No manual cache management! 🎉**

---

## Key Learnings & Best Practices

### RTK Query Best Practices

1. **✅ Use Tags Wisely**
```typescript
// ❌ BAD - Invalidates everything
invalidatesTags: ['Products']

// ✅ GOOD - Granular invalidation
invalidatesTags: [
  { type: 'Products', id },
  { type: 'Products', id: 'LIST' }
]
```

2. **✅ Skip Unnecessary Queries**
```typescript
// Don't fetch if you already have the data
const { data } = useGetProductQuery(id, {
  skip: !!productFromState
});
```

3. **✅ Use `.unwrap()` for Error Handling**
```typescript
try {
  const product = await addProduct(data).unwrap();
  // Success handling
} catch (error) {
  // Error handling
}
```

4. **✅ Type Your API Responses**
```typescript
// Always define return types
builder.query<Product[], void>() // Returns Product[], takes void
builder.mutation<Product, Omit<Product, 'id'>>() // Returns Product, takes Product without id
```

---

### React Hook Form Best Practices

1. **✅ Use `valueAsNumber` for Number Inputs**
```typescript
<input 
  type="number" 
  {...register('price', { valueAsNumber: true })} 
/>
// Otherwise you get strings!
```

2. **✅ Reset Form After Success**
```typescript
const onSubmit = async (data) => {
  await saveProduct(data);
  reset(); // Clear the form
};
```

3. **✅ Set Default Values for Edit Mode**
```typescript
useEffect(() => {
  if (product) {
    reset({
      title: product.title,
      price: product.price,
      // ...
    });
  }
}, [product, reset]);
```

4. **✅ Show Loading State on Submit Button**
```typescript
<button 
  type="submit" 
  disabled={isSubmitting}
>
  {isSubmitting ? 'Saving...' : 'Save'}
</button>
```

---

### Zod Best Practices

1. **✅ Use Type Inference**
```typescript
// Define schema once
const schema = z.object({ /* ... */ });

// Infer type (DRY principle)
type FormData = z.infer<typeof schema>;
```

2. **✅ Provide Clear Error Messages**
```typescript
z.string().min(3, "Title must be at least 3 characters") // ✅
z.string().min(3) // ❌ Generic error message
```

3. **✅ Use Nested Schemas**
```typescript
const ratingSchema = z.object({
  rate: z.number().min(0).max(5),
  count: z.number().min(0),
});

const productSchema = z.object({
  title: z.string(),
  rating: ratingSchema, // Reusable!
});
```

4. **✅ Transform Data**
```typescript
const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  price: z.string().transform((val) => parseFloat(val)),
});
```

---

### React Router Best Practices

1. **✅ Pass State for Instant Navigation**
```typescript
navigate(`/edit/${id}`, { state: { product } });
// Instant! No loading spinner
```

2. **✅ But Also Fetch as Fallback**
```typescript
const productFromState = location.state?.product;
const { data } = useGetProductQuery(id, { skip: !!productFromState });
// Still works on direct URL access
```

3. **✅ Use Descriptive Route Paths**
```typescript
// ✅ GOOD - Clear intent
/products/add
/products/edit/:id

// ❌ BAD - Unclear
/products/new
/products/:action/:id
```

---

## Common Pitfalls

### ❌ RTK Query Pitfalls

**1. Forgetting Middleware**
```typescript
// ❌ WRONG - Queries won't work!
configureStore({
  reducer: { [api.reducerPath]: api.reducer }
})

// ✅ CORRECT
configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
})
```

**2. Not Unwrapping Mutations**
```typescript
// ❌ WRONG - Can't catch errors
addProduct(data);

// ✅ CORRECT
try {
  await addProduct(data).unwrap();
} catch (error) {
  // Handle error
}
```

**3. Over-Invalidation**
```typescript
// ❌ BAD - Refetches EVERYTHING
invalidatesTags: ['Products']

// ✅ GOOD - Surgical invalidation
invalidatesTags: [{ type: 'Products', id: 'LIST' }]
```

---

### ❌ React Hook Form Pitfalls

**1. Forgetting `valueAsNumber`**
```typescript
// ❌ WRONG - price will be a string!
<input type="number" {...register('price')} />

// ✅ CORRECT
<input type="number" {...register('price', { valueAsNumber: true })} />
```

**2. Not Handling Nested Fields**
```typescript
// ❌ WRONG
<input {...register('rating')} />

// ✅ CORRECT
<input {...register('rating.rate', { valueAsNumber: true })} />
<input {...register('rating.count', { valueAsNumber: true })} />
```

**3. Mutating Default Values**
```typescript
// ❌ WRONG
const defaultValues = { title: '' };
useForm({ defaultValues });
defaultValues.title = 'Changed'; // Mutation!

// ✅ CORRECT
useForm({ 
  defaultValues: { title: '' } // New object each time
});
```

---

### ❌ Zod Pitfalls

**1. Not Using Type Inference**
```typescript
// ❌ WRONG - Duplicate definitions
const schema = z.object({ name: z.string() });
interface FormData { name: string; }

// ✅ CORRECT - Single source of truth
const schema = z.object({ name: z.string() });
type FormData = z.infer<typeof schema>;
```

**2. Wrong Number Validation**
```typescript
// ❌ WRONG - String input gets parsed as NaN
z.number().min(0)

// ✅ CORRECT - Use with valueAsNumber
<input {...register('price', { valueAsNumber: true })} />
```

---

## Practice Project Overview

### Project: E-Commerce CRUD App

**Location:** [projects/rtk-query-ecommerce-crud/](../projects/rtk-query-ecommerce-crud/)

#### Features Implemented

✅ **List Products** - View all products with RTK Query  
✅ **Add Product** - Form with Zod validation  
✅ **Edit Product** - Pre-filled form with instant navigation  
✅ **Delete Product** - Optimistic UI updates  
✅ **TypeScript** - Full type safety throughout  
✅ **Tailwind CSS** - Modern, responsive UI  
✅ **Automatic Caching** - Smart refetching and invalidation  

#### Project Structure

```
rtk-query-ecommerce-crud/
├── app/
│   └── store.ts                 # Redux store configuration
├── src/
│   ├── App.tsx                  # Routes configuration
│   ├── services/
│   │   └── productsApi.ts       # RTK Query API slice
│   └── main.tsx
├── features/
│   └── products/
│       ├── ProductsView.tsx     # List with delete
│       └── ProductsForm.tsx     # Add/Edit form with validation
└── database/
    └── db.json                  # JSON Server database
```

#### Running the Project

```bash
# Install dependencies
npm install

# Terminal 1: Start JSON Server (backend)
npx json-server --watch database/db.json --port 3003

# Terminal 2: Start Vite (frontend)
npm run dev
```

#### Key Files to Study

1. **[productsApi.ts](../projects/rtk-query-ecommerce-crud/src/services/productsApi.ts)** - RTK Query setup, endpoints, tags
2. **[ProductsForm.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsForm.tsx)** - Form with Zod validation, edit mode
3. **[ProductsView.tsx](../projects/rtk-query-ecommerce-crud/features/products/ProductsView.tsx)** - List with delete, navigation
4. **[store.ts](../projects/rtk-query-ecommerce-crud/app/store.ts)** - Store configuration
5. **[App.tsx](../projects/rtk-query-ecommerce-crud/src/App.tsx)** - Routing setup

---

## Summary

### What You Learned

1. **RTK Query** - Automated data fetching, caching, and cache invalidation
2. **React Hook Form** - Performant forms with minimal re-renders
3. **Zod** - Runtime validation + TypeScript type inference
4. **React Router** - Declarative routing with state management
5. **Integration** - How these tools work together in a production app

### The Stack

```
RTK Query     → Data fetching & caching
React Hook Form → Form state management
Zod           → Schema validation & types
React Router  → Routing & navigation
TypeScript    → Type safety
Tailwind      → Styling
```

### Key Takeaways

✅ **Single Source of Truth** - Zod schema = validation + types  
✅ **Automatic Everything** - Caching, refetching, invalidation  
✅ **Type Safety** - End-to-end TypeScript support  
✅ **Performance** - Minimal re-renders, optimized updates  
✅ **Developer Experience** - Less boilerplate, more productivity  

---

## Next Steps

1. **Add Features** - Search, filter, pagination
2. **Authentication** - JWT tokens, protected routes
3. **Optimistic Updates** - Update UI before server responds
4. **Error Boundaries** - Graceful error handling
5. **Testing** - Unit tests for mutations and queries
6. **Real Backend** - Replace JSON Server with actual API
7. **Advanced Patterns** - Infinite scroll, prefetching

---

**🎉 Congratulations!** You now understand the modern React data fetching and form management stack. These tools are industry-standard and will serve you well in production applications.

**Practice Project:** Continue building on the e-commerce app - add more features, refine the UI, and experiment with advanced RTK Query features like optimistic updates and prefetching!
