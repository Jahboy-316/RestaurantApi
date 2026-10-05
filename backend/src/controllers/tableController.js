const prisma = require("../config/db");

const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    const parsedTableNumber = Number(tableNumber);
    const parsedCapacity = Number(capacity);

    if (!Number.isInteger(parsedTableNumber) || parsedTableNumber <= 0) {
      return res.status(400).json({
        status: "error",
        message: "tableNumber is required and must be a positive integer"
      });
    }

    if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({
        status: "error",
        message: "capacity is required and must be a positive integer"
      });
    }

    const existingTable = await prisma.restaurantTable.findUnique({
      where: { tableNumber: parsedTableNumber }
    });

    if (existingTable) {
      return res.status(409).json({
        status: "error",
        message: "A table with this number already exists"
      });
    }

    const table = await prisma.restaurantTable.create({
      data: {
        tableNumber: parsedTableNumber,
        capacity: parsedCapacity
      }
    });

    return res.status(201).json({
      status: "success",
      data: table
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "A table with this number already exists"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to create table: " + error.message
    });
  }
};

const getAllTables = async (req, res) => {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: { tableNumber: "asc" },
      include: {
        _count: {
          select: { reservations: true }
        }
      }
    });

    return res.status(200).json({
      status: "success",
      count: tables.length,
      data: tables
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch tables: " + error.message
    });
  }
};

const getTableById = async (req, res) => {
  try {
    const tableId = Number(req.params.id);

    if (!Number.isInteger(tableId) || tableId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid table ID. Must be a positive integer"
      });
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId },
      include: {
        reservations: {
          orderBy: { reservationDate: "asc" },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!table) {
      return res.status(404).json({
        status: "error",
        message: "Table not found"
      });
    }

    return res.status(200).json({
      status: "success",
      data: table
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch table: " + error.message
    });
  }
};

const updateTable = async (req, res) => {
  try {
    const tableId = Number(req.params.id);
    const { tableNumber, capacity } = req.body;

    if (!Number.isInteger(tableId) || tableId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid table ID. Must be a positive integer"
      });
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      return res.status(404).json({
        status: "error",
        message: "Table not found"
      });
    }

    const updateData = {};

    if (tableNumber !== undefined) {
      const parsedTableNumber = Number(tableNumber);
      if (!Number.isInteger(parsedTableNumber) || parsedTableNumber <= 0) {
        return res.status(400).json({
          status: "error",
          message: "tableNumber must be a positive integer"
        });
      }

      const conflict = await prisma.restaurantTable.findFirst({
        where: {
          tableNumber: parsedTableNumber,
          id: { not: tableId }
        }
      });

      if (conflict) {
        return res.status(409).json({
          status: "error",
          message: "A table with this number already exists"
        });
      }

      updateData.tableNumber = parsedTableNumber;
    }

    if (capacity !== undefined) {
      const parsedCapacity = Number(capacity);
      if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
        return res.status(400).json({
          status: "error",
          message: "capacity must be a positive integer"
        });
      }
      updateData.capacity = parsedCapacity;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "At least one field (tableNumber, capacity) is required to update"
      });
    }

    const updatedTable = await prisma.restaurantTable.update({
      where: { id: tableId },
      data: updateData
    });

    return res.status(200).json({
      status: "success",
      data: updatedTable
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "A table with this number already exists"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to update table: " + error.message
    });
  }
};

const deleteTable = async (req, res) => {
  try {
    const tableId = Number(req.params.id);

    if (!Number.isInteger(tableId) || tableId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid table ID. Must be a positive integer"
      });
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      return res.status(404).json({
        status: "error",
        message: "Table not found"
      });
    }

    await prisma.restaurantTable.delete({
      where: { id: tableId }
    });

    return res.status(200).json({
      status: "success",
      message: "Table deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete table: " + error.message
    });
  }
};

const updateTableAvailability = async (req, res) => {
  try {
    const tableId = Number(req.params.id);
    const { isAvailable } = req.body;

    if (!Number.isInteger(tableId) || tableId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid table ID. Must be a positive integer"
      });
    }

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "isAvailable is required and must be a boolean (true or false)"
      });
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      return res.status(404).json({
        status: "error",
        message: "Table not found"
      });
    }

    const updatedTable = await prisma.restaurantTable.update({
      where: { id: tableId },
      data: { isAvailable }
    });

    return res.status(200).json({
      status: "success",
      data: updatedTable
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update table availability: " + error.message
    });
  }
};

module.exports = {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  updateTableAvailability
};
