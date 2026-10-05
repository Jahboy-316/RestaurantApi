const prisma = require("../config/db");

const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

const RESERVATION_DURATION_HOURS = 2;

const createReservation = async (req, res) => {
  try {
    const { customerId, tableId, reservationDate } = req.body;

    let parsedCustomerId;

    if (req.user.role === "CUSTOMER") {
      parsedCustomerId = req.user.id;
    } else {
      parsedCustomerId = Number(customerId);
      if (!Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Valid positive integer customerId is required"
        });
      }
    }

    const parsedTableId = Number(tableId);
    if (!Number.isInteger(parsedTableId) || parsedTableId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Valid positive integer tableId is required"
      });
    }

    if (!reservationDate) {
      return res.status(400).json({
        status: "error",
        message: "reservationDate is required"
      });
    }

    const parsedDate = new Date(reservationDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        status: "error",
        message: "reservationDate must be a valid date/time (e.g. 2026-12-25T19:00:00Z)"
      });
    }

    if (parsedDate <= new Date()) {
      return res.status(400).json({
        status: "error",
        message: "reservationDate must be in the future"
      });
    }

    const customer = await prisma.user.findUnique({
      where: { id: parsedCustomerId }
    });

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer with ID " + parsedCustomerId + " does not exist"
      });
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id: parsedTableId }
    });

    if (!table) {
      return res.status(404).json({
        status: "error",
        message: "Table with ID " + parsedTableId + " does not exist"
      });
    }

    if (!table.isAvailable) {
      return res.status(400).json({
        status: "error",
        message: "Table " + table.tableNumber + " is currently marked as unavailable"
      });
    }

    const windowStart = new Date(parsedDate.getTime() - RESERVATION_DURATION_HOURS * 60 * 60 * 1000);
    const windowEnd = new Date(parsedDate.getTime() + RESERVATION_DURATION_HOURS * 60 * 60 * 1000);

    const conflictingReservation = await prisma.reservation.findFirst({
      where: {
        tableId: parsedTableId,
        status: { in: ["PENDING", "CONFIRMED"] },
        reservationDate: {
          gte: windowStart,
          lt: windowEnd
        }
      }
    });

    if (conflictingReservation) {
      return res.status(409).json({
        status: "error",
        message: "Table " + table.tableNumber + " is already reserved around that time. Each reservation blocks a " + RESERVATION_DURATION_HOURS + "-hour window."
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerId: parsedCustomerId,
        tableId: parsedTableId,
        reservationDate: parsedDate,
        status: "PENDING"
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: true
      }
    });

    return res.status(201).json({
      status: "success",
      data: reservation
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create reservation: " + error.message
    });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = {};

    if (req.user.role === "CUSTOMER") {
      whereClause.customerId = req.user.id;
    }

    if (status !== undefined) {
      const normalizedStatus = status.trim().toUpperCase();
      if (!validStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid status query. Allowed values: " + validStatuses.join(", ")
        });
      }
      whereClause.status = normalizedStatus;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      orderBy: { reservationDate: "asc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: true
      }
    });

    return res.status(200).json({
      status: "success",
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch reservations: " + error.message
    });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid reservation ID. Must be a positive integer"
      });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: true
      }
    });

    if (!reservation) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found"
      });
    }

    if (req.user.role === "CUSTOMER" && reservation.customerId !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only view your own reservations"
      });
    }

    return res.status(200).json({
      status: "success",
      data: reservation
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch reservation: " + error.message
    });
  }
};

const getReservationsByCustomer = async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid customer ID. Must be a positive integer"
      });
    }

    if (req.user.role === "CUSTOMER" && customerId !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only view your own reservations"
      });
    }

    const customer = await prisma.user.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer with ID " + customerId + " not found"
      });
    }

    const reservations = await prisma.reservation.findMany({
      where: { customerId },
      orderBy: { reservationDate: "asc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: true
      }
    });

    return res.status(200).json({
      status: "success",
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch customer reservations: " + error.message
    });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid reservation ID. Must be a positive integer"
      });
    }

    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Reservation status is required and must be a string"
      });
    }

    const normalizedStatus = status.trim().toUpperCase();
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status. Allowed values: " + validStatuses.join(", ")
      });
    }

    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!existingReservation) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found"
      });
    }

    if (existingReservation.status === "CANCELLED") {
      return res.status(400).json({
        status: "error",
        message: "Cannot change status of a reservation that has been CANCELLED"
      });
    }

    if (existingReservation.status === "COMPLETED" && normalizedStatus !== "COMPLETED") {
      return res.status(400).json({
        status: "error",
        message: "Cannot change status of a reservation that has been COMPLETED"
      });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: normalizedStatus },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: true
      }
    });

    return res.status(200).json({
      status: "success",
      data: updatedReservation
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update reservation status: " + error.message
    });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid reservation ID. Must be a positive integer"
      });
    }

    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!existingReservation) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found"
      });
    }

    if (req.user.role === "CUSTOMER" && existingReservation.customerId !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only cancel your own reservations"
      });
    }

    if (existingReservation.status === "CANCELLED") {
      return res.status(400).json({
        status: "error",
        message: "Reservation is already cancelled"
      });
    }

    if (existingReservation.status === "COMPLETED") {
      return res.status(400).json({
        status: "error",
        message: "Cannot cancel a reservation that has already been completed"
      });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: true
      }
    });

    return res.status(200).json({
      status: "success",
      message: "Reservation cancelled successfully",
      data: updatedReservation
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to cancel reservation: " + error.message
    });
  }
};

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  getReservationsByCustomer,
  updateReservationStatus,
  cancelReservation
};
