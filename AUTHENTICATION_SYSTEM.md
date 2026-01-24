# Backend Authentication System - Ready ✅

## System Status
✅ **Backend Server**: Running on `http://localhost:4000`
✅ **User Model**: Configured with password hashing
✅ **Authentication Routes**: All endpoints active
✅ **Database**: MongoDB connected

---

## How It Works

### 1. **User Signup** (Registration)
**Endpoint**: `POST http://localhost:4000/api/auth/signup`

**What Happens**:
- User fills signup form (name, email, mobile, password)
- Frontend sends data to backend
- Backend checks if email already exists
- If new user:
  - Password is automatically hashed using bcrypt (10 salt rounds)
  - User data saved to MongoDB `users` collection
  - JWT token generated (valid for 7 days)
  - Token + user info returned to frontend
  - Frontend stores token in localStorage
  - User automatically logged in

**Example Request**:
```json
{
  "name": "Raj Kumar",
  "email": "raj@example.com",
  "mobile": "9876543210",
  "password": "mypassword123"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "675f1234567890abcdef1234",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "mobile": "9876543210"
  }
}
```

**Database Storage** (MongoDB):
```json
{
  "_id": "675f1234567890abcdef1234",
  "name": "Raj Kumar",
  "email": "raj@example.com",
  "mobile": "9876543210",
  "password": "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890",  // Hashed password
  "createdAt": "2024-12-20T10:30:00.000Z",
  "updatedAt": "2024-12-20T10:30:00.000Z"
}
```

---

### 2. **User Login**
**Endpoint**: `POST http://localhost:4000/api/auth/user-login`

**What Happens**:
- User fills login form (email, password)
- Frontend sends credentials to backend
- Backend finds user by email in database
- Compares entered password with hashed password using bcrypt
- If match:
  - JWT token generated
  - Token + user info returned
  - Frontend stores token
  - User logged in
- If no match:
  - Error: "Invalid email or password"

**Example Request**:
```json
{
  "email": "raj@example.com",
  "password": "mypassword123"
}
```

**Example Response** (Success):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "675f1234567890abcdef1234",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "mobile": "9876543210"
  }
}
```

**Example Response** (Failure):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. **Password Security**

#### How Password Hashing Works:
```javascript
// Plain text password entered by user
"mypassword123"

// After bcrypt hashing (automatic on save)
"$2b$10$N9qo8uLOickgx2ZMRZoMye.IKv5j6Q4pQEJjH6.VTVIePz2hZ0H/."

// Same password hashed again produces different hash (due to salt)
"$2b$10$xkJDN6cG4HIo8KHZ1YjZkuZ9qo7nYr4jQz8H6.VTVIePz2hZ0H/."
```

**Security Features**:
- ✅ Passwords NEVER stored in plain text
- ✅ Uses bcrypt with 10 salt rounds
- ✅ Even if database is compromised, passwords are safe
- ✅ Each password hash is unique (even for same password)
- ✅ Automatic hashing on user.save() via Mongoose pre-hook

---

### 4. **Get Current User**
**Endpoint**: `GET http://localhost:4000/api/auth/user/me`

**Headers Required**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**What Happens**:
- Frontend sends token in Authorization header
- Backend verifies JWT token
- Extracts userId from token
- Finds user in database
- Returns user info (without password)

---

### 5. **User Logout**
**Endpoint**: `POST http://localhost:4000/api/auth/user-logout`

**What Happens**:
- Frontend calls logout endpoint
- Frontend removes token from localStorage
- User session cleared

---

## Database Collection: `users`

**Schema**:
```javascript
{
  name: String (required, trimmed),
  email: String (required, unique, lowercase, trimmed),
  mobile: String (required, trimmed, 10 digits),
  password: String (required, hashed, min 6 chars),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes**:
- `email`: Unique index for fast lookup and duplicate prevention

**Methods**:
- `comparePassword(candidatePassword)`: Compare plain password with hashed
- `toJSON()`: Automatically removes password from API responses

---

## Testing the System

### Test Signup:
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "1234567890",
    "password": "test123"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:4000/api/auth/user-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Test Get User:
```bash
curl http://localhost:4000/api/auth/user/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Frontend Integration

**Already Connected**:
- ✅ Signup form at `/auth` page
- ✅ Login form at `/auth` page
- ✅ AuthContext manages token & user state
- ✅ Token stored in localStorage
- ✅ Automatic redirect after login
- ✅ Navbar shows user icon when logged in
- ✅ Protected routes can check `useAuth()` hook

---

## Error Handling

**Common Errors**:
1. **Email already exists** (409)
2. **Invalid credentials** (401)
3. **Missing fields** (400)
4. **Invalid token** (401)
5. **User not found** (404)

All errors return:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Security Best Practices Implemented

✅ **Password Hashing**: bcrypt with salt
✅ **JWT Tokens**: Secure token-based auth
✅ **Input Validation**: Required fields, email format, mobile format
✅ **CORS Protection**: Only allowed origins can access API
✅ **No Password Exposure**: Password never returned in API responses
✅ **Token Expiry**: 7-day token lifetime
✅ **Unique Email**: Prevents duplicate accounts

---

## Ready to Use!

The system is **100% functional** and ready for production use:

1. ✅ User signs up → Data saved in MongoDB with hashed password
2. ✅ User logs in → Backend compares credentials → Returns JWT token
3. ✅ Token stored in frontend → User stays logged in
4. ✅ Navbar shows user icon with logout option
5. ✅ All routes working: signup, login, get user, logout

**Try it now**: Go to http://localhost:3000/auth and create an account!
