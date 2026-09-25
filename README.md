# Restaurant Management Frontend

This document describes the current frontend requirements and the behavior implemented in this repository. It is based on the routes, components, API clients, hooks, and utilities present in the source. It is intended as a product and developer guide; it does not claim that backend behavior has been independently verified.

## 1. Product overview

The application is a browser-based restaurant operations interface built with React, TypeScript, and Vite. It provides a public-facing landing/menu area and an operations area for restaurant staff. The operations area integrates with a REST API for dashboard data, categories, menu items, orders, tables, customers, and users.

### Main user capabilities

- Browse the public landing, menu, about, and contact pages.
- Sign in and use password recovery/reset screens.
- Review dashboard metrics, sales/order visualizations, popular items, and recent orders.
- Create, view, edit, filter, sort, and remove categories, menu items, orders, customers, users, and tables where the corresponding screen exposes those actions.
- Create dine-in, takeaway, and delivery orders; assign tables to dine-in orders; update order status and record payment completion.
- Upload category and menu-item images.
- Export selected operational lists to CSV; orders and customers also expose PDF export.
- Change the color theme and interface language.
- See network/service status and receive toast, loading, and error feedback.

## 2. Technology and commands

| Area | Current implementation |
| --- | --- |
| UI | React 19, TypeScript 6 |
| Build/development | Vite 8 |
| Routing | React Router 7, browser history routes |
| UI library | Bootstrap 5 and React Bootstrap, plus repository CSS |
| API | Browser `fetch` through typed API modules |
| Offline/PWA | Service worker, web manifest, network status UI, partial offline queue scaffolding |

```bash
npm install
npm run dev       # local Vite development server
npm run build     # TypeScript project build and Vite production build
npm run preview   # serve the built app locally
npm run lint      # ESLint
```

The API base URL is configured with `VITE_API_BASE_URL`. If it is absent, the client falls back to the Azure API URL defined in `src/api/client.ts`. `.env.example` shows the variable name and current example value. Do not put private credentials in a Vite environment variable: `VITE_*` values are bundled into browser code.

## 3. Routes and screens

Routes are declared in `src/routes/AppRoutes.tsx`. Most route components are loaded lazily and display a full-screen loading spinner while loading. The main operational routes render inside `MainLayout`, which supplies the header, sidebar, skip link, and page outlet.

| Route | Screen | Current behavior / status |
| --- | --- | --- |
| `/` | Landing | Public landing page; includes sign-in entry behavior. |
| `/public-menu` | Public menu | Public menu presentation. |
| `/about` | About | Public informational page. |
| `/contact` | Contact | Public contact page. |
| `/login` | Login | Validates credentials and calls the authentication API. |
| `/forgot-password` | Forgot password | Starts the OTP recovery flow. |
| `/reset-password` | Reset password | Verifies the reset flow and submits a new password. |
| `/signup` | User form | User creation form. |
| `/dashboard` | Dashboard | Loads metrics and charts from the dashboard endpoint; has refresh and sample-data action. |
| `/categories` | Category list | API-backed list, search/filter/sort, CSV export, individual and bulk deletion. |
| `/categories/new` | Create category | Category form, including image upload. |
| `/categories/:id` | Category view | Displays a category. |
| `/categories/:id/edit` | Edit category | Loads and updates a category. |
| `/categories/gallery` | Category gallery | Gallery view. |
| `/menu` | Menu item list | API-backed list and summary, filter/sort, individual and bulk deletion. |
| `/menu/add` | Add menu item | Create menu item, choose category, configure options, and upload image. |
| `/menu/:id/edit` | Edit menu item | Loads and updates a menu item. |
| `/orders` | Orders | API-backed list, status operations, payment completion, sorting/filtering, delete, CSV and PDF exports; includes order-entry interactions. |
| `/orders/new` | Create order | Select active menu items, order type, customer, optional dine-in table, quantities, and instructions. |
| `/orders/:id` | Order details | View order and update status. |
| `/orders/:id/edit` | Edit order | Update order contents and applicable dine-in table. |
| `/tables` | Tables | List/create/edit/delete tables and export CSV. |
| `/reservations` | Tables screen | Currently points to the same table screen; a separate reservation workflow is not implemented. |
| `/customers` | Customers | Search/filter/sort, view, create/edit/delete, bulk delete, CSV and PDF export. |
| `/customers/new` | Create customer | Validated customer form. |
| `/customers/:id` | Customer details | Customer detail view, including order-history UI where available. |
| `/customers/:id/edit` | Edit customer | Loads and updates a customer. |
| `/users` | Users | List, search/sort, create/edit/delete, CSV export. |
| `/users/new` | Create user | Validated user form. |
| `/users/:id/edit` | Edit user | Loads and updates a user. |
| `/ingredients` | Ingredients | Placeholder screen marked under development. |
| `/reports` | Reports | Placeholder screen marked under development. |
| `/settings` | Settings | Placeholder screen marked under development. |

