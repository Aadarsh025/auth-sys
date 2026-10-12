# Gatehouse 🔐

**Secure Authentication Made Simple.**

Gatehouse is a secure, lightweight authentication application built with vanilla JavaScript, Node.js, Express, and MongoDB. It provides user registration, login, protected routes, and session management using JWT-based authentication stored in HttpOnly cookies.

The project focuses on security, simplicity, and a clean user experience while keeping the frontend and backend integrated into a single application.

## ✨ Features

- **User Registration** — Create an account with a username, email address, and password.
- **Secure Password Storage** — Hash passwords using bcrypt before storing them in MongoDB.
- **User Authentication** — Authenticate users using JSON Web Tokens (JWT).
- **HttpOnly Cookie Authentication** — Store authentication tokens in cookies inaccessible to client-side JavaScript.
- **Session Management** — Maintain server-side sessions and support session revocation during logout.
- **Protected Routes** — Restrict access to authenticated resources.
- **Input Validation** — Validate usernames, email addresses, and passwords on both the frontend and backend.
- **Rate Limiting** — Limit authentication attempts to help imitigate brute-force attacks.
- **Security Headers** — Use Helmet to configure HTTP security headers and Content Security Policy.
- **MongoDB Integration** — Persist user accounts and session information using MongoDB and Mongoose.
- **Responsive UI** — Provide dedicated registration and login interfaces.
- **API Error Handling** — Return structured JSON responses for validation failures and authentication errors.
- **Logout Support** — Revoke the active server-side session and clear the authentication cookie.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcryptjs |
| Session Management | MongoDB-backed server-side sessions |
| Security | Helmet, express-rate-limit, cookie-parser, express-mongo-sanitize |
| Development | Nodemon, npm |

## 📁 Project Structure

```text
auth-sys/
├── backend/
│   └── src/
│       ├── auth/
│       │   └── auth.routes.js
│       ├── config/
│       │   ├── db.js
│       │   └── env.js
│       ├── middleware/
│       │   ├── authenticate.js
│       │   └── errorHandler.js
│       ├── models/
│       │   ├── User.js
│       │   └── Session.js
│       ├── seeders/
│       │   └── seedDemoUser.js
│       ├── app.js
│       └── server.js
│   
├── frontend/
│   ├── css/
│   │   ├── styles.css
│   │   └── landing.css
│   ├── js/
│   │   ├── api.js
│   │   ├── dashboard.js
│   │   ├── index.js
│   │   ├── landing.js
│   │   ├── login.js
│   │   ├── ui.js
│   │   └── register.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── dashboard.html
├── .gitignore
├── .env
├── node_modules
├── package.json
├── package-lock.json
└── README.md
```


## 🚀 Getting Started

Follow these steps to run Gatehouse locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) — preferably a current LTS version.
- npm — included with Node.js.
- [MongoDB](https://www.mongodb.com/) — a local instance or MongoDB Atlas account.
- Git — for cloning and version control.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/gatehouse.git
cd gatehouse
```

Replace `YOUR_USERNAME` with your GitHub username and `gatehouse` with your repository name if different.

### 2. Install dependencies

If the root `package.json` manages the backend scripts and dependencies:

```bash
npm install
```

If your backend has a separate `package.json`, install its dependencies from the backend directory instead:

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the directory expected by your backend configuration. Use `.env` as a template.

Example configuration:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/gatehouse

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=2h

COOKIE_NAME=gatehouse_session
```

**Important:** These variable names are examples. Match them to the names read by your actual `backend/src/config/env.js`. For example, your database setting may be named `MONGO_URI` rather than `MONGODB_URI`.

Generate a strong JWT secret instead of using the example value. Never commit your real `.env` file or production credentials to GitHub.

### 4. Start MongoDB

For a local MongoDB installation, ensure the MongoDB service is running.

Alternatively, configure your environment variables to use your MongoDB Atlas connection string.

### 5. Start the application

From the directory containing the backend's `package.json`, run:

```bash
npm run dev
```

This starts the Express development server using Nodemon, assuming the script is configured in your `package.json`.

### 6. Open Gatehouse

Navigate to:

**http://localhost:5000/**

Useful routes:

| Page | URL |
|---|---|
| Home | `http://localhost:5000/` |
| Login | `http://localhost:5000/login.html` |
| Registration | `http://localhost:5000/register.html` |
| Dashboard API | `http://localhost:5000/api/dashboard` |
| Health Check | `http://localhost:5000/api/health` |

The dashboard API requires authentication. Visiting it without a valid session should return an unauthorized response.

**Tip:** Prefer opening the application through Express rather than VS Code Live Server. Serving the frontend and API from the same origin simplifies cookie handling and avoids unnecessary CORS configuration.

## 🔌 API Documentation

Base URL:

```text
http://localhost:5000/api
```

### Authentication endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `GET` | `/health` | Check server health | No |
| `POST` | `/auth/register` | Register a new account | No |
| `POST` | `/auth/login` | Authenticate a user | No |
| `GET` | `/auth/me` | Retrieve the current user | Yes |
| `POST` | `/auth/logout` | Revoke the current session | Yes |
| `GET` | `/dashboard` | Access protected dashboard data | Yes |

### Register a user

**Request**

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "developer01",
  "email": "developer@example.com",
  "password": "YourStrongPassword123"
}
```

A successful registration returns HTTP `201 Created`.

Example response:

```json
{
  "message": "Account created successfully. You can now sign in.",
  "user": {
    "id": "USER_ID",
    "email": "developer@example.com",
    "username": "developer01"
  }
}
```

### Login

**Request**

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "developer@example.com",
  "password": "YourStrongPassword123"
}
```

