# TaskFlow — Personal Task Management Application

A full-stack personal task management application built using the **MERN** stack (MongoDB, Express, React, Node.js).

---

## 📌 Phase 5: Final Quality, Security, and Reliability Audit

Phase 5 finalizes TaskFlow with an audit and verification across security, data integrity, error handling, date boundary conditions, and user isolation:
- **Centralized Error Handling**: Express error-handling middleware reliably translates Mongoose `CastError`, `ValidationError`, MongoDB duplicate key (`11000`), and JSON parsing syntax errors into appropriate, client-safe HTTP statuses (`400`, `409`) without exposing stack traces, credentials, or internal database metadata.
- **Credential Protection**: Passwords are encrypted with 10-round bcrypt salts and excluded from database query projections (`select: false`), registration outputs, login outputs, and profile responses.
- **Account Enumeration Defense**: Login endpoint provides identical, generic `401 Unauthorized` responses (`"Invalid email or password"`) for non-existent emails and incorrect passwords.
- **Strict User Isolation**: Every task endpoint scopes operations to `{ _id: taskId, user: req.user._id }`. Request body/query injection attempts (e.g. attempting to override `user` ownership or spoof IDs) are discarded.
- **Unified 404 Discretion**: Nonexistent tasks and tasks belonging to other users return identical `404 Not Found` responses to prevent ID probing or resource enumeration.
- **Date Edge Case Precision**: Overdue status is derived strictly against local calendar dates (`today.setHours(0, 0, 0, 0)`). Tasks due today and completed tasks are never flagged as overdue.
- **Automated Regression Suite**: 103 automated assertions across Phase 2 (Authentication), Phase 3 (Task CRUD), Phase 4 (End-to-End Workflows & Dynamic Statistics), and Phase 5 (Security, Injection, and Audit).

---

## 📂 Project Structure

```text
taskmanager/
├── client/                               # Frontend React application (Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardStats.jsx        # Real-time Total, Pending, Completed, and Overdue cards
│   │   │   ├── DeleteConfirmModal.jsx    # Accessible deletion confirmation dialog
│   │   │   ├── LoginForm.jsx             # Login card with validation & demo credentials
│   │   │   ├── RegisterForm.jsx          # Register card with password confirmation check
│   │   │   ├── ProtectedDashboard.jsx    # Main TaskFlow dashboard & task orchestration
│   │   │   ├── TaskCard.jsx              # Individual task card with status toggle & actions
│   │   │   ├── TaskFilters.jsx           # Search bar, status chips, priority chips, & reset
│   │   │   └── TaskModal.jsx             # Create & Edit task dialog with live validation
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Global authentication state & lifecycle
│   │   ├── services/
│   │   │   └── api.js                    # Centralized API fetcher & sessionStorage manager
│   │   ├── utils/
│   │   │   └── date.js                   # Local calendar date formatting & overdue calculation
│   │   ├── App.jsx                       # Routing between Auth portal and Protected Dashboard
│   │   ├── index.css                     # Tailwind CSS directives & global styling
│   │   └── main.jsx                      # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                    # Vite config with Tailwind & /api proxy
│
├── server/                               # Backend API (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # Mongoose connection & error diagnostics
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        # Register, Login, GetMe, and Logout controllers
│   │   │   └── task.controller.js        # Secure Task CRUD controllers (user-scoped)
│   │   ├── middleware/
│   │   │   ├── auth.js                   # Reusable JWT verification middleware (protect)
│   │   │   └── errorHandler.js           # Centralized 404 & error-handling middleware
│   │   ├── models/
│   │   │   ├── task.model.js             # Mongoose Task model with enums & compound indexes
│   │   │   └── user.model.js             # Mongoose User model with bcrypt & validation
│   │   ├── routes/
│   │   │   ├── auth.routes.js            # Auth routes (/register, /login, /me, /logout)
│   │   │   ├── health.routes.js          # Health check endpoint
│   │   │   ├── task.routes.js            # Task CRUD routes (all JWT protected)
│   │   │   └── index.js                  # Centralized route aggregator
│   │   ├── utils/
│   │   │   └── token.js                  # JWT signing and verification helpers
│   │   ├── app.js                        # Express app, CORS, and JSON parser configuration
│   │   └── server.js                     # Server bootstrap & graceful shutdown listeners
│   ├── .env                              # Local environment variables (gitignored)
│   ├── .env.example                      # Environment template
│   ├── package.json
│   ├── test-auth.js                      # Phase 2 authentication test suite
│   ├── test-tasks.js                     # Phase 3 Task CRUD test suite
│   ├── test-phase4.js                    # Phase 4 End-to-End integration test suite
│   └── test-audit.js                     # Phase 5 Security and Reliability Audit test suite
│
├── .gitignore                            # Root gitignore (node_modules, .env, dist, etc.)
├── package.json                          # Root convenience runner scripts
└── README.md                             # Documentation
```

