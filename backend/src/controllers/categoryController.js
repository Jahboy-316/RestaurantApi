const prisma = require("../config/db");

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Category name is required and must be a non-empty string"
      });
    }

    const trimmedName = name.trim();

    const existingCategory = await prisma.category.findUnique({
      where: { name: trimmedName }
    });

    if (existingCategory) {
      return res.status(409).json({
        status: "error",
        message: "A category with this name already exists"
      });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName
      }
    });

    return res.status(201).json({
      status: "success",
      data: category
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "A category with this name already exists"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to create category: " + error.message
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: "asc"
      },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    });

    return res.status(200).json({
      status: "success",
      count: categories.length,
      data: categories
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch categories: " + error.message
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID. Must be a positive integer"
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        menuItems: {
          orderBy: {
            id: "asc"
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found"
      });
    }

    return res.status(200).json({
      status: "success",
      data: category
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch category: " + error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const { name } = req.body;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID. Must be a positive integer"
      });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Category name is required and must be a non-empty string"
      });
    }

    const trimmedName = name.trim();

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found"
      });
    }

    const nameConflict = await prisma.category.findFirst({
      where: {
        name: trimmedName,
        id: { not: categoryId }
      }
    });

    if (nameConflict) {
      return res.status(409).json({
        status: "error",
        message: "A category with this name already exists"
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name: trimmedName }
    });

    return res.status(200).json({
      status: "success",
      data: updatedCategory
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "A category with this name already exists"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to update category: " + error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID. Must be a positive integer"
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found"
      });
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully"
    });
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(409).json({
        status: "error",
        message: "Cannot delete category because one or more of its menu items are referenced in existing orders"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to delete category: " + error.message
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
