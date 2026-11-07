import Task from "../models/Task.js";

export async function stats(req, res, next) {
  try {
    const tasks = await Task.find({ userId: req.userId });
    const now = new Date();
    const completed = tasks.filter(t => t.status === "Completed").length;
    const pending = tasks.filter(t => t.status === "Pending").length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const overdue = tasks.filter(t => t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < now).length;
    const priority = ["Low", "Medium", "High"].map(name => ({
      name, value: tasks.filter(t => t.priority === name).length
    }));
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(); day.setDate(day.getDate() - (6 - i)); day.setHours(0,0,0,0);
      const next = new Date(day); next.setDate(next.getDate() + 1);
      return { day: day.toLocaleDateString("en", { weekday: "short" }),
        completed: tasks.filter(t => t.status === "Completed" && t.updatedAt >= day && t.updatedAt < next).length };
    });
    res.json({ total: tasks.length, completed, pending, inProgress, overdue,
      completionRate: tasks.length ? Math.round(completed / tasks.length * 100) : 0,
      priority, weekly, recent: tasks.sort((a,b) => b.updatedAt - a.updatedAt).slice(0,5) });
  } catch (e) { next(e); }
}