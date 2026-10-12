const jwt = require("jsonwebtoken");
const env = require("../config/env");
const Session = require("../models/Session");
const User = require("../models/User");

async function authenticate(req, res, next) {
  try {
    const token = req.cookies[env.cookieName];
    if (!token) {
      return res.status(401).json({ message: "Please sign in to continue." });
    }

    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "gatehouse",
      audience: "gatehouse-web"
    });

    if (!payload.sub || !payload.jti) {
      return res.status(401).json({ message: "Invalid session. Please sign in again." });
    }

    const session = await Session.findOne({
      jti: payload.jti,
      userId: payload.sub,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    }).lean();

    if (!session) {
      return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }

    const user = await User.findById(payload.sub).select("_id email username").lean();
    if (!user) {
      return res.status(401).json({ message: "Please sign in to continue." });
    }

    req.user = user;
    req.sessionId = session._id;
    req.sessionJti = payload.jti;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your session is invalid or expired. Please sign in again." });
    }
    next(error);
  }
}

module.exports = authenticate;