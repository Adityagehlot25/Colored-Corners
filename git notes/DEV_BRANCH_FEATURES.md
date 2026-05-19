# Coloured Corners - Development Branch (Dev) Feature Summary

**Current Branch Status**: `dev` (all merged features from feature branches)  
**Last Updated**: 19 May 2026  
**Version**: 0.1.0 (MVP)

---

## 📋 Executive Summary

**Coloured Corners** is a full-stack e-commerce marketplace platform with:
- ✅ Complete authentication system (Local + Google OAuth)
- ✅ Role-based access control (CUSTOMER, SELLER, ADMIN)
- ✅ Seller product management (create, update, inventory)
- ✅ Customer marketplace with shopping cart
- ✅ Dynamic product details and routing
- ✅ Modern UI with Tailwind CSS

**Tech Stack**:
- Backend: Node.js, Express, PostgreSQL, Sequelize
- Frontend: React 19, Vite, Tailwind CSS, Axios
- Auth: JWT, Google OAuth 2.0, bcryptjs

---

## 🔐 AUTHENTICATION & USER MANAGEMENT

### 1.1 Local Authentication
- **Sign Up**: Email/password registration with name, automatic role assignment (CUSTOMER by default)
- **Sign In**: Email/password login with JWT token generation
- **Email Verification**: 24-hour verification tokens sent to user email
- **Resend Verification**: Users can request new verification links
- **Password Recovery**: Forgot password flow with 1-hour reset tokens

### 1.2 Google OAuth 2.0 Integration
- Direct Google Sign In integration
- Automatic account provisioning on first login
- Account linking for existing users
- Secure token exchange (Google tokens never exposed to client)
- Email auto-verified via Google trust

### 1.3 Session & Token Management
- JWT tokens with embedded user ID, role, email status
- 7-day token expiration
- Secure Bearer token validation on protected routes
- Logout with localStorage token cleanup

### 1.4 Role-Based Access Control (RBAC)
| Role | Features |
|------|----------|
| **CUSTOMER** | Browse marketplace, add to cart, view product details |
| **SELLER** | Create products, manage inventory, update stock, view dashboard |
| **ADMIN** | (Placeholder) Full system access |

---

## 👥 USER ONBOARDING FLOWS

### 2.1 Local Registration Flow
```
1. User visits /signup
2. Fills form: First Name, Last Name, Email, Password, Role (CUSTOMER/SELLER)
3. Submit → Backend validates & creates user
4. Verification email sent
5. Redirect → /pending-verification
6. User clicks email link → /verify/:token
7. Email verified → Can login
8. Login → /dashboard
```

### 2.2 Google OAuth Flow (New User)
```
1. User clicks "Google Login"
2. Redirected to Google consent screen
3. User grants permissions
4. Backend exchanges code for profile
5. Auto-creates account (first-time only)
6. Sets localStorage.needsOnboarding = 'true'
7. Redirect → /oauth-success
8. OAuthSuccess detects flag
9. Redirect → /choose-role
10. User selects CUSTOMER or SELLER
11. Backend updates role in database
12. Redirect → /dashboard
```

### 2.3 Google OAuth Flow (Returning User)
```
1. User clicks "Google Login"
2. → Google consent screen
3. → Backend handles callback
4. → /oauth-success?token=JWT
5. No onboarding flag
6. Direct → /dashboard
```

---

## 🛍️ MARKETPLACE (CUSTOMER)

### 3.1 Product Browsing
- **Dashboard**: Central marketplace view with product grid
- **Live Product Feed**: Fetches from `GET /products` endpoint
- **Product Cards**: Display image, name, price, stock status
- **Stock Status Badge**: "Out of Stock" indicator for 0-quantity items
- **Product Grid**: Responsive flexbox layout with 250px cards

### 3.2 Product Detail Page (PDP)
- **Dynamic Routing**: `/product/:productId`
- **Product Information**: Full details (name, price, description, images, specs)
- **Stock Availability**: Real-time stock checks
- **Add to Cart**: Quantity selector and "Add to Cart" button

