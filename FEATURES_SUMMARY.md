# Coloured Corners - Features Summary

## Overview
A full-stack authentication and user management system with hybrid auth support (Google OAuth + Local Email/Password) and comprehensive email verification and password recovery flows.

---

## Core Features

### 1. Authentication System

#### Local Authentication
- **User Registration**: Create accounts with email, password, first name, and last name
  - Email uniqueness validation
  - Password hashing with bcryptjs (10-round salt)
  - Auto email verification token generation (24-hour expiration)
  - Verification email sent automatically on signup
  
- **User Login**: Authenticate with email and password
  - Case-insensitive, trimmed email matching
  - Password validation via bcrypt comparison
  - Email verification requirement before access
  - JWT token generation on successful login

#### Google OAuth 2.0 Integration
- **OAuth Flow Initiation**: Direct to Google's authorization endpoint
- **Callback Handling**: 
  - Exchanges authorization code for access token
  - Fetches user profile data from Google
  - Automatic account provisioning on first login
  - Account linking for existing users
  - Email auto-verification via Google trust
- **Security**: Never returns Google tokens to client; only internal JWT

#### Session Management
- **JWT Token Generation**
  - Payload: user ID, role, email status
  - Configurable expiration (default 7 days)
  - Signed with environment secret
  - Secure Bearer token validation on protected routes

---

### 2. Email Verification & Management

#### Email Verification Flow
- **Initial Verification**: Required during registration
  - Unique verification token (crypto-random, hashed with SHA256)
  - 24-hour token expiration
  - Verification link sent to user email
  - User must verify before login access
  
#### Resend Verification
- **Endpoint**: `POST /resend-verification`
- Allows unverified users to request a new verification link
- Prevents resend for already-verified accounts
- New token generation with 24-hour expiration

#### Email Status Tracking
- States: `UNVERIFIED`, `VERIFIED`
- Enforced at login to prevent unverified account access

---

### 3. Password Management

#### Forgot Password Flow
- **Request Reset**: `POST /forgot-password`
  - Accepts email address
  - Generates reset token (crypto-random, hashed)
  - 1-hour token expiration
  - Reset link emailed to user
  - Generic response prevents email enumeration attacks

#### Reset Password
- **Endpoint**: `POST /reset-password/:token`
- Validates reset token and expiration
- Enforces minimum 6-character password
- Updates password with automatic bcrypt hashing
- Clears reset token after successful reset
- User can immediately log in with new password

---

### 4. User Model & Data

#### User Attributes
| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Primary key |
| `email` | String | Unique identifier, lowercase + trimmed |
| `passwordHash` | String | Bcrypt hashed password (nullable for OAuth-only) |
| `firstName` | String | User's first name |
| `lastName` | String | User's last name |
| `role` | String | Access control (default: CUSTOMER) |
| `authProvider` | String | Auth method (local, google) |
| `oauthId` | String | Google's user ID (unique if set) |
| `emailStatus` | String | Verification state (UNVERIFIED, VERIFIED) |
| `verificationToken` | String | Email verification token (hashed) |
| `verificationTokenExpires` | Date | Token expiration timestamp |
| `resetPasswordToken` | String | Password reset token (hashed) |
| `resetPasswordExpires` | Date | Token expiration timestamp |

#### Security Features
- Email auto-lowercased and trimmed on validation
- Password auto-hashed on create/update (bcryptjs)
- Instance method: `isValidPassword()` for login validation
- Timestamps: `createdAt`, `updatedAt` auto-managed

---

### 5. Authorization & Access Control

#### Authentication Middleware
- **Middleware**: `protect`
- Validates JWT from `Authorization: Bearer <token>` header
- Verifies token signature and payload
- Confirms user still exists in database
- Attaches user object to request for downstream use
- Returns 401 for missing/invalid/expired tokens

#### Role-Based Access Control (RBAC)
- **Middleware**: `authorizeRoles(...roles)`
- Checks user role against allowed roles
- Returns 403 if unauthorized
- Must be used after `protect` middleware
- Supports multiple allowed roles

---

### 6. API Endpoints

#### Authentication Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/auth/google/login` | Initiate Google OAuth flow |
| GET | `/auth/google/callback` | Google OAuth callback handler |
| POST | `/auth/register` | Local user registration |
| POST | `/auth/login` | Local user login |
| GET | `/auth/verify-email/:token` | Email verification confirmation |
| POST | `/auth/resend-verification` | Resend verification email |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password/:token` | Complete password reset |

---

### 7. Frontend Pages

| Page | Route | Purpose |
|------|-------|---------|
| SignUp | `/sign-up` | User registration form |
| SignIn | `/sign-in` | User login form |
| VerifyEmail | `/verify/:token` | Email verification confirmation |
| PendingVerification | `/pending-verification` | Waiting for email verification state |
| ForgotPassword | `/forgot-password` | Initiate password reset |
| ResetPassword | `/reset-password/:token` | Complete password reset |
| LandingPage | `/` | Welcome/entry point |

---

## Security Considerations

✓ Password hashing with bcryptjs (10-round salt)  
✓ JWT token validation on protected routes  
✓ Email verification requirement before login  
✓ OAuth token never exposed to client  
✓ Vague error messages prevent email enumeration  
✓ Token expiration enforced (verification: 24h, reset: 1h, JWT: 7d)  
✓ Hashed tokens stored in database (SHA256)  
✓ Role-based access control for protected resources  

---

## Technology Stack

**Backend**
- Node.js + Express
- Sequelize ORM (Database)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT)
- axios (OAuth token exchange)

**Frontend**
- React
- Vite (Build tool)
- React Router (Navigation)

**Services**
- Google OAuth 2.0
- Email service (sendEmail utility)

---

## Environment Variables Required

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
JWT_SECRET
JWT_EXPIRES_IN
VITE_FRONTEND_URL
EMAIL_USER
EMAIL_PASSWORD
```

---

**Last Updated**: May 1, 2026
