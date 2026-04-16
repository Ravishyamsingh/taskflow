const { body, query, param } = require("express-validator");

const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3–100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description must not exceed 500 characters"),

  body("status")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"]).withMessage("Invalid status value"),

  body("priority")
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage("Priority must be 1 (Low), 2 (Medium), or 3 (High)"),
];

const updateTaskValidator = [
  param("id").isUUID().withMessage("Invalid task ID format"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3–100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description must not exceed 500 characters"),

  body("status")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"]).withMessage("Invalid status value"),

  body("priority")
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage("Priority must be 1, 2, or 3"),
];

const listTasksValidator = [
  query("status")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"]).withMessage("Invalid status filter"),

  query("priority")
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage("Priority must be 1, 2, or 3"),

  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1–100"),
];

module.exports = { createTaskValidator, updateTaskValidator, listTasksValidator };
