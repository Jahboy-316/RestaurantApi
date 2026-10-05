const express = require("express");
const router = express.Router();

const {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  updateTableAvailability
} = require("../controllers/tableController");
const { authenticate, authorize } = require("../middleware/auth");

// Table listing is accessible to authenticated users for bookings; creation and modification require Staff/Admin
router.get("/", authenticate, getAllTables);
router.get("/:id", authenticate, getTableById);
router.post("/", authenticate, authorize("STAFF", "ADMIN"), createTable);
router.put("/:id", authenticate, authorize("STAFF", "ADMIN"), updateTable);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteTable);
router.patch("/:id/availability", authenticate, authorize("STAFF", "ADMIN"), updateTableAvailability);

module.exports = router;
