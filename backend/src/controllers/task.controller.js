const prisma = require("../config/db");

/**
 * @desc   Create a new task
 * @route  POST /api/v1/tasks
 * @access Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "PENDING",
        priority: priority || 1,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get all tasks (Admin: all, User: own)
 * @route  GET /api/v1/tasks
 * @access Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where = {};
    if (req.user.role !== "ADMIN") {
      where.userId = req.user.id; // Users only see their own tasks
    }
    if (status) where.status = status;
    if (priority) where.priority = parseInt(priority);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get a single task by ID
 * @route  GET /api/v1/tasks/:id
 * @access Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    // Users can only view their own tasks
    if (req.user.role !== "ADMIN" && task.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This task belongs to another user.",
      });
    }

    res.status(200).json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Update a task
 * @route  PUT /api/v1/tasks/:id
 * @access Private
 */
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    if (req.user.role !== "ADMIN" && existing.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own tasks.",
      });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Delete a task
 * @route  DELETE /api/v1/tasks/:id
 * @access Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    if (req.user.role !== "ADMIN" && existing.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own tasks.",
      });
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
