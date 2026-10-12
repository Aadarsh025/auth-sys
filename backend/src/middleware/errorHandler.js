function notFound(req, res) {
  res.status(404).json({ message: "Resource not found." });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err && err.code === 11000) {
    return res.status(409).json({ message: "An account with those details already exists." });
  }

  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON request body." });
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(500).json({ message: "Something went wrong. Please try again." });
}

module.exports = { notFound, errorHandler };