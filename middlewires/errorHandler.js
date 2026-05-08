/**
 * Centralized Express error handler.
 * Must be registered LAST with app.use(errorHandler).
 */
export const errorHandler = (err, req, res, next) => {
  // CORS error
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ success: false, msg: err.message });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ success: false, msg: "Validation failed", errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ success: false, msg: `${field} already exists` });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, msg: "Invalid ID format" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, msg: "Invalid or expired token" });
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, msg: "File too large" });
  }

  // Default 500
  console.error("Unhandled error:", err);
  return res.status(err.status || 500).json({
    success: false,
    msg: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};