---

## ⚙️ Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on `v23.9.0`)
- **npm**: `v9.0.0` or higher (tested on `11.2.0`)
- **MongoDB**: A running local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

---

## 🚀 Quick Start

### 1. Install Dependencies

Install dependencies for both client and server from the root directory:

```bash
npm run install:all
```

---

### 2. Configure Environment Variables

The server requires environment variables defined in `server/.env`. A template is provided in `server/.env.example`:

```bash
# Copy template to .env
cp server/.env.example server/.env
```

Variables in `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=your_secure_random_jwt_secret_key_here
JWT_EXPIRES_IN=1h
```

---

### 3. Run Development Servers

Run the frontend and backend in separate terminal windows:

#### Terminal 1 — Backend (Port 5000)
```bash
npm run dev:server
```

#### Terminal 2 — Frontend (Port 5173)
```bash
npm run dev:client
```

Open your browser at **http://localhost:5173** to view and interact with TaskFlow.

---

## 📚 API Reference

All protected endpoints require the `Authorization` header containing a valid JWT:
```text
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No | `201`, `400`, `409`, `500` |
| `POST` | `/api/auth/login` | Authenticate user credentials & issue JWT | No | `200`, `400`, `401`, `500` |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | **Yes** | `200`, `401`, `500` |
| `POST` | `/api/auth/logout` | Stateless logout acknowledgment | No | `200` |
| `GET` | `/api/health` | Service and MongoDB connectivity health check | No | `200` |

### Task Endpoints

| Method | Endpoint | Description | Auth Required | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks` | Create a task for authenticated user | **Yes** | `201`, `400`, `401`, `500` |
| `GET` | `/api/tasks` | Get all tasks for authenticated user | **Yes** | `200`, `401`, `500` |
| `GET` | `/api/tasks/:id` | Get single task by ID (user-scoped) | **Yes** | `200`, `400`, `401`, `404`, `500` |
| `PUT` | `/api/tasks/:id` | Update allowed task fields (`title`, `description`, `category`, `priority`, `dueDate`, `status`) | **Yes** | `200`, `400`, `401`, `404`, `500` |
| `PATCH` | `/api/tasks/:id/status` | Update task status (`Pending` / `Completed`) | **Yes** | `200`, `400`, `401`, `404`, `500` |
| `DELETE` | `/api/tasks/:id` | Delete task (user-scoped) | **Yes** | `200`, `400`, `401`, `404`, `500` |

---

## 🧪 Automated Testing

Execute the comprehensive automated test suites from the root directory:

```bash
# Run ALL verification suites (103 automated assertions):
npm test

# Run Phase 5 Security and Audit suite:
npm run test:audit

# Run Phase 4 E2E test suite:
npm run test:phase4

# Run Phase 3 Task CRUD suite:
npm run test:tasks

# Run Phase 2 Auth suite:
npm run test:auth

# Run Frontend Linter:
npm run lint:client

# Run Frontend Production Build:
npm run build:client
```

### Verified Test Matrix (103 Tests Total):
- **Phase 2 Auth Suite (15 tests)**: Registration, validation, duplicate email defense (409), bcrypt hash verification in MongoDB, login, generic error messaging, JWT signing, `protect` middleware, expired token rejection, logout.
- **Phase 3 Task CRUD Suite (34 tests)**: Task model constraints, title/category blank defense, priority and status enum validation, due date validation, user isolation, 404 unified responses, field whitelisting, malformed ObjectId guards.
- **Phase 4 E2E Suite (24 tests)**: Total, Pending, Completed, and Overdue statistics calculation; overdue exclusion of completed tasks and tasks due today; dynamic recalculation on status toggle; dynamic recalculation on deletion; multi-user data isolation; case-insensitive search and combined priority/status filtering.
- **Phase 5 Audit Suite (30 tests)**: Plain-text leak defense, credential probing defense (identical 401s), missing/empty/malformed/untrusted/expired JWT rejection, body user ID injection defense, cross-user read/update/status/delete isolation, query parameter spoofing rejection, malformed JSON body handling, and date boundary edge cases.

---

## 🔒 Security Architecture Summary

- **Authentication**: Stateless JSON Web Tokens (1-hour expiration) signed via `process.env.JWT_SECRET`.
- **Password Security**: 10-round bcrypt hash applied prior to saving; passwords are never returned in queries or responses (`select: false`, `.toSafeObject()`).
- **Data Scoping**: Every task operation is double-scoped to `{ _id: taskId, user: req.user._id }`.
- **Token Storage**: Stored in `sessionStorage` for local assessment. Note: in production environments, HttpOnly, SameSite=Strict cookies or in-memory tokens paired with refresh tokens provide heightened XSS protection.
- **Unified Errors**: Non-existent tasks and foreign tasks return identical `404 Not Found` responses to prevent resource enumeration.