On successful authentication, the server creates a session, issues a JWT, and sets it in an HttpOnly cookie.

### Get the current user

```http
GET /api/auth/me
```

Requires a valid authentication cookie.

### Logout

```http
POST /api/auth/logout
```

Requires an authenticated session. The server revokes the session and clears the authentication cookie.

## 🔒 Security Architecture

Gatehouse uses multiple security measures to protect user accounts and authenticated sessions.

### Password hashing

Passwords are hashed using bcryptjs before being saved to the database. Plain-text passwords should never be stored.

### JWT authentication

After successful login, the backend signs a JWT containing the user's identifier and a unique session identifier. The token is configured with an issuer, audience, expiration, and signing algorithm.

### HttpOnly cookies

The JWT is stored in an HttpOnly cookie, preventing JavaScript from directly reading the token.

Cookie configuration includes:

- `HttpOnly` to prevent direct JavaScript access.
- `SameSite=Strict` to restrict cross-site cookie sending.
- `Secure` in production to require HTTPS.
- A root path so the cookie is available to application routes.

### Revocable sessions

The application stores sessions in MongoDB. Logout revokes the active session, allowing the authentication middleware to reject revoked sessions even if the associated JWT has not expired.

### Rate limiting

Authentication endpoints use rate limiting to restrict repeated login and registration attempts.

### Security headers and validation

Helmet configures security headers and Content Security Policy. Server-side validation and MongoDB input sanitization provide additional protection.

> Security note: These measures are part of a layered security design, not a guarantee against every attack. Production deployment should also include HTTPS, secure secret management, appropriate logging, dependency updates, and thorough authentication testing.

## 🧪 Testing Checklist

Use this checklist when testing a new installation:

- [ ] Register a new account.
- [ ] Verify that passwords are stored as hashes.
- [ ] Reject invalid email addresses and usernames.
- [ ] Reject passwords shorter than 10 characters.
- [ ] Handle duplicate email addresses and usernames.
- [ ] Log in with valid credentials.
- [ ] Reject incorrect credentials.
- [ ] Verify that the authentication cookie is HttpOnly.
- [ ] Access the protected dashboard after login.
- [ ] Reject protected requests without a valid session.
- [ ] Log out and verify that the session is revoked.
- [ ] Verify that the revoked session cannot be reused.
- [ ] Confirm that the health endpoint responds successfully.

## 🗺️ Future Improvements

Potential extensions for Gatehouse include:

- Email verification during account registration.
- Two-factor authentication (2FA).
- Password reset and recovery.
- Session and device management.
- Login activity history and security alerts.
- Automated security and integration tests.
- Deployment with HTTPS and production environment configuration.

These are possible future enhancements, not claims that the features are already implemented.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Commit your changes:

   ```bash
   git commit -m "feat: describe your change"
   ```

4. Push your branch:

   ```bash
   git push origin feature/your-feature
   ```

5. Open a pull request describing your changes.


## 👨‍💻 Author

**Aadarsh Tripathi**

- Project: [Gatehouse](https://github.com/YOUR_USERNAME/gatehouse)


---

<p align="center">
  Built with ❤️ using Node.js, Express, MongoDB, and JavaScript.
</p>