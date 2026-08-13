# Order Management System (OMS)

A full-stack MERN application where registered users can manage their own orders — create, view, update, and delete — with JWT-based authentication and ownership-enforced security.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), Redux Toolkit, React Router v7, Axios, CSS Modules |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcrypt.js |
| File Upload | Multer + Cloudinary |
| Validation | Joi |

---

## Features

- **Signup / Login** — JWT authentication, passwords hashed with bcrypt, auto-login after signup
- **Protected Routes** — frontend PrivateRoute + backend auth middleware
- **Order CRUD** — create, view, update, and delete orders
- **Ownership Security** — users can only access their own orders (enforced server-side)
- **Status Progression** — orders follow a strict flow: `Pending → Shipped → Delivered / Cancelled`
- **Image Upload** — product images uploaded to Cloudinary via Multer
- **Pagination** — 5 orders per page with prev/next controls
- **Status Filter** — filter orders by Pending, Shipped, Delivered, or Cancelled
- **401 Auto-logout** — expired tokens automatically log the user out
- **Confirmation Modal** — custom in-UI delete confirmation (no browser alerts)
- **404 Page** — catch-all route for unknown URLs

---

## Project Structure

```
mernstack/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handlers
│   ├── middlewares/     # auth, admin, upload, validation, error
│   ├── models/          # User and Order Mongoose schemas
│   ├── routes/          # Express routers
│   ├── services/        # Business logic
│   ├── uploads/         # Local upload fallback
│   ├── .env.example     # Environment variable template
│   └── server.js        # Entry point
└── frontend/
    └── src/
        ├── api/         # Axios instance with interceptors
        ├── components/  # Navbar, OrderCard, PrivateRoute, ConfirmModal
        ├── pages/       # Login, Signup, OrderList, OrderForm, NotFound
        └── redux/       # store, authSlice, orderSlice
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file (use `.env.example` as reference):

```env
DB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/oms
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:

```bash
node server.js
```

Server runs on `http://localhost:4000`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/orders` | Private | Get logged-in user's orders |
| POST | `/api/orders` | Private | Create new order |
| GET | `/api/orders/:id` | Private | Get single order (owner only) |
| PUT | `/api/orders/:id` | Private | Update order (owner only) |
| DELETE | `/api/orders/:id` | Private | Delete order (owner only) |
| GET | `/api/admin/orders` | Admin | Get all users' orders |

**Private** = requires `Authorization: Bearer <token>` header.

---

## Environment Variables

All secrets are managed through `.env` files. Never commit `.env` to Git.

| Variable | Description |
|---|---|
| `DB_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
