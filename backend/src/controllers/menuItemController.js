const prisma = require("../config/db");

const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, isAvailable, categoryId } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Menu item name is required and must be a non-empty string"
      });
    }

    if (
      price === undefined ||
      price === null ||
      typeof price === "boolean" ||
      (typeof price === "string" && price.trim() === "") ||
      isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Valid non-negative price is required"
      });
    }

    const parsedCategoryId = Number(categoryId);
    if (!categoryId || !Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Valid positive integer categoryId is required"
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: parsedCategoryId }
    });

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category with ID " + parsedCategoryId + " does not exist"
      });
    }

    let itemAvailability = true;
    if (isAvailable !== undefined) {
      if (typeof isAvailable === "string") {
        itemAvailability = isAvailable.toLowerCase() === "true";
      } else {
        itemAvailability = Boolean(isAvailable);
      }
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description && typeof description === "string" ? description.trim() : null,
        price: Number(price).toFixed(2),
        isAvailable: itemAvailability,
        categoryId: parsedCategoryId
      },
      include: {
        category: true
      }
    });

    return res.status(201).json({
      status: "success",
      data: menuItem
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create menu item: " + error.message
    });
  }
};

const getAllMenuItems = async (req, res) => {
  try {
    const { categoryId, isAvailable, search } = req.query;
    const whereClause = {};

    if (categoryId !== undefined) {
      const parsedCatId = Number(categoryId);
      if (!Number.isInteger(parsedCatId) || parsedCatId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "categoryId query parameter must be a positive integer"
        });
      }
      whereClause.categoryId = parsedCatId;
    }

    if (isAvailable !== undefined) {
      whereClause.isAvailable = isAvailable === "true";
    }

    if (search && typeof search === "string" && search.trim()) {
      whereClause.OR = [
        {
          name: {
            contains: search.trim(),
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: search.trim(),
            mode: "insensitive"
          }
        }
      ];
    }

    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      orderBy: {
        id: "asc"
      },
      include: {
        category: true
      }
    });

    return res.status(200).json({
      status: "success",
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch menu items: " + error.message
    });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid menu item ID. Must be a positive integer"
      });
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        category: true
      }
    });

    if (!menuItem) {
      return res.status(404).json({
        status: "error",
        message: "Menu item not found"
      });
    }

    return res.status(200).json({
      status: "success",
      data: menuItem
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch menu item: " + error.message
    });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid menu item ID. Must be a positive integer"
      });
    }

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return res.status(404).json({
        status: "error",
        message: "Menu item not found"
      });
    }

    const { name, description, price, isAvailable, categoryId } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          status: "error",
          message: "Name must be a non-empty string"
        });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description && typeof description === "string" ? description.trim() : null;
    }

    if (price !== undefined) {
      if (
        price === null ||
        typeof price === "boolean" ||
        (typeof price === "string" && price.trim() === "") ||
        isNaN(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          status: "error",
          message: "Price must be a valid non-negative number"
        });
      }
      updateData.price = Number(price).toFixed(2);
    }

    if (isAvailable !== undefined) {
      if (typeof isAvailable === "string") {
        updateData.isAvailable = isAvailable.toLowerCase() === "true";
      } else {
        updateData.isAvailable = Boolean(isAvailable);
      }
    }

    if (categoryId !== undefined) {
      const parsedCatId = Number(categoryId);
      if (!Number.isInteger(parsedCatId) || parsedCatId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "categoryId must be a valid positive integer"
        });
      }

      const categoryExists = await prisma.category.findUnique({
        where: { id: parsedCatId }
      });

      if (!categoryExists) {
        return res.status(404).json({
          status: "error",
          message: "Category with ID " + parsedCatId + " does not exist"
        });
      }

      updateData.categoryId = parsedCatId;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "At least one valid field (name, description, price, isAvailable, categoryId) must be provided to update"
      });
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        category: true
      }
    });

    return res.status(200).json({
      status: "success",
      data: updatedItem
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update menu item: " + error.message
    });
  }
};

const updateMenuItemAvailability = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid menu item ID. Must be a positive integer"
      });
    }

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return res.status(404).json({
        status: "error",
        message: "Menu item not found"
      });
    }

    const { isAvailable } = req.body;
    let newAvailability;

    if (isAvailable !== undefined) {
      if (typeof isAvailable === "string") {
        newAvailability = isAvailable.toLowerCase() === "true";
      } else {
        newAvailability = Boolean(isAvailable);
      }
    } else {
      newAvailability = !existingItem.isAvailable;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        isAvailable: newAvailability
      },
      include: {
        category: true
      }
    });

    return res.status(200).json({
      status: "success",
      data: updatedItem
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update availability: " + error.message
    });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid menu item ID. Must be a positive integer"
      });
    }

    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return res.status(404).json({
        status: "error",
        message: "Menu item not found"
      });
    }

    await prisma.menuItem.delete({
      where: { id: itemId }
    });

    return res.status(200).json({
      status: "success",
      message: "Menu item deleted successfully"
    });
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(409).json({
        status: "error",
        message: "Cannot delete this menu item because it is referenced in past orders. You can set its availability to false instead."
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to delete menu item: " + error.message
    });
  }
};

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  updateMenuItemAvailability,
  deleteMenuItem
};
