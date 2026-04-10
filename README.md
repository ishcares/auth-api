# RESTful Auth API with JWT

A production-ready REST API featuring JWT authentication, refresh token rotation, role-based access control (RBAC), and MongoDB — fully containerized with Docker.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (Access + Refresh Tokens), bcrypt
- **DevOps:** Docker, Docker Compose

---

## Project Structure

```
auth-api/
├── controllers/
│   ├── auth.controller.js      # Register, Login, Refresh, Logout
│   ├── user.controller.js      # Get/Update profile
│   └── admin.controller.js     # Admin-only operations
├── middleware/
│   ├── auth.middleware.js      # protect() + authorize()
│   └── error.middleware.js     # Global error handler
├── models/
│   └── user.model.js           # User schema with roles
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── admin.routes.js
├── utils/
│   └── token.utils.js          # JWT generation helpers
├── server.js
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Getting Started

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd auth-api
cp .env.example .env   # fill in your secrets
```

### 2. Run with Docker (Recommended)

```bash
docker-compose up --build
```

### 3. Run Locally (without Docker)

```bash
npm install
npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES` | Access token expiry (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES` | Refresh token expiry (e.g. `7d`) |
| `NODE_ENV` | `development` or `production` |

---

## API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login & get tokens |
| POST | `/refresh` | Public | Get new access token via cookie |
| POST | `/logout` | Private | Logout & clear tokens |

### User Routes — `/api/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/profile` | Private | Get own profile |
| PUT | `/profile` | Private | Update name/password |

### Admin Routes — `/api/admin`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users` | Admin | Get all users |
| PUT | `/users/:id/role` | Admin | Update user role |
| DELETE | `/users/:id` | Admin | Delete a user |

---

## How Auth Works

```
1. Register/Login  →  Get accessToken (15min) + refreshToken cookie (7 days)
2. Use accessToken  →  Add to header: Authorization: Bearer <token>
3. Token expires?   →  POST /api/auth/refresh  →  Get new accessToken
4. Logout           →  Refresh token cleared from DB + cookie deleted
```

### Refresh Token Rotation
Every time `/refresh` is called, the old refresh token is invalidated and a new one is issued. If a stolen token is reused, the server detects it and rejects it.

---

## Example Requests (Postman / curl)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ishita","email":"ishita@example.com","password":"secret123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ishita@example.com","password":"secret123"}'
```

### Access Protected Route
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <your_access_token>"
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  --cookie "refreshToken=<your_refresh_token>"
```

---

## Roles

| Role | Permissions |
|------|-------------|
| `user` | Access own profile |
| `moderator` | Access own profile (extend as needed) |
| `admin` | Full access including all users & role management |

> Users cannot self-assign the `admin` role on registration.

---

## Security Features

- Passwords hashed with **bcrypt** (salt rounds: 12)
- Access tokens expire in **15 minutes**
- Refresh tokens stored in DB for **rotation & invalidation**
- Refresh token sent as **httpOnly cookie** (not accessible via JavaScript)
- **Reuse detection** — replayed refresh tokens are rejected
- Admin role cannot be self-assigned
