const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/v1/auth.routes");
const taskRoutes = require("./routes/v1/task.routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./config/logger");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// ─── Security Middleware ──────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Stricter for auth endpoints
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
});

app.use("/api/", limiter);
app.use("/api/v1/auth/", authLimiter);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(compression());

// ─── Logging ─────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ─── API Documentation ───────────────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "TaskFlow API Docs",
  })
);

// ─── Health Check ────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes (Versioned) ──────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
