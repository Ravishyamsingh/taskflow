const logger = require("../config/logger");

const SENSITIVE_KEYS = [
  "password",
  "newPassword",
  "currentPassword",
  "token",
  "authorization",
  "secret",
];

const redactSensitive = (value) => {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, val]) => {
      const isSensitive = SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()));
      acc[key] = isSensitive ? "[REDACTED]" : redactSensitive(val);
      return acc;
    }, {});
  }

  return value;
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log the error
  logger.error(`${req.method} ${req.path} - ${statusCode}: ${message}`, {
    stack: err.stack,
    body: redactSensitive(req.body),
  });

  // CORS policy violation
  if (err.message && err.message.startsWith("Not allowed by CORS")) {
    statusCode = 403;
    message = "CORS policy does not allow this origin.";
  }

  // Prisma unique constraint error
  if (err.code === "P2002") {
    statusCode = 409;
    const field = err.meta?.target?.[0] || "field";
    message = `A record with this ${field} already exists.`;
  }

  // Prisma record not found
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found.";
  }

  // Prisma foreign key constraint
  if (err.code === "P2003") {
    statusCode = 400;
    message = "Invalid reference: related record does not exist.";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired.";
  }

  // Don't leak stack traces in production
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
