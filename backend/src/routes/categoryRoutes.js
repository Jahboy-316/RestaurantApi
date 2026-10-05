const express = require("express");
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Staff/Admin routes
router.post("/", authenticate, authorize("STAFF", "ADMIN"), createCategory);
router.put("/:id", authenticate, authorize("STAFF", "ADMIN"), updateCategory);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCategory);

module.exports = router;