There is no explicit catch-all/not-found route in the route configuration. The route tree also does not declare a dedicated authentication/role guard; API authorization and handling are performed by the API client and individual screens.

## 4. Functional requirements and implementation

### Authentication and account recovery

- Login submits email/password to `POST /api/Auth/login` and stores the returned token and basic user display data in browser storage.
- Forgot password supports email or SMS OTP request, OTP verification, then password reset using the username/identifier held for the flow.
- Logout clears locally stored credentials/user data. The current client does not call a backend logout endpoint.
- The shared API client adds a Bearer token when present, checks token expiration before requests, and clears credentials and redirects to `/login` on expiration or HTTP 401.
- The user create/edit screen validates required names, email, optional phone, and a minimum eight-character password for creation.

### Dashboard

- Reads a dashboard summary from `GET /api/dashboard` and presents totals, daily values, charts, popular items, status counts, and recent order data according to the returned payload.
- Provides manual/automatic refresh behavior through `useAutoRefresh`.
- Exposes `POST /api/dashboard/seed-sample-data` from the dashboard UI. This is an API-backed sample-data action, not production data generation logic in the browser.
- Dashboard code contains WebSocket connection/event integration. Availability depends on the backend WebSocket endpoint and event protocol; see Real-time and offline behavior below.

### Categories and menu

- Categories support API-backed list, detail, create, update, delete, and image upload. The list includes search/filter/sort, CSV export, and multi-select deletion.
- Menu items include code/name, category, description, price, preparation time, calories/ingredients, status, dietary type, image, tags, and option groups/options with price adjustments.
- Menu list retrieves both categories and menu summary, and supports search, category/status filters, sorting, and individual/bulk deletion.
- Menu create/edit loads categories and, for edit, the existing item before submitting its upsert payload.
- Uploads use multipart `FormData` against the upload endpoints and require a successful response containing `data.imageUrl`.

### Orders and tables

- Orders have a customer name, type (`DineIn`, `Takeaway`, `Delivery`), lifecycle status (`Pending`, `Preparing`, `Ready`, `Completed`, `Cancelled`), optional table, instructions, line items, subtotal, tax, and total.
- The order list loads orders, provides status/search/filter/sort and deletion controls, can mark payment complete, and supports CSV/PDF download.
- Create/edit order screens load tables and active menu items. Dine-in orders require a table; at least one item is required before submit.
- Order details can change status. Order history is available as a common modal component.
- Tables have a table number, seat capacity, area, and status (`Available`, `Occupied`, `Reserved`). The table screen provides create/edit/delete and CSV export.
- The `reservations` URL currently reuses table management and should not be treated as a reservation-booking feature.

### Customers and users

- Customers include full name, phone, optional email, status, tier, optional gender/address/date of birth/notes, order totals, and last-order timestamp.
- Customer list supports search, status/tier filters, sorting, CSV/PDF export, and bulk deletion. Create/edit uses shared validation for name, phone, and optional email.
- Users include name, email, optional phone, active state, and timestamps. User list supports search, sorting, CSV export, and deletion; forms handle create and update.

### Shared interface behavior

- Theme context supports light/dark mode and persists the selection in local storage.
- Language context supports English, Hindi, Spanish, French, and German selection and persists the selected language. Translation strings live in `src/i18n/translations.ts`; coverage depends on the keys used by each screen.
- Toast provider supplies success/error/warning/info notifications. Common UI includes loading spinners, error alerts, error boundary, delete confirmations, pagination, breadcrumbs, date picker, offline indicator, and service status gate.
- Styles include responsive, dark-mode, and accessibility styles. The main layout includes a skip link; a separate app-root skip-link integration is commented out.
- CSV and print-based PDF helpers live under `src/utils`. The PDF helper generates printable content; it is not a server-side PDF/report engine.

## 5. API contract used by the frontend

The typed clients in `src/api` call these routes (all paths are appended to `VITE_API_BASE_URL`):

| Resource | Frontend calls |
| --- | --- |
| Authentication | `POST /api/Auth/login`, `/api/Auth/forgot-password`, `/api/Auth/verify-otp`, `/api/Auth/reset-password` |
| Categories | `GET/POST /api/Category`; `GET/PUT/DELETE /api/Category/:id` |
| Menu items | `GET/POST /api/menu-items`; `GET/PUT/DELETE /api/menu-items/:id`; `GET /api/menu-items/summary` |
| Uploads | `POST /api/uploads/menu-items`, `POST /api/uploads/categories` (multipart field `file`) |
| Orders | `GET/POST /api/orders`; `GET/PUT/DELETE /api/orders/:id`; `PATCH /api/orders/:id/status`; `POST /api/orders/:id/payment` |
| Tables | `GET/POST /api/tables`; `PUT/DELETE /api/tables/:id` |
| Customers | `GET/POST /api/customers`; `GET/PUT/DELETE /api/customers/:id`; list accepts `search`, `status`, `tier` query parameters |
| Users | `GET/POST /api/Users`; `GET/PUT/DELETE /api/Users/:id` |
| Dashboard | `GET /api/dashboard`; `POST /api/dashboard/seed-sample-data` |