### 3.3 Shopping Cart
- **Slide-Out Cart UI**: Overlay cart drawer from right side
- **Dynamic Quantity Controls**: +/- buttons with real-time updates
- **Cart Summary**: Subtotal, tax, total calculations
- **Persistent Storage**: Cart data stored in localStorage
- **Remove Items**: Delete products from cart

### 3.4 Navigation
- **Navbar Component**: Sticky header with brand, navigation links, logout
- **Role-Aware Links**: Shows different options based on user role
- **Customer View**: Marketplace link always visible
- **Seller Link**: Only visible for SELLER/ADMIN roles

---

## 🏪 SELLER HUB (SELLER)

### 4.1 Seller Dashboard
- **Access Control**: Only SELLER and ADMIN roles can access `/seller-dashboard`
- **Inventory List**: Shows all products created by seller
- **Product Counter**: Live count of products in inventory
- **Stock Management**: Edit button on each product

### 4.2 Product Creation
- **Create Product Endpoint**: `POST /products` (protected)
- **Form Fields**:
  - Product name (`pName`)
  - Price (`price`)
  - Stock quantity (`pStock`)
  - Images (array of URLs)
  - Description (`desc`)
  - Category
  - Additional specs
- **Image Handling**: URL-based image storage
- **Seller Association**: `sellerId` automatically set from JWT token

