const express = require("express");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const tableRoutes = require("./routes/tableRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();

// Built-in middleware for parsing JSON bodies
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Restaurant Management API"
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is healthy and running"
  });
});

const cors = require("cors");

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "https://gourmethaven-restaurant-mox25zyxm-jahdev3.vercel.app,http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.includes(origin));
  }
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error: ", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error: " + err.message
  });
});

module.exports = app;
