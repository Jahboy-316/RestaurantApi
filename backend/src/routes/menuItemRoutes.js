const express = require("express");
const router = express.Router();

const {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  updateMenuItemAvailability,
  deleteMenuItem
} = require("../controllers/menuItemController");
const { authenticate, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getAllMenuItems);
router.get("/:id", getMenuItemById);

// Staff/Admin routes
router.post("/", authenticate, authorize("STAFF", "ADMIN"), createMenuItem);
router.put("/:id", authenticate, authorize("STAFF", "ADMIN"), updateMenuItem);
router.patch("/:id/availability", authenticate, authorize("STAFF", "ADMIN"), updateMenuItemAvailability);
router.patch("/:id/status", authenticate, authorize("STAFF", "ADMIN"), updateMenuItemAvailability);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteMenuItem);

module.exports = router;
