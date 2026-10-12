const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const env = require("./config/env");
const connectDB = require("./config/db");
const authRoutes = require("./auth/auth.routes");
const authenticate = require("./middleware/authenticate");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const frontendDir = path.resolve(__dirname, "../../frontend");

// Required on Vercel (behind a proxy) so req.protocol and secure cookies work
app.set("trust proxy", 1);

// Extra allowed origins besides the app's own origin:
// - CLIENT_URL env var (optional, comma-separated, no trailing slash)
// - local dev: Live Server origins
const extraOrigins = new Set([
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean),
  ...(env.isProd ? [] : ["http://127.0.0.1:5500", "http://localhost:5500"]),
]);

// CORS must run before Helmet and the API routes.
// Same-origin requests (frontend and API on one Vercel domain) are allowed automatically.
app.use(cors((req, callback) => {
  const origin = req.get("origin");
  const sameOrigin = Boolean(origin) && origin === `${req.protocol}://${req.get("host")}`;
  const allowed = !origin || sameOrigin || extraOrigins.has(origin);

  callback(allowed ? null : new Error("Origin not allowed by CORS"), {
    origin: allowed,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  });
}));

app.disable("x-powered-by");

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        ...(env.isProd ? [] : ["http://localhost:5000", "http://127.0.0.1:5000"]),
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: env.isProd ? [] : null,
    },
  },
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());

// Connect to MongoDB (cached) before any API route runs.
// Needed on Vercel because server.js never runs there.
app.use("/api", async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.get("/api/dashboard", authenticate, (req, res) => {
  res.json({
    message: `Welcome back, ${req.user.username}.`,
    user: req.user,
  });
});

// Serve the frontend from Express only when running locally.
// On Vercel, the root vercel.json serves the frontend/ folder as static files.
if (!process.env.VERCEL) {
  app.use(express.static(frontendDir, {
    index: "index.html",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-store");
      }
    },
  }));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;