The shared client accepts either a direct JSON payload or an envelope shaped like `{ success, message, data, errorCode? }`. It retries network errors and HTTP 408/429/500/502/503/504 up to three times with delay, handles 401 by redirecting to login, and emits a `service-unavailable` browser event for network/server failures. `cachedApi` supports local cache for GET requests, but most resource functions currently call `api` directly; do not assume all list calls use that cache.

## 6. Real-time, security, and offline behavior

- `src/utils/websocket.ts` implements a browser WebSocket singleton targeting `/ws`, token authentication message, order/dashboard subscriptions, ping, reconnection, and event handlers. Table subscription methods explicitly report that backend support is not implemented. The dashboard’s visible real-time behavior requires a compatible server implementation.
- The WebSocket service is scaffolding/integration code; its existence does not prove the backend is emitting the declared events. Check backend deployment/protocol before relying on live updates.
- `public/sw.js` caches an app shell/static assets and uses network-first behavior for same-origin API/navigation requests with cached fallback. It includes a background sync placeholder for orders, but `syncOrders()` has no IndexedDB replay implementation.
- `useOfflineQueue` registers the worker, listens for online/offline state, tells the worker to process a queue when online, and can count records in an IndexedDB store named `RestaurantOfflineDB/requestQueue`. The service worker does not currently add failed mutations to that store or replay them. Therefore offline mutation queuing is not a complete/verified feature.
- Security utilities include token storage, request security headers/CSRF helpers, CSP violation handling in production, input/URL helper functions, and a client-side rate limiter. Client-side controls do not replace backend authorization, CSRF validation, or rate limiting.
- The upload module reads the token directly from local storage and sends it as Bearer authorization. Review token-storage strategy and API/CORS/CSP configuration before deployment.

## 7. Repository map

```text
src/
  api/          Typed HTTP clients and endpoint models
  components/   Feature screens (auth, dashboard, categories, menu, orders,
                tables, customers, users, landing, shared UI)
  contexts/     Theme and language state
  hooks/        Refresh, offline queue, unsaved-change and table-sort behavior
  i18n/         Translation dictionaries and language types
  layouts/      Shared operations layout
  routes/       Lazy-loaded route definitions
  styles/       Accessibility, responsive, and dark-mode styles
  types/        Shared domain types
  utils/        API support, validation, security, export, formatting,
                caching, sorting, errors, image/date/currency helpers
public/         App icons, manifest, service worker, static fallback page
```

Feature-local `data/` files under Dashboard, Categories, Customers, and MenuItems contain sample/static presentation data. A screen should be considered live API-backed only where its current component calls the API client; the presence of a sample-data module alone does not make it a backend-connected feature.

## 8. Current limitations and follow-up requirements

These items are identified from the frontend source and should be addressed or confirmed before treating the product as complete:

1. Implement the Ingredients, Reports, and Settings screens; they currently show an under-development placeholder.
2. Build a distinct reservation workflow if reservations are a product requirement; `/reservations` currently renders the tables screen.
3. Add explicit not-found routing and define access control/role rules for operational routes.
4. Complete and verify offline mutation persistence and replay, including conflict handling and user-visible queue state; current service-worker sync method is a stub.
5. Confirm backend WebSocket authentication, event names/payloads, table subscription support, reconnection behavior, and authorization.
6. Ensure backend enforces validation, authentication, authorization, rate limits, CSRF protections where applicable, and audit logging. Frontend checks are user experience controls, not security boundaries.
7. Add/maintain automated coverage for routing, validation, CRUD flows, auth expiry, failed requests, uploads, exports, accessibility, and offline behavior. No test script or test suite is currently defined in `package.json`.
8. Confirm service-worker caching policy for authenticated API responses and deploy path behavior. The worker currently caches successful same-origin API responses and uses root-relative asset paths.
9. Confirm whether PDF export should remain browser print output or become a formatted/downloadable PDF feature.
10. Ensure translation coverage is complete across public and operational screens.

Backend enhancement ideas and API-side requirements are documented separately in [BACKEND_SPECS.md](./BACKEND_SPECS.md). That document is a proposal/specification, not evidence that the listed backend capabilities are already implemented.

## 9. Definition of “implemented” in this guide

“Implemented” means the frontend contains a screen, utility, interaction, or API call for the capability. API-backed actions still require a running compatible backend, and behavior can vary with backend data and permissions. Placeholder screens, comments, mock/sample data, and unfinished worker/WebSocket methods are explicitly identified so they are not confused with complete end-to-end features.
