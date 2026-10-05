const express = require("express");
const router = express.Router();

const {
  createReservation,
  getAllReservations,
  getReservationById,
  getReservationsByCustomer,
  updateReservationStatus,
  cancelReservation
} = require("../controllers/reservationController");
const { authenticate, authorize } = require("../middleware/auth");

// All reservation routes require authentication
router.post("/", authenticate, createReservation);
router.get("/", authenticate, getAllReservations);
router.get("/customer/:customerId", authenticate, getReservationsByCustomer);
router.get("/:id", authenticate, getReservationById);
router.patch("/:id/status", authenticate, authorize("STAFF", "ADMIN"), updateReservationStatus);
router.patch("/:id/cancel", authenticate, cancelReservation);

module.exports = router;
