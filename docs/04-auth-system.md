# Authentication System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Authentication Flows](#authentication-flows)
   - [Sign in with Google (Social Login)](#sign-in-with-google-social-login)
   - [Sign in with Email & Password](#sign-in-with-email--password)
   - [Sign up with Email & Password](#sign-up-with-email--password)
   - [Forgot Password](#forgot-password)
   - [Reset Password](#reset-password)
   - [Change Password (In Profile)](#change-password-in-profile)
5. [Account Unification Strategy](#account-unification-strategy)
6. [Security Features](#security-features)

---

## System Overview

The authentication system uses a **hybrid architecture** combining Firebase Authentication for identity management and MongoDB for user profile/role storage.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Frontend                           │
│                      (Port: 5173)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Login.tsx  │  │ForgotPassword│  │PasswordReset │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
│                   ┌────────▼─────────┐                           │
│                   │  AuthContext.tsx  │                           │
│                   └────────┬─────────┘                           │
│                            │                                      │
│         ┌──────────────────┼──────────────────┐                  │
│         │                  │                  │                  │
│    ┌────▼─────┐     ┌─────▼──────┐    ┌─────▼──────┐           │
│    │Firebase  │     │   api.ts   │    │firebase.ts │           │
│    │Auth SDK  │     │(REST API)  │    │  Config    │           │
│    └────┬─────┘     └─────┬──────┘    └────────────┘           │
└─────────┼─────────────────┼────────────────────────────────────┘
          │                 │
          │                 │ HTTP Requests
          │                 │ (Bearer Token)
          │                 │
┌─────────▼─────────────────▼────────────────────────────────────┐
│                    Firebase Services                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │          Firebase Authentication                        │    │
│  │  - Google OAuth                                         │    │
│  │  - Email/Password Auth                                  │    │
│  │  - Token Generation & Verification                      │    │
│  │  - Password Reset Email Delivery                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
          │
          │ ID Token
          │
┌─────────▼─────────────────────────────────────────────────────┐
│                   FastAPI Backend                              │
│                    (Port: 8000)                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  main.py   │  │  auth.py   │  │ models.py  │               │
│  └─────┬──────┘  └─────┬──────┘  └────────────┘               │
│        │               │                                        │
│        │     ┌─────────▼──────────┐                            │
│        │     │ Firebase Admin SDK │                            │
│        │     │  Token Verification│                            │
│        │     └────────────────────┘                            │
│        │                                                        │
│        └─────────┬──────────────────────────────────────────┐  │
│                  │                                          │  │
└──────────────────┼──────────────────────────────────────────┼──┘
                   │                                          │
                   │                                          │
┌──────────────────▼──────────────────────────────────────────▼──┐
│                       MongoDB Database                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  users Collection                                       │    │
│  │  - email (UNIQUE INDEX - Primary Identifier)            │    │
│  │  - firebase_uid (NON-UNIQUE INDEX)                      │    │
│  │  - role (admin/user)                                    │    │
│  │  - name, photo_url, provider, timestamps                │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router v6** for navigation
- **Firebase Client SDK v9** (modular)
- **Vite** as build tool

### Backend
- **FastAPI** (Python 3.9+)
- **Firebase Admin SDK** for token verification
- **Motor** (async MongoDB driver)
- **Pydantic** for data validation

### Databases & Services
- **Firebase Authentication** - Identity provider
- **MongoDB** - User profile and role storage
- **Firebase Email Service** - Password reset emails

---

## Database Schema

### MongoDB `users` Collection

```javascript
{
  "_id": ObjectId("..."),
  "firebase_uid": "abc123...",           // Firebase user ID (can change)
  "email": "user@example.com",           // UNIQUE - Primary identifier
  "name": "John Doe",                    // Optional
  "photo_url": "https://...",            // Optional
  "provider": "google" | "email",        // Authentication provider
  "role": "admin" | "user",              // User role
  "created_at": ISODate("2024-01-01"),   // Account creation
  "last_login": ISODate("2024-01-15")    // Last login timestamp
}
```

### Indexes
```javascript
// Primary unique identifier for account merging
db.users.createIndex({ email: 1 }, { unique: true })

// Non-unique index for Firebase UID lookup
db.users.createIndex({ firebase_uid: 1 })
```

### Firebase Authentication
Firebase stores:
- User credentials (email/password hash, Google OAuth tokens)
- Email verification status
- User ID (firebase_uid)
- Disabled/enabled status

---

## Authentication Flows

### Sign in with Google (Social Login)

#### Frontend Flow (`Login.tsx` → `AuthContext.tsx`)

```typescript
// 1. User clicks "Sign in with Google" button
handleGoogleSignIn()
  ↓
// 2. AuthContext.signInWithGoogle()
signInWithPopup(auth, googleProvider)  // Firebase SDK call
  ↓
// 3. Firebase returns user data
result.user = {
  uid: "firebase_unique_id",
  email: "user@gmail.com",
  displayName: "John Doe",
  photoURL: "https://..."
}
  ↓
// 4. Get Firebase ID token
token = await firebaseUser.getIdToken()
  ↓
// 5. Register/sync with backend
authService.register({
  firebase_uid: firebaseUser.uid,
  email: firebaseUser.email,
  name: firebaseUser.displayName,
  photo_url: firebaseUser.photoURL,
  provider: "google"
})
```

#### Backend Flow (`main.py` → `MongoDB`)

```python
# POST /auth/register
@app.post("/auth/register")
async def register_user(user_data: User):
    # 1. Check if user exists by EMAIL (primary key)
    existing_user = await users.find_one({"email": user_data.email})
    
    if existing_user:
        # ACCOUNT MERGING SCENARIO
        if existing_user["firebase_uid"] != user_data.firebase_uid:
            # Same email, different provider
            # Update firebase_uid to new provider
            await users.update_one(
                {"email": user_data.email},
                {"$set": {
                    "firebase_uid": user_data.firebase_uid,
                    "provider": user_data.provider,
                    "last_login": datetime.utcnow()
                }}
            )
            return updated_user
        else:
            # Same user, same provider
            return "User already registered"
    
    # 2. New user - insert into MongoDB
    await users.insert_one({
        "firebase_uid": user_data.firebase_uid,
        "email": user_data.email,
        "name": user_data.name,
        "photo_url": user_data.photo_url,
        "provider": "google",
        "role": "user",  # Default role
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    })
    
    return user_response
```

#### Database Updates

**Step 1: Firebase**
```
Firebase Authentication creates/updates:
- UID: abc123
- Email: user@gmail.com
- Provider: google.com
```

**Step 2: MongoDB**
```javascript
// New user inserted
db.users.insertOne({
  firebase_uid: "abc123",
  email: "user@gmail.com",  // ← UNIQUE INDEX
  name: "John Doe",
  photo_url: "https://...",
  provider: "google",
  role: "user",
  created_at: ISODate("2024-01-15"),
  last_login: ISODate("2024-01-15")
})
```

#### Complete Flow Diagram

```
┌──────────┐                  ┌──────────┐                 ┌──────────┐
│  User    │                  │ Firebase │                 │ Backend  │
│ (Chrome) │                  │   Auth   │                 │ FastAPI  │
└────┬─────┘                  └────┬─────┘                 └────┬─────┘
     │                             │                            │
     │  1. Click "Sign in with    │                            │
     │     Google"                 │                            │
     ├────────────────────────────>│                            │
     │                             │                            │
     │  2. Google OAuth Popup      │                            │
     │<────────────────────────────┤                            │
     │                             │                            │
     │  3. User approves           │                            │
     ├────────────────────────────>│                            │
     │                             │                            │
     │  4. Firebase returns        │                            │
     │     ID Token + User Data    │                            │
     │<────────────────────────────┤                            │
     │                             │                            │
     │  5. POST /auth/register                                  │
     │     (firebase_uid, email, name, provider)                │
     ├─────────────────────────────────────────────────────────>│
     │                             │                            │
     │                             │  6. Backend checks MongoDB │
     │                             │     for existing email     │
     │                             │                      ┌─────▼─────┐
     │                             │                      │  MongoDB  │
     │                             │                      │  users    │
     │                             │                      └─────┬─────┘
     │                             │                            │
     │  7. User data saved/merged                               │
     │<─────────────────────────────────────────────────────────┤
     │                             │                            │
     │  8. GET /auth/me (with Bearer Token)                     │
     ├─────────────────────────────────────────────────────────>│
     │                             │                            │
     │                             │  9. Verify token with      │
     │                             │     Firebase Admin SDK     │
     │                             │<───────────────────────────┤
     │                             │                            │
     │                             │  10. Token valid,          │
     │                             │      return user + role    │
     │                             │────────────────────────────>│
     │                             │                            │
     │  11. User logged in                                      │
     │     (role: user/admin)                                   │
     │<─────────────────────────────────────────────────────────┤
     │                             │                            │
```

---

### Sign in with Email & Password

#### Frontend Flow (`Login.tsx` → `AuthContext.tsx`)

```typescript
// 1. User enters email and password, clicks "Sign in"
handleEmailSignIn(email, password)
  ↓
// 2. AuthContext.signInWithEmail()
signInWithEmailAndPassword(auth, email, password)  // Firebase SDK
  ↓
// 3. Firebase verifies credentials
//    - Checks email exists in Firebase Auth
//    - Validates password hash
  ↓
// 4. Get Firebase ID token
token = await firebaseUser.getIdToken()
  ↓
// 5. Fetch user data from backend
authService.getCurrentUser(token)
```

#### Backend Flow (`main.py` → `auth.py`)

```python
# GET /auth/me
@app.get("/auth/me")
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    # get_current_user dependency chain:
    # 1. verify_firebase_token(token)  ← Extracts Bearer token
    # 2. Firebase Admin SDK verifies token
    # 3. Query MongoDB for user by firebase_uid
    # 4. Attach role to decoded token
    
    return {
        "uid": current_user["uid"],
        "email": current_user["email"],
        "name": current_user.get("name"),
        "photo_url": current_user.get("photo_url"),
        "role": current_user["role"]  # From MongoDB
    }
```

#### auth.py - Token Verification

```python
async def verify_firebase_token(credentials: HTTPAuthorizationCredentials):
    token = credentials.credentials
    
    # 1. Verify with Firebase Admin SDK
    decoded_token = auth.verify_id_token(token)
    # decoded_token = { uid, email, iat, exp, ... }
    
    # 2. Fetch user from MongoDB
    user = await users_collection.find_one({
        "firebase_uid": decoded_token["uid"]
    })
    
    # 3. Attach role from MongoDB
    if user:
        decoded_token["role"] = user.get("role", "user")
        decoded_token["db_user_id"] = str(user["_id"])
        
        # 4. Update last_login timestamp
        await users_collection.update_one(
            {"firebase_uid": decoded_token["uid"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
    
    return decoded_token
```

#### Database Updates

**Step 1: Firebase Authentication**
```
Firebase verifies:
- Email: admin@example.com
- Password: (compares hash)
✓ Valid → Returns ID Token
```

**Step 2: MongoDB**
```javascript
// Backend queries and updates
db.users.findOne({ firebase_uid: "xyz789" })
db.users.updateOne(
  { firebase_uid: "xyz789" },
  { $set: { last_login: ISODate("2024-01-15T10:30:00Z") } }
)
```

#### Complete Flow Diagram

```
┌──────────┐                  ┌──────────┐                 ┌──────────┐
│  User    │                  │ Firebase │                 │ Backend  │
│ (Browser)│                  │   Auth   │                 │ FastAPI  │
└────┬─────┘                  └────┬─────┘                 └────┬─────┘
     │                             │                            │
     │  1. Enter email & password  │                            │
     │     Click "Sign in"         │                            │
     ├────────────────────────────>│                            │
     │                             │                            │
     │  2. Firebase validates      │                            │
     │     email/password          │                            │
     │     (password hash check)   │                            │
     │                             │                            │
     │  3. Returns ID Token        │                            │
     │<────────────────────────────┤                            │
     │                             │                            │
     │  4. GET /auth/me                                         │
     │     Authorization: Bearer <token>                        │
     ├─────────────────────────────────────────────────────────>│
     │                             │                            │
     │                             │  5. Verify ID Token        │
     │                             │<───────────────────────────┤
     │                             │                            │
     │                             │  6. Token valid,           │
     │                             │     decoded = {uid, email} │
     │                             │────────────────────────────>│
     │                             │                            │
     │                             │                      ┌─────▼─────┐
     │                             │                      │  MongoDB  │
     │                             │  7. Query by         │           │
     │                             │     firebase_uid     │  users    │
     │                             │                      └─────┬─────┘
     │                             │                            │
     │                             │  8. Return user + role     │
     │                             │     + update last_login    │
     │                             │<───────────────────────────┤
     │                             │                            │
     │  9. User data with role                                  │
     │<─────────────────────────────────────────────────────────┤
     │                             │                            │
```

---

### Sign up with Email & Password

#### Frontend Flow (`Login.tsx` → `AuthContext.tsx`)

```typescript
// 1. User enters email, password, name (optional)
handleEmailSignUp(email, password, name)
  ↓
// 2. AuthContext.signUpWithEmail()
createUserWithEmailAndPassword(auth, email, password)  // Firebase SDK
  ↓
// 3. Firebase creates new user account
result.user = {
  uid: "new_firebase_uid",
  email: "newuser@example.com"
}
  ↓
// 4. Get Firebase ID token
token = await firebaseUser.getIdToken()
  ↓
// 5. Register with backend
authService.register({
  firebase_uid: firebaseUser.uid,
  email: firebaseUser.email,
  name: name,
  provider: "email"
})
```

#### Backend Flow (Same as Google Login)

```python
# POST /auth/register
# Handles account merging if email exists
# See "Sign in with Google" section for details
```

#### Database Updates

**Step 1: Firebase Authentication**
```
Firebase creates user:
- UID: new123
- Email: newuser@example.com
- Password: (hashed and stored)
- Provider: password
```

**Step 2: MongoDB**
```javascript
// Check existing user by email
const existing = db.users.findOne({ email: "newuser@example.com" })

if (!existing) {
  // New user - insert
  db.users.insertOne({
    firebase_uid: "new123",
    email: "newuser@example.com",
    name: "Jane Smith",
    provider: "email",
    role: "user",
    created_at: ISODate("2024-01-15"),
    last_login: ISODate("2024-01-15")
  })
}
```

---

### Forgot Password

#### Frontend Flow (`ForgotPassword.tsx` → `AuthContext.tsx`)

```typescript
// 1. User enters email, clicks "Send Reset Link"
handleSubmit(email)
  ↓
// 2. AuthContext.resetPassword()
const actionCodeSettings = {
  url: window.location.origin + '/auth/reset-password',
  handleCodeInApp: true
}
firebaseSendPasswordResetEmail(auth, email, actionCodeSettings)
  ↓
// 3. Firebase sends email with reset link
```

#### Firebase Email Service

Firebase automatically sends an email with a link like:
```
http://localhost:5173/auth/reset-password
  ?mode=resetPassword
  &oobCode=1xAb10o-ChpjxcH-XirB7GBvBZhDl2Oe9f0qKe8m3aQAAAGbsYYV8w
  &apiKey=AIzaSyBxbuq49V58RWPqW9mNf_bEQUuw264DjHU
  &lang=en
```

#### Backend Involvement

**None** - Forgot password is handled entirely by Firebase:
- Firebase validates email exists
- Generates secure one-time code (oobCode)
- Sends email via Firebase Email Service
- No backend API calls

#### Database Updates

**Firebase Only:**
```
Firebase creates:
- Password reset code (oobCode)
- Expiration time (1 hour)
- Links to user by email
```

**MongoDB:**
```
No changes - MongoDB is not involved in this step
```

#### Complete Flow Diagram

```
┌──────────┐                  ┌──────────┐                 ┌──────────┐
│  User    │                  │ Firebase │                 │  Email   │
│ (Browser)│                  │   Auth   │                 │ Service  │
└────┬─────┘                  └────┬─────┘                 └────┬─────┘
     │                             │                            │
     │  1. Enter email             │                            │
     │     Click "Send Reset Link" │                            │
     ├────────────────────────────>│                            │
     │                             │                            │
     │  2. Firebase validates      │                            │
     │     email exists            │                            │
     │     Generates oobCode       │                            │
     │                             │                            │
     │  3. Success response        │                            │
     │<────────────────────────────┤                            │
     │                             │                            │
     │                             │  4. Send password reset    │
     │                             │     email with link        │
     │                             ├───────────────────────────>│
     │                             │                            │
     │                                   5. Email delivered     │
     │<───────────────────────────────────────────────────────┤
     │                             │                            │
     │  6. User receives email     │                            │
     │     Subject: Reset Password │                            │
     │     Link: /auth/reset-      │                            │
     │           password?oobCode= │                            │
     │                             │                            │
```

---

### Reset Password

#### Frontend Flow (`PasswordReset.tsx`)

```typescript
// 1. User clicks link in email → Lands on /auth/reset-password?oobCode=...
useEffect(() => {
  const oobCode = searchParams.get("oobCode")
  verifyResetCode(oobCode)
})
  ↓
// 2. Verify the reset code with Firebase
firebaseVerifyPasswordResetCode(auth, oobCode)
  ↓
// 3. Firebase returns email associated with code
email = "user@example.com"  // User exists, code valid
  ↓
// 4. User enters new password, clicks "Reset Password"
handleSubmit(newPassword)
  ↓
// 5. Confirm password reset with Firebase
firebaseConfirmPasswordReset(auth, oobCode, newPassword)
  ↓
// 6. Firebase updates password, invalidates code
// 7. Redirect to login page
```

#### Backend Involvement

**None** - Password reset is handled entirely by Firebase:
- Firebase verifies oobCode validity
- Updates password hash in Firebase Auth
- Invalidates the reset code
- No backend API calls

#### Database Updates

**Firebase Authentication:**
```
Step 1: Verify oobCode
- Check code exists and not expired
- Return associated email

Step 2: Confirm password reset
- Update password hash
- Invalidate oobCode (single use)
- Revoke all existing sessions
```

**MongoDB:**
```
No changes - Password is stored in Firebase, not MongoDB
MongoDB only stores user profile data (name, role, etc.)
```

#### Complete Flow Diagram

```
┌──────────┐                  ┌──────────┐
│  User    │                  │ Firebase │
│ (Browser)│                  │   Auth   │
└────┬─────┘                  └────┬─────┘
     │                             │
     │  1. Click email link        │
     │     /auth/reset-password    │
     │     ?oobCode=abc123         │
     │                             │
     │  2. Verify oobCode          │
     ├────────────────────────────>│
     │                             │
     │  3. Code valid, return      │
     │     email: user@example.com │
     │<────────────────────────────┤
     │                             │
     │  4. Show reset form         │
     │     User enters new password│
     │                             │
     │  5. Submit new password     │
     │     with oobCode            │
     ├────────────────────────────>│
     │                             │
     │  6. Firebase updates        │
     │     password hash           │
     │     Invalidates oobCode     │
     │                             │
     │  7. Success response        │
     │<────────────────────────────┤
     │                             │
     │  8. Redirect to login       │
     │                             │
```

---

### Change Password (In Profile)

#### Frontend Flow (`UserProfile.tsx` → `AuthContext.tsx`)

```typescript
// 1. User enters current password and new password
handlePasswordChange(currentPassword, newPassword)
  ↓
// 2. AuthContext.updatePassword()
// Step A: Reauthenticate user (Firebase security requirement)
const credential = EmailAuthProvider.credential(
  currentUser.email,
  currentPassword
)
await reauthenticateWithCredential(currentUser, credential)
  ↓
// Step B: Update password
await firebaseUpdatePassword(currentUser, newPassword)
```

#### Backend Involvement

**None** - Password change is handled by Firebase:
- Firebase verifies current password
- Updates to new password hash
- No backend API calls needed

#### Database Updates

**Firebase Authentication:**
```
Step 1: Reauthenticate
- Verify current password hash
- Generate new session token

Step 2: Update password
- Replace password hash with new one
- Keep same firebase_uid (no change)
```

**MongoDB:**
```
No changes - Passwords stored in Firebase only
```

---

## Account Unification Strategy

### Problem Statement
A user can sign in with:
1. Google OAuth (user@gmail.com)
2. Email/Password (user@gmail.com)

**Same email, different providers** → Should be treated as the SAME account.

### Solution: Email as Primary Key

#### MongoDB Schema Design
```javascript
// Email is UNIQUE index (primary identifier)
db.users.createIndex({ email: 1 }, { unique: true })

// firebase_uid is NON-UNIQUE (can change when switching providers)
db.users.createIndex({ firebase_uid: 1 })
```

#### Backend Account Merging Logic

```python
@app.post("/auth/register")
async def register_user(user_data: User):
    # 1. Query by EMAIL (not firebase_uid)
    existing = await users.find_one({"email": user_data.email})
    
    if existing:
        # Check if firebase_uid is different
        if existing["firebase_uid"] != user_data.firebase_uid:
            # MERGE SCENARIO: Same email, different provider
            logger.info(f"Merging account: {existing['provider']} → {user_data.provider}")
            
            # Update to new provider's firebase_uid
            await users.update_one(
                {"email": user_data.email},
                {"$set": {
                    "firebase_uid": user_data.firebase_uid,
                    "provider": user_data.provider,
                    "last_login": datetime.utcnow()
                }}
            )
            # Preserve: role, name, photo_url, created_at
            
            return merged_user
```

### Example Scenario

**Day 1: User signs up with Email/Password**
```javascript
// MongoDB after signup
{
  firebase_uid: "email_uid_123",
  email: "john@example.com",  // ← PRIMARY KEY
  provider: "email",
  role: "user",
  created_at: "2024-01-01"
}
```

**Day 2: Same user signs in with Google (same email)**
```javascript
// Backend detects same email
// Updates firebase_uid to Google's UID
{
  firebase_uid: "google_uid_456",  // ← CHANGED
  email: "john@example.com",       // ← SAME (primary key)
  provider: "google",              // ← CHANGED
  role: "user",                    // ← PRESERVED
  created_at: "2024-01-01",        // ← PRESERVED
  last_login: "2024-01-02"
}
```

**Result:** Same account, different login method. User retains role, data, and history.

---

## Security Features

### 1. Token-Based Authentication
- **Firebase ID Tokens** used for all authenticated requests
- Tokens are short-lived (1 hour expiry)
- Backend verifies tokens with Firebase Admin SDK on every request

### 2. Password Security
- Passwords never stored in MongoDB
- Firebase handles password hashing (bcrypt-based)
- Password reset uses secure one-time codes (oobCode)
- Reauthentication required for password changes

### 3. Role-Based Access Control (RBAC)
```python
# Higher-Order Component (HOC) protection
@app.get("/admin/dashboard")
async def admin_dashboard(current_user: dict = Depends(require_admin)):
    # require_admin checks if role == "admin"
    # Raises 403 Forbidden if not admin
    pass
```

### 4. CORS Protection
```python
# Backend CORS configuration
allow_origins = [
    "http://localhost:5173",  # Dev frontend
    "https://yourdomain.com"  # Production
]
```

### 5. Rate Limiting
```python
@limiter.limit("10/minute")
async def register_user(...):
    # Prevents brute force attacks
    pass
```

### 6. Index Strategy for Performance
- Email: UNIQUE index (fast lookup, prevents duplicates)
- firebase_uid: Non-unique index (fast secondary lookup)

### 7. Secure Password Reset Flow
- One-time use codes (oobCode)
- Codes expire after 1 hour
- Codes are invalidated after successful reset
- No password sent via email

### 8. Environment Variables
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...

# Backend (.env)
MONGODB_URL=mongodb://localhost:27017
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
```

---

## Error Handling

### Firebase Errors (Frontend)
```typescript
try {
  await signInWithEmailAndPassword(auth, email, password)
} catch (error) {
  if (error.code === "auth/user-not-found") {
    // Handle: No account with this email
  } else if (error.code === "auth/wrong-password") {
    // Handle: Incorrect password
  } else if (error.code === "auth/too-many-requests") {
    // Handle: Too many failed attempts
  }
}
```

### Backend Errors
```python
# MongoDB duplicate email
try:
    await users.insert_one(user_dict)
except pymongo.errors.DuplicateKeyError:
    raise HTTPException(
        status_code=400,
        detail="Email already registered"
    )

# Firebase token verification failed
except auth.InvalidIdTokenError:
    raise HTTPException(
        status_code=401,
        detail="Invalid authentication token"
    )
```

---

## Testing the System

### 1. Test Google Login
```bash
# Open frontend
http://localhost:5173/login

# Click "Sign in with Google"
# Check MongoDB:
db.users.findOne({ email: "testuser@gmail.com" })
```

### 2. Test Email/Password Login
```bash
# Sign up with email
POST http://localhost:8000/auth/register
{
  "firebase_uid": "...",
  "email": "test@example.com",
  "provider": "email"
}

# Sign in
# Check last_login updated in MongoDB
```

### 3. Test Account Merging
```bash
# Day 1: Sign up with email test@example.com
# Day 2: Sign in with Google using test@example.com
# Check MongoDB - firebase_uid should change, email stays same
```

### 4. Test Password Reset
```bash
# Request reset
http://localhost:5173/forgot-password

# Check email for reset link
# Click link → Should open /auth/reset-password?oobCode=...

# Enter new password
# Try logging in with new password
```

---

## Production Deployment Checklist

### Firebase Configuration
- [ ] Update Firebase Auth domain to production URL
- [ ] Configure authorized domains in Firebase Console
- [ ] Set up Firebase email templates (branding)
- [ ] Enable email verification (optional)

### Backend Deployment
- [ ] Update CORS allowed origins
- [ ] Set strong MongoDB password
- [ ] Store Firebase credentials securely (not in git)
- [ ] Enable HTTPS only
- [ ] Set up monitoring (Sentry)
- [ ] Configure rate limiting properly

### Frontend Deployment
- [ ] Update Firebase config with production keys
- [ ] Update API_URL to production backend
- [ ] Build with `npm run build`
- [ ] Deploy to Vercel/Netlify
- [ ] Test all auth flows in production

---

## Troubleshooting

### "Failed to fetch" error during login
**Cause:** Backend not running or CORS issue

**Solution:**
```bash
# Check backend is running
curl http://localhost:8000/health

# Check MongoDB connection
# Check CORS configuration in main.py
```

### "Invalid authentication token"
**Cause:** Token expired or invalid

**Solution:**
```typescript
// Force token refresh
const token = await auth.currentUser.getIdToken(true)
```

### "Index conflict" error on backend startup
**Cause:** Old unique firebase_uid index exists

**Solution:**
```python
# Automatic migration in main.py lifespan handler
# Drops old unique index, creates new non-unique index
```

### Password reset email not received
**Cause:** Firebase email service not configured

**Solution:**
- Check Firebase Console → Authentication → Templates
- Verify email sender domain
- Check spam folder

---

## Summary

### Key Components
1. **Firebase Authentication** - Identity provider (manages credentials)
2. **MongoDB** - User profiles and roles (business logic data)
3. **FastAPI Backend** - Token verification and data sync
4. **React Frontend** - User interface and Firebase SDK integration

### Data Flow
```
User → Firebase (auth) → Get Token → Backend (verify) → MongoDB (role) → Response
```

### Account Unification
- **Email** is the primary unique identifier
- **firebase_uid** can change when switching providers
- Backend automatically merges accounts on duplicate email

### Security
- Tokens expire after 1 hour
- Passwords never stored in MongoDB (only in Firebase)
- Rate limiting on all endpoints
- RBAC for admin vs user access
- One-time reset codes with expiration

---

**End of Documentation**
