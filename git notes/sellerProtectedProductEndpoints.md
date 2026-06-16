productRoutes.js

Added protect middleware import and protected seller endpoints.
Fixed error response key (msg → message).
Added public GET / (products) and protected GET /seller (seller's products).
Added PUT /:id/stock to update stock with:
seller ownership check (403 if not owner),
validation and parse of newStock,
automatic status toggling between OUT_OF_STOCK and ACTIVE,
saves product and returns updated product.
Dashboard.jsx

Added product fetching via axios from ${VITE_BACKEND_URL}/products.
Added state items and useEffect to fetch on mount.
Replaced placeholder with a product grid rendering items (image, name, price, stock badge).
Minor layout adjustments for responsive grid.

SellerDashboard.jsx

Added axios-based inventory fetching from ${VITE_BACKEND_URL}/products/seller with Authorization header.
Introduced fetchInventory (useCallback) and inventory state.
Added handleUpdateStock prompt flow that calls PUT /products/:id/stock with newStock and refreshes inventory.
UI updates: inventory count, list of items with stock, Edit button to change stock.
Minor refactors: compact token check, dependency additions to hooks.

SignIn.jsx

Removed/commented-out role-based routing; now always navigate('/dashboard') after login.
Existing 403 -> /pending-verification redirect remains.
Suggested single-line commit message: