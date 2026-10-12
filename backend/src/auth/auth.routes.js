const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const Session = require("../models/Session");
const env = require("../config/env");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." }
});

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "strict",
  path: "/"
};

function setSessionCookie(res, token, expiresAt) {
  res.cookie(env.cookieName, token, {
    ...cookieOptions,
    expires: expiresAt
  });
}

function clearSessionCookie(res) {
  res.clearCookie(env.cookieName, cookieOptions);
}

function validEmail(email) {
  return typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validUsername(username) {
  return typeof username === "string" &&
    username.length >= 3 &&
    username.length <= 30 &&
    /^[a-zA-Z0-9_.-]+$/.test(username);
}

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    const errors = {};
    if (!validEmail(email)) errors.email = "Enter a valid email address.";
    if (!validUsername(username)) errors.username = "Use 3–30 letters, numbers, dots, underscores or hyphens.";
    if (password.length < 10 || password.length > 128) {
      errors.password = "Password must be between 10 and 128 characters.";
    }
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Please correct the highlighted fields.", errors });
    }

    const existing = await User.findOne({
      $or: [{ email }, { username }]
    }).select("_id email username").lean();

    if (existing) {
      const duplicateErrors = {};
      if (existing.email === email) duplicateErrors.email = "An account with this email may already exist.";
      if (existing.username === username) duplicateErrors.username = "This username may already be taken.";
      return res.status(409).json({
        message: "An account with those details already exists.",
        errors: duplicateErrors
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, username, passwordHash });

    res.status(201).json({
      message: "Account created successfully. You can now sign in.",
      user: { id: user._id, email: user.email, username: user.username }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with those details already exists." });
    }
    next(error);
  }
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!validEmail(email) || !password || password.length > 128) {
      return res.status(400).json({ message: "Enter a valid email and password." });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    const passwordMatches = user
      ? await user.verifyPassword(password)
      : await bcrypt.compare(password, "$2a$12$C6UzMDM.H6dfI/f/IKcEe.1OpQ2qJ5sFJ3W5KXr5o6w6Xj1v6j8sK");

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const jti = crypto.randomUUID();
    const decodedExpiry = env.jwtExpiresIn.endsWith("h")
      ? Number(env.jwtExpiresIn.slice(0, -1)) * 60 * 60 * 1000
      : env.jwtExpiresIn.endsWith("m")
        ? Number(env.jwtExpiresIn.slice(0, -1)) * 60 * 1000
        : 2 * 60 * 60 * 1000;

    const expiresAt = new Date(Date.now() + decodedExpiry);

    await Session.create({ userId: user._id, jti, expiresAt });

    const token = jwt.sign(
      { sub: user._id.toString(), jti },
      env.jwtSecret,
      {
        algorithm: "HS256",
        expiresIn: env.jwtExpiresIn,
        issuer: "gatehouse",
        audience: "gatehouse-web"
      }
    );

    setSessionCookie(res, token, expiresAt);

    res.json({
      message: "Signed in successfully.",
      user: { id: user._id, email: user.email, username: user.username }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ user: req.user });
});

router.post("/logout", authenticate, async (req, res, next) => {
  try {
    await Session.updateOne(
      { _id: req.sessionId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );

    clearSessionCookie(res);
    res.set("Cache-Control", "no-store");
    res.json({ message: "Signed out successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;