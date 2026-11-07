export default function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV === "production" && (err.status || 500) >= 500) {
    console.error(err.message);
  } else {
    console.error(err);
  }
  if (err.code === 11000) return res.status(409).json({ message: "That email is already registered." });
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid resource ID." });
  const status = err.status || 500;
  const message = status >= 500 && process.env.NODE_ENV === "production"
    ? "Internal server error."
    : err.message || "Server error";
  res.status(status).json({ message });
}