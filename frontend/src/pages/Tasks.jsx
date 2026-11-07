import { useEffect, useMemo, useState } from "react";
import { Check, ListFilter, Pencil, Plus, Search, Trash2 } from "lucide-react";
import api from "../services/api";
import TaskForm from "../components/TaskForm";

const requestMessage = (error, fallback) => error.response?.data?.message || fallback;

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("dueDate");
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
      setError("");
    } catch (requestError) {
      setError(requestMessage(requestError, "Unable to load tasks."));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => tasks
      .filter((task) =>
        (status === "All" || task.status === status) &&
        (priority === "All" || task.priority === priority) &&
        task.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => sort === "createdAt"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.dueDate || "9999") - new Date(b.dueDate || "9999")),
    [tasks, status, priority, search, sort]
  );

  const save = async (data) => {
    if (editing) {
      await api.put(`/tasks/${editing._id}`, data);
    } else {
      await api.post("/tasks", data);
    }
    setEditing(null);
    await load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this task permanently?")) return;
    setError("");
    try {
      await api.delete(`/tasks/${id}`);
      await load();
    } catch (requestError) {
      setError(requestMessage(requestError, "Unable to delete this task."));
    }
  };

  const toggle = async (task) => {
    setError("");
    try {
      await api.patch(`/tasks/${task._id}/status`, {
        status: task.status === "Completed" ? "Pending" : "Completed",
      });
      await load();
    } catch (requestError) {
      setError(requestMessage(requestError, "Unable to update this task."));
    }
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">STAY ON TOP OF IT</span>
          <h1>My tasks</h1>
          <p>Plan your work, set priorities and make progress.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShow(true); }}>
          <Plus size={18} /> Add task
        </button>
      </div>
      <div className="panel task-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your tasks..." />
        </div>
        <div className="filter-controls">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option><option>Pending</option><option>In Progress</option><option>Completed</option>
          </select>
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option>All</option><option>Low</option><option>Medium</option><option>High</option>
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="dueDate">Due date</option><option value="createdAt">Recently created</option>
          </select>
        </div>
      </div>
      {error && <div className="error-message" role="alert">{error}</div>}
      <div className="task-list">
        {filtered.map((task) => (
          <article className="task-item panel" key={task._id}>
            <button
              className={`task-check ${task.status === "Completed" ? "done" : ""}`}
              onClick={() => toggle(task)}
              title="Toggle completion"
              aria-label={`Mark ${task.title} ${task.status === "Completed" ? "pending" : "completed"}`}
            >
              {task.status === "Completed" && <Check size={15} />}
            </button>
            <div className="task-main">
              <h3 className={task.status === "Completed" ? "completed-text" : ""}>{task.title}</h3>
              <p>{task.description || "No description added."}</p>
              <div className="task-meta">
                <span>{task.category}</span>
                <span>Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</span>
                <span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                <span className={`status status-${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span>
              </div>
            </div>
            <div className="task-actions">
              <button className="icon-button" onClick={() => { setEditing(task); setShow(true); }} title="Edit">
                <Pencil size={16} />
              </button>
              <button className="icon-button danger-icon" onClick={() => remove(task._id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <div className="panel empty-state">
            <ListFilter size={30} />
            <b>No matching tasks</b>
            <p>Try changing your search or filters, or add a new task.</p>
          </div>
        )}
      </div>
      {show && (
        <TaskForm
          initial={editing}
          onSave={save}
          onClose={() => { setShow(false); setEditing(null); }}
        />
      )}
    </>
  );
}
