import Task from "../models/Task.js";

const editableFields = ["title", "description", "category", "priority", "status", "dueDate"];
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export async function getTasks(req, res, next) {
  try {
    const { status, priority, search, sort = "dueDate" } = req.query;
    const filter = { userId: req.userId };
    if (status !== undefined) {
      if (typeof status !== "string" || !["All", "Pending", "In Progress", "Completed"].includes(status)) {
        return res.status(400).json({ message: "Choose a valid task status filter." });
      }
      if (status !== "All") filter.status = status;
    }
    if (priority !== undefined) {
      if (typeof priority !== "string" || !["All", "Low", "Medium", "High"].includes(priority)) {
        return res.status(400).json({ message: "Choose a valid priority filter." });
      }
      if (priority !== "All") filter.priority = priority;
    }
    if (search !== undefined) {
      if (typeof search !== "string" || search.length > 100) {
        return res.status(400).json({ message: "Search must be 100 characters or fewer." });
      }
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: escapedSearch, $options: "i" };
    }

    const sortBy = sort === "createdAt" ? { createdAt: -1 } : { dueDate: 1, createdAt: -1 };
    res.json(await Task.find(filter).sort(sortBy));
  } catch (error) {
    next(error);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    if (!isRecord(req.body)) {
      return res.status(400).json({ message: "Task details must be an object." });
    }
    const { title, description, category, priority, status, dueDate } = req.body;
    if (typeof title !== "string" || !title.trim() || title.trim().length > 120) {
      return res.status(400).json({ message: "Task title must contain 1 to 120 characters." });
    }
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ message: "Task description must be text." });
    }
    if (category !== undefined && typeof category !== "string") {
      return res.status(400).json({ message: "Task category must be text." });
    }

    const task = await Task.create({
      userId: req.userId,
      title: title.trim(),
      description,
      category,
      priority,
      status,
      dueDate: dueDate || null,
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    if (!isRecord(req.body)) {
      return res.status(400).json({ message: "Task details must be an object." });
    }

    const updates = Object.fromEntries(
      editableFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])
    );
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "Provide at least one valid task field to update." });
    }
    if (Object.hasOwn(updates, "title")) {
      if (typeof updates.title !== "string" || !updates.title.trim() || updates.title.trim().length > 120) {
        return res.status(400).json({ message: "Task title must contain 1 to 120 characters." });
      }
      updates.title = updates.title.trim();
    }
    if (Object.hasOwn(updates, "description") && typeof updates.description !== "string") {
      return res.status(400).json({ message: "Task description must be text." });
    }
    if (Object.hasOwn(updates, "category") && typeof updates.category !== "string") {
      return res.status(400).json({ message: "Task category must be text." });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    if (!isRecord(req.body) || !["Pending", "In Progress", "Completed"].includes(req.body.status)) {
      return res.status(400).json({ message: "Choose a valid task status." });
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
}