### 4.3 Product Update
- **Stock Management**: `PUT /products/:id/stock` (protected)
- **Update Flow**:
  1. Seller clicks "Edit" button next to product
  2. Prompt appears with current stock
  3. Enter new stock quantity
  4. Backend validates ownership (403 if not seller's product)
  5. Updates `pStock` and auto-adjusts status:
     - If `pStock === 0` → Status = `OUT_OF_STOCK`
     - If `pStock > 0` and status was `OUT_OF_STOCK` → Status = `ACTIVE`
  6. Frontend refreshes inventory list
- **Seller Isolation**: Sellers can only update their own products

### 4.4 Inventory Operations
- **Fetch Seller Products**: `GET /products/seller` (protected)
- **Stock Validation**: Prevents invalid stock entries
- **Status Auto-Management**: ACTIVE ↔ OUT_OF_STOCK transitions

---

## 📦 PRODUCT MANAGEMENT (BACKEND)

### 5.1 Product Schema
```
Product {
  id: UUID,
  pName: String (required),
  price: Decimal,
  pStock: Integer (default 0),
  status: String ('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'),
  imgs: Array of Strings (image URLs),
  desc: String,
  sellerId: UUID (references User),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  ...additional fields
}
```

### 5.2 Product Endpoints
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/products` | GET | Public | List all products (marketplace) |
| `/products` | POST | Protected (SELLER) | Create product |
| `/products/seller` | GET | Protected | Get seller's products |
| `/products/:id` | GET | Public | Get single product details |
| `/products/:id` | PUT | Protected (SELLER) | Update product (full) |
| `/products/:id/stock` | PUT | Protected (SELLER) | Update stock only |
| `/products/:id` | DELETE | Protected (SELLER) | Delete product |

### 5.3 Business Rules Enforced
- **BR-CAT-01**: Products are isolated by seller (sellerId)
- **BR-CAT-02**: Stock = 0 sets status to OUT_OF_STOCK; restocking resets to ACTIVE
- **BR-CAT-03**: Sellers can only modify their own products (403 Unauthorized otherwise)
- **BR-CAT-04**: Price is non-negative
- **BR-CAT-05**: Stock is non-negative integer

---

## 🎨 FRONTEND COMPONENTS & PAGES

### 6.1 Authentication Pages
| Page | Route | Purpose |
|------|-------|---------|
| LandingPage | `/` | Welcome screen, login/signup buttons |
| SignUp | `/signup` | Registration form with role selection |
| SignIn | `/signin` | Login form |
| PendingVerification | `/pending-verification` | Verification email sent message |
| VerifyEmail | `/verify/:token` | Email verification handler |
| ForgotPassword | `/forgot-password` | Password reset request |
| ResetPassword | `/reset-password/:token` | New password entry |
| OAuthSuccess | `/oauth-success` | OAuth callback handler |
| ChooseRole | `/choose-role` | Role selection for new OAuth users |

### 6.2 Customer Pages
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/dashboard` | Marketplace product grid |
| ProductDetail | `/product/:id` | Full product page with cart button |

### 6.3 Seller Pages
| Page | Route | Purpose |
|------|-------|---------|
| SellerDashboard | `/seller-dashboard` | Inventory management (role-gated) |

### 6.4 Components
- **Navbar.jsx**: Global navigation with role-aware links
- **Cart (Slide-Out)**: Shopping cart drawer with quantity controls
- **Product Cards**: Reusable product display components

---

## 🎯 UI/UX FEATURES

### 7.1 Responsive Design
- **Mobile-First Approach**: Flexbox/Grid layouts
- **Breakpoints**: Adapts to tablet and desktop
- **Sticky Navbar**: Always accessible for navigation

### 7.2 Loading & Skeleton States
- **Skeleton Loaders**: Placeholder UI while fetching products
- **Smooth Transitions**: CSS transitions for cart, page changes

### 7.3 Error Handling
- **User-Friendly Messages**: ❌ Prefix for errors
- **Input Validation**: Real-time feedback
- **Network Error Recovery**: Retry mechanisms

### 7.4 Dark Theme
- **Dark UI**: `#0A0A0A` background with light text
- **Glassmorphism**: Backdrop blur effects on navbar
- **Color Coding**: Green (#16A34A) for seller, Blue (#2563EB) for customer

### 7.5 Tailwind CSS v4
- **Modern Styling**: Utility-first CSS framework
- **Responsive Classes**: `flex`, `gap`, `md:`, `lg:` prefixes
- **Consistent Colors**: Defined color palette

---

## 🔒 SECURITY FEATURES

### 8.1 Authentication Security
- **Password Hashing**: bcryptjs with 10-round salt
- **Token Encryption**: JWT signed with secret
- **Email Verification**: Prevents fake account creation
- **OAuth Token Handling**: Google tokens never exposed to client

### 8.2 Authorization & Access Control
- **Role-Based Gates**: Frontend & backend checks
- **Seller Isolation**: Sellers only access their own products
- **Protected Routes**: `protect` middleware validates JWT & role
- **Secure Endpoints**: All write operations require valid token

### 8.3 Input Validation
- **Email Format**: Standard email regex
- **Password Strength**: Minimum 6 characters
- **Stock Validation**: Non-negative integers
- **Role Whitelist**: Only CUSTOMER, SELLER, ADMIN accepted

### 8.4 Error Security
- **Generic Responses**: Email enumeration prevention
- **No Stack Traces**: Client never sees backend errors (user-friendly messages)

---

## 📊 DATABASE SCHEMA

### User Table
```
Users {
  id: UUID (primary key),
  email: VARCHAR (unique, lowercase),
  passwordHash: VARCHAR (nullable for OAuth),
  firstName: VARCHAR,
  lastName: VARCHAR,
  role: VARCHAR ('CUSTOMER', 'SELLER', 'ADMIN'),
  authProvider: VARCHAR ('local', 'google'),
  oauthId: VARCHAR (unique, nullable),
  emailStatus: VARCHAR ('UNVERIFIED', 'VERIFIED'),
  verificationToken: VARCHAR (hashed),
  verificationTokenExpires: TIMESTAMP,
  resetToken: VARCHAR (hashed, nullable),
  resetTokenExpires: TIMESTAMP (nullable),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Product Table
```
Products {
  id: UUID (primary key),
  pName: VARCHAR,
  price: DECIMAL,
  pStock: INTEGER,
  status: VARCHAR ('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'),
  imgs: JSONB (array of URLs),
  desc: TEXT,
  sellerId: UUID (foreign key → Users.id),
  category: VARCHAR,
  isPre: BOOLEAN (pre-order flag),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

---

## 🚀 API DOCUMENTATION

### Authentication Endpoints
```
POST   /auth/register              → Create account
POST   /auth/login                 → Login (returns JWT)
POST   /auth/resend-verification   → Resend verification email
GET    /auth/verify-email/:token   → Verify email
POST   /auth/forgot-password       → Request password reset
POST   /auth/reset-password/:token → Complete password reset
GET    /auth/google/login          → Start Google OAuth
GET    /auth/google/callback       → OAuth callback handler
PUT    /auth/update-role           → Update user role (protected)
```

### Product Endpoints
```
GET    /products                   → List all products
POST   /products                   → Create product (protected, seller)
GET    /products/seller            → Get seller's products (protected)
GET    /products/:id               → Get single product
PUT    /products/:id               → Update product (protected, seller)
PUT    /products/:id/stock         → Update stock only (protected, seller)
DELETE /products/:id               → Delete product (protected, seller)
```

---

## 📈 RECENT COMMITS (Latest Features)

| Commit | Feature |
|--------|---------|
| `a0302e9` | Skeleton loaders, UI refactoring to Tailwind v4 |
| `d2a951d` | Slide-out cart UI with quantity controls |
| `31bf1bc` | Dynamic product detail page (PDP) and routing |
| `b38e83e` | Product updation (stock management) |
| `bb5eb74` | Product creation pipeline and image handling |
| `92fa402` | Seller-protected endpoints + dashboard UI |
| `76479aa` | Merged dev into catalogue (role-based features) |
| `95d3cff` | Product schema, seeder, base catalogue UI |

---

## ✅ FEATURE COMPLETENESS

### Phase 1: Authentication (COMPLETE ✅)
- [x] Local registration & login
- [x] Google OAuth integration
- [x] Email verification
- [x] Password recovery
- [x] Role-based access control
- [x] JWT token management

### Phase 2: Product Management (COMPLETE ✅)
- [x] Product creation (seller)
- [x] Product listing (public)
- [x] Product detail page (customer)
- [x] Stock management (seller)
- [x] Seller inventory view
- [x] Seller product isolation

### Phase 3: Shopping Experience (COMPLETE ✅)
- [x] Product browsing (grid)
- [x] Shopping cart (add/remove/quantity)
- [x] Stock status display
- [x] Product detail page

### Phase 4: UI/UX Polish (COMPLETE ✅)
- [x] Responsive design
- [x] Dark theme
- [x] Navbar with role-aware navigation
- [x] Skeleton loaders
- [x] Slide-out cart
- [x] Tailwind CSS v4

---

## 🔄 NEXT STEPS (Future Enhancements)

### Priority 1 (High)
- [ ] Order management (create, view orders)
- [ ] Payment integration (Stripe/Razorpay)
- [ ] Admin dashboard (user management, analytics)
- [ ] Search & filters (product catalog)

### Priority 2 (Medium)
- [ ] Product reviews & ratings
- [ ] Wishlist feature
- [ ] Seller analytics (sales, revenue)
- [ ] Email notifications

### Priority 3 (Low)
- [ ] Inventory alerts
- [ ] Product recommendations
- [ ] Multi-currency support
- [ ] Internationalization (i18n)

---

## 📝 ENVIRONMENT SETUP

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/coloured_corners
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
VITE_FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend `.env`
```
VITE_BACKEND_URL=http://localhost:8080
```

---

## 🧪 TESTING CHECKLIST

- [ ] Sign up with email/password
- [ ] Verify email and login
- [ ] Login with Google OAuth
- [ ] Select role during Google onboarding
- [ ] Browse products as customer
- [ ] Add product to cart
- [ ] Create product as seller
- [ ] Update stock and verify status change
- [ ] View seller inventory
- [ ] Try to access seller dashboard as customer (should redirect)
- [ ] Logout and verify token cleanup

---

## 🎉 DEPLOYMENT STATUS

**Current Status**: Development (MVP ready for internal testing)  
**Readiness**: 85%  
**Blockers**: 
- Payment gateway integration
- Order management API
- Email service optimization

**Ready for Staging**: Yes  
**Ready for Production**: No (awaiting payment & order system)

---

**Last Reviewed**: 19 May 2026  
**Maintained By**: Development Team  
**Version**: 0.1.0 (MVP Phase)
