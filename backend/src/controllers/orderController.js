const prisma = require("../config/db");

const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

const createOrder = async (req, res) => {
  try {
    const { customerId, items } = req.body;

    let parsedCustomerId;

    if (req.user.role === "CUSTOMER") {
      parsedCustomerId = req.user.id;
    } else {
      parsedCustomerId = Number(customerId);
      if (!customerId || !Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Valid positive integer customerId is required"
        });
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Order must contain a non-empty array of items"
      });
    }

    const itemMap = new Map();
    for (const item of items) {
      if (!item || typeof item !== "object") {
        return res.status(400).json({
          status: "error",
          message: "Each item in items must be a valid object"
        });
      }

      const menuItemId = Number(item.menuItemId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Each item must have a valid positive integer menuItemId"
        });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Each item must have a valid positive integer quantity"
        });
      }

      if (itemMap.has(menuItemId)) {
        itemMap.set(menuItemId, itemMap.get(menuItemId) + quantity);
      } else {
        itemMap.set(menuItemId, quantity);
      }
    }

    const aggregatedItems = Array.from(itemMap.entries()).map(([menuItemId, quantity]) => ({
      menuItemId,
      quantity
    }));

    const menuItemIds = aggregatedItems.map((item) => item.menuItemId);

    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.user.findUnique({
        where: { id: parsedCustomerId }
      });

      if (!customer) {
        const error = new Error("Customer with ID " + parsedCustomerId + " does not exist");
        error.statusCode = 404;
        throw error;
      }

      const menuItems = await tx.menuItem.findMany({
        where: { id: { in: menuItemIds } }
      });

      if (menuItems.length !== menuItemIds.length) {
        const foundIds = new Set(menuItems.map((item) => item.id));
        const missingIds = menuItemIds.filter((id) => !foundIds.has(id));
        const error = new Error("Menu items not found with IDs: " + missingIds.join(", "));
        error.statusCode = 404;
        throw error;
      }

      const unavailableItems = menuItems.filter((item) => !item.isAvailable);
      if (unavailableItems.length > 0) {
        const unavailableNames = unavailableItems.map((item) => item.name).join(", ");
        const error = new Error("The following menu items are currently unavailable: " + unavailableNames);
        error.statusCode = 400;
        throw error;
      }

      const menuItemLookup = new Map();
      menuItems.forEach((item) => {
        menuItemLookup.set(item.id, item);
      });

      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of aggregatedItems) {
        const menuItem = menuItemLookup.get(item.menuItemId);
        const itemPrice = Number(menuItem.price);
        const subtotal = itemPrice * item.quantity;
        totalAmount += subtotal;

        orderItemsData.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: itemPrice.toFixed(2)
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          customerId: parsedCustomerId,
          status: "PENDING",
          totalAmount: totalAmount.toFixed(2),
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          orderItems: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  categoryId: true
                }
              }
            }
          }
        }
      });

      return createdOrder;
    });

    return res.status(201).json({
      status: "success",
      data: order
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to create order: " + error.message
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, customerId } = req.query;
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

    if (customerId !== undefined && req.user.role !== "CUSTOMER") {
      const parsedCustId = Number(customerId);
      if (!Number.isInteger(parsedCustId) || parsedCustId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "customerId query parameter must be a positive integer"
        });
      }
      whereClause.customerId = parsedCustId;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                categoryId: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      status: "success",
      count: orders.length,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch orders: " + error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order ID. Must be a positive integer"
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                categoryId: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }

    if (req.user.role === "CUSTOMER" && order.customerId !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only view your own orders"
      });
    }

    return res.status(200).json({
      status: "success",
      data: order
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch order: " + error.message
    });
  }
};

const getOrdersByCustomer = async (req, res) => {
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
        message: "Access denied. You can only view your own orders"
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

    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                categoryId: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      status: "success",
      count: orders.length,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch customer orders: " + error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order ID. Must be a positive integer"
      });
    }

    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Order status is required and must be a string"
      });
    }

    const normalizedStatus = status.trim().toUpperCase();
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status. Allowed values: " + validStatuses.join(", ")
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }

    if (existingOrder.status === "CANCELLED") {
      return res.status(400).json({
        status: "error",
        message: "Cannot change status of an order that has already been CANCELLED"
      });
    }

    if (existingOrder.status === "COMPLETED" && normalizedStatus !== "COMPLETED") {
      return res.status(400).json({
        status: "error",
        message: "Cannot change status of an order that has already been COMPLETED"
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: normalizedStatus
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                categoryId: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      status: "success",
      data: updatedOrder
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update order status: " + error.message
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order ID. Must be a positive integer"
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }

    if (req.user.role === "CUSTOMER" && existingOrder.customerId !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only cancel your own orders"
      });
    }

    if (existingOrder.status === "CANCELLED") {
      return res.status(400).json({
        status: "error",
        message: "Order is already cancelled"
      });
    }

    if (existingOrder.status === "COMPLETED") {
      return res.status(400).json({
        status: "error",
        message: "Cannot cancel an order that has already been completed"
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED"
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                categoryId: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      status: "success",
      message: "Order cancelled successfully",
      data: updatedOrder
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to cancel order: " + error.message
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByCustomer,
  updateOrderStatus,
  cancelOrder
};
