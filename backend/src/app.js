const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const env = require("./config/env");
const authRoutes = require("./auth/auth.routes");
const authenticate = require("./middleware/authenticate");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const frontendDir = path.resolve(__dirname, "../../frontend");

// Allow only your local development frontend origins.
const allowedOrigins = new Set([
  "http://127.0.0.1:5500",
  "http://localhost:5500",
]);

// CORS must run before Helmet and the API routes.
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
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
        "http://localhost:5000",
        "http://127.0.0.1:5000",
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

app.use(express.static(frontendDir, {
  index: "index.html",
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store");
    }
  },
}));

app.use(notFound);
app.use(errorHandler);

module.exports = app;