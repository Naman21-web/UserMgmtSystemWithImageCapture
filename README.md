# UserVault — User Management System with Image Capturing

A full-stack web application built with **Angular 17** (frontend) and **Node.js / Express** (backend), featuring user authentication, role-based access control, and an in-browser camera image capturing system.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Reference](#api-reference)
- [Role Permissions](#role-permissions)
- [Environment Variables](#environment-variables)
- [Security Measures](#security-measures)
- [Challenges & Decisions](#challenges--decisions)

---

## Features

### Milestone 1 — Authentication & User Management
- JWT-based login with username or email
- Default admin account auto-created on first startup
- Admin can create, update, deactivate, and delete user accounts
- Admin can assign roles: `supervisor` or `worker`
- Admin can reset any user's password

### Milestone 2 — Role-Based Access Control (RBAC)
- Three roles: **Admin**, **Supervisor**, **Worker**
- Route guards in Angular protect pages by role
- Backend middleware enforces authorization on every protected endpoint
- Workers see only their own images; Supervisors and Admins see all

### Milestone 3 — Image Capturing App
- Accesses the device's inbuilt camera via `getUserMedia` API
- Camera selector if multiple cameras available
- Real-time viewfinder with capture button
- Preview captured image before saving
- Images stored securely on the server with UUID-based filenames
- MongoDB stores image metadata (uploader, timestamp, size, description)

### Milestone 4 — Documentation & Deployment
- This README with full setup instructions
- `.env`-based configuration for all secrets
- Git-friendly `.gitignore` included

---

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | Angular 17 (Standalone Components, Signals)   |
| Backend   | Node.js + Express.js                          |
| Database  | MongoDB + Mongoose ODM                        |
| Auth      | JWT (jsonwebtoken) + bcryptjs                 |
| File Upload | Multer (disk storage)                       |
| Styling   | Custom CSS (design system with CSS variables) |

---

## Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Login, profile, change password
│   │   ├── userController.js   # CRUD for users (admin only)
│   │   └── imageController.js  # Upload, list, serve, delete images
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + role authorize
│   │   ├── upload.js           # Multer config (10MB, images only)
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt hooks
│   │   └── Image.js            # Image metadata schema
│   ├── routes/
│   │   ├── auth.js             # /api/auth/*
│   │   ├── users.js            # /api/users/* (admin)
│   │   └── images.js           # /api/images/*
│   ├── uploads/                # Stored image files (git-ignored)
│   ├── .env                    # Environment variables
│   ├── server.js               # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── login/          # Login page
    │   │   │   ├── layout/         # Sidebar + toast container
    │   │   │   ├── dashboard/      # Home with stats & quick actions
    │   │   │   ├── capture/        # Camera capture page
    │   │   │   ├── gallery/        # Image gallery with lightbox
    │   │   │   ├── admin/          # User management (admin only)
    │   │   │   └── profile/        # Profile & change password
    │   │   ├── guards/
    │   │   │   ├── auth.guard.ts   # Redirect unauthenticated users
    │   │   │   └── role.guard.ts   # Restrict by role
    │   │   ├── services/
    │   │   │   ├── auth.service.ts      # Login, logout, JWT storage
    │   │   │   ├── auth.interceptor.ts  # Auto-attach Bearer token
    │   │   │   ├── user.service.ts      # User CRUD API calls
    │   │   │   ├── image.service.ts     # Image upload/fetch/delete
    │   │   │   └── toast.service.ts     # Toast notification system
    │   │   ├── app.component.ts
    │   │   ├── app.config.ts       # Angular providers
    │   │   └── app.routes.ts       # Lazy-loaded routes
    │   ├── styles.css              # Global design system CSS
    │   └── index.html
    ├── angular.json
    ├── tsconfig.json
    └── package.json
```

---

## Prerequisites

Make sure you have the following installed:

| Tool        | Version     | Download                         |
|-------------|-------------|----------------------------------|
| Node.js     | >= 18.x     | https://nodejs.org               |
| npm         | >= 9.x      | Included with Node               |
| MongoDB     | >= 6.x      | https://www.mongodb.com/try/download/community |
| Angular CLI | >= 17.x     | `npm install -g @angular/cli`    |

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd project
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Edit the `.env` file to configure your environment:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/user_management_db
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@123
NODE_ENV=development
```

> ⚠️ **Important**: Change `JWT_SECRET` and `ADMIN_PASSWORD` before deploying to production.

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
```

---

## Running the Application

### Start MongoDB

```bash
# macOS / Linux
mongod --dbpath /data/db

# Windows
mongod

# Or using MongoDB as a service (if installed as service)
brew services start mongodb-community   # macOS with Homebrew
sudo systemctl start mongod             # Linux
```

### Start the Backend (Terminal 1)

```bash
cd backend
npm start
# or for auto-reload during development:
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected: localhost
✅ Default admin user created:
   Username: admin
   Password: Admin@123
📡 API available at http://localhost:5000/api
```

### Start the Frontend (Terminal 2)

```bash
cd frontend
ng serve
# or:
npm start
```

Open your browser at: **http://localhost:4200**

---

## Default Credentials

| Role       | Username | Password   |
|------------|----------|------------|
| Admin      | admin    | Admin@123  |

The admin can then create Supervisor and Worker accounts from the **User Management** page.

---

## API Reference

### Authentication

| Method | Endpoint                    | Auth     | Description              |
|--------|-----------------------------|----------|--------------------------|
| POST   | `/api/auth/login`           | Public   | Login, returns JWT       |
| GET    | `/api/auth/me`              | Any role | Get current user profile |
| PUT    | `/api/auth/change-password` | Any role | Change own password      |

### User Management (Admin Only)

| Method | Endpoint                      | Description                   |
|--------|-------------------------------|-------------------------------|
| GET    | `/api/users`                  | List all users (filterable)   |
| POST   | `/api/users`                  | Create a new user             |
| GET    | `/api/users/:id`              | Get single user               |
| PUT    | `/api/users/:id/role`         | Change user role              |
| PUT    | `/api/users/:id/status`       | Toggle active/inactive        |
| PUT    | `/api/users/:id/password`     | Reset user password           |
| DELETE | `/api/users/:id`              | Delete user account           |

### Images

| Method | Endpoint                        | Auth              | Description             |
|--------|---------------------------------|-------------------|-------------------------|
| POST   | `/api/images/upload`            | Any role          | Upload captured image   |
| GET    | `/api/images`                   | Any role          | List images (role-filtered) |
| GET    | `/api/images/file/:filename`    | Any role          | Serve image file        |
| DELETE | `/api/images/:id`               | Owner or Admin    | Delete image            |

---

## Role Permissions

| Permission                  | Admin | Supervisor | Worker |
|-----------------------------|:-----:|:----------:|:------:|
| Login                       | ✅    | ✅          | ✅     |
| Capture images              | ✅    | ✅          | ✅     |
| View own images             | ✅    | ✅          | ✅     |
| View ALL images             | ✅    | ✅          | ❌     |
| Delete own images           | ✅    | ✅          | ✅     |
| Delete any image            | ✅    | ❌          | ❌     |
| Create user accounts        | ✅    | ❌          | ❌     |
| Assign roles                | ✅    | ❌          | ❌     |
| Deactivate accounts         | ✅    | ❌          | ❌     |
| Reset user passwords        | ✅    | ❌          | ❌     |
| Delete user accounts        | ✅    | ❌          | ❌     |

---

## Environment Variables

| Variable         | Default                                | Description                      |
|------------------|----------------------------------------|----------------------------------|
| `PORT`           | `5000`                                 | Backend server port              |
| `MONGODB_URI`    | `mongodb://localhost:27017/user_mgmt`  | MongoDB connection string        |
| `JWT_SECRET`     | *(required)*                           | Secret for signing JWT tokens    |
| `JWT_EXPIRES_IN` | `24h`                                  | Token expiry duration            |
| `ADMIN_USERNAME` | `admin`                                | Default admin username           |
| `ADMIN_PASSWORD` | `Admin@123`                            | Default admin password           |
| `NODE_ENV`       | `development`                          | Environment mode                 |

---

## Security Measures

1. **Password Hashing** — All passwords are hashed with `bcryptjs` (salt rounds: 12) before storage. Plain-text passwords are never stored.

2. **JWT Authentication** — Stateless authentication using signed JSON Web Tokens. Tokens expire after 24 hours.

3. **Role-Based Middleware** — Every protected backend route checks both authentication (`protect`) and authorization (`authorize(...roles)`).

4. **Input Validation** — Mongoose schema-level validation for all fields. Express validates request bodies before processing.

5. **File Security** — Uploaded images are:
   - Stored with UUID-based filenames (not original names)
   - Validated by MIME type and extension (images only)
   - Limited to 10MB per file
   - Access-controlled: workers can only fetch their own images

6. **CORS** — Backend only accepts requests from known frontend origins.

7. **Error Handling** — A global error handler prevents stack traces from leaking to clients in production.

8. **Mongoose Sanitization** — Duplicate key errors and cast errors are caught and returned as user-friendly messages.

---

## Challenges & Decisions

### 1. Camera Access via Browser API
The `getUserMedia` API requires HTTPS in production. During local development, `localhost` is treated as a secure context, so it works without SSL. For deployment, a reverse proxy (like Nginx) with SSL is required.

### 2. Image Storage Strategy
Images are stored on the filesystem (inside `backend/uploads/`) with UUID filenames, and metadata is saved in MongoDB. This approach is simple and effective for local/single-server setups. For production scale, an object storage service (AWS S3, Cloudflare R2) would be preferable.

### 3. Angular Standalone Components
Angular 17's standalone component API was used throughout — no `NgModule` files required. This results in cleaner code, better tree-shaking, and lazy loading of every route.

### 4. Token Storage
JWT tokens are stored in `localStorage` for simplicity. In high-security contexts, `HttpOnly` cookies would be more secure (preventing XSS access), but require additional CSRF protection setup.

### 5. Admin Protection
Admin accounts cannot be deleted, deactivated, or role-changed through the UI or API. This prevents accidental lockout.

---

## Optional Cloud Deployment

### Backend (Render / Railway)
1. Push code to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set environment variables in the dashboard
4. Use MongoDB Atlas as the cloud database

### Frontend (Vercel / Netlify)
1. Build: `ng build --configuration production`
2. Deploy the `dist/user-management-frontend/browser/` folder
3. Update `apiUrl` in Angular services to point to your deployed backend

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Whitelist your server IP
3. Copy the connection string into `MONGODB_URI`

---

## Git Setup

```bash
git init
git add .
git commit -m "feat: initial implementation of UserVault"
git remote add origin <your-repo-url>
git push -u origin main
```

A `.gitignore` is included that excludes `node_modules/`, `uploads/`, `.env`, and `dist/`.
