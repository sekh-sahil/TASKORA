import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import api from "../services/api";

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/tasks")
      .then((response) => setTasks(response.data))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || "Unable to load your calendar.");
      })
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const groups = tasks.filter((task) => task.dueDate).reduce((acc, task) => {
      const key = new Date(task.dueDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      (acc[key] ??= []).push(task);
      return acc;
    }, {});
    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [tasks]);

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PLAN AHEAD</span>
          <h1>Calendar</h1>
          <p>See your deadlines grouped by due date.</p>
        </div>
      </div>
      {error && <div className="error-message" role="alert">{error}</div>}
      {loading ? (
        <div className="screen-loader">Loading your calendar...</div>
      ) : (
        <div className="calendar-list">
          {sorted.map(([date, list]) => (
            <section className="panel calendar-day" key={date}>
              <div className="calendar-date">
                <CalendarDays />
                <b>{date}</b>
                <span>{list.length} task{list.length === 1 ? "" : "s"}</span>
              </div>
              {list.map((task) => (
                <div className="calendar-task" key={task._id}>
                  <span className={`priority-dot priority-${task.priority.toLowerCase()}`} />
                  <div>
                    <b>{task.title}</b>
                    <small>{task.category} · {task.status}</small>
                  </div>
                </div>
              ))}
            </section>
          ))}
          {!sorted.length && !error && (
            <div className="panel empty-state">
              <CalendarDays size={32} />
              <b>No deadlines yet</b>
              <p>Add due dates to your tasks and they'll appear here.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
