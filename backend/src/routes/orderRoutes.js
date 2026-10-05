const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByCustomer,
  updateOrderStatus,
  cancelOrder
} = require("../controllers/orderController");
const { authenticate, authorize } = require("../middleware/auth");

// All order routes require authentication
router.post("/", authenticate, createOrder);
router.get("/", authenticate, getAllOrders);
router.get("/customer/:customerId", authenticate, getOrdersByCustomer);
router.get("/:id", authenticate, getOrderById);
router.patch("/:id/status", authenticate, authorize("STAFF", "ADMIN"), updateOrderStatus);
router.patch("/:id/cancel", authenticate, cancelOrder);

module.exports = router;
