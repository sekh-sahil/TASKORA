import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import api from "../services/api";

const colors = ["#8b82f6", "#4c9cf2", "#f4ae55"];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((response) => setStats(response.data))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || "Unable to load analytics.");
      });
  }, []);

  if (error) return <div className="error-message" role="alert">{error}</div>;
  if (!stats) return <div className="screen-loader">Loading analytics...</div>;

  const status = [
    { name: "Completed", value: stats.completed },
    { name: "Pending", value: stats.pending },
    { name: "In progress", value: stats.inProgress },
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MEASURE YOUR MOMENTUM</span>
          <h1>Analytics</h1>
          <p>Understand your habits and celebrate your progress.</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><span>Total tasks</span><strong>{stats.total}</strong><small>All-time tasks</small></div>
        <div className="stat-card"><span>Completion rate</span><strong>{stats.completionRate}%</strong><small>Tasks completed</small></div>
        <div className="stat-card"><span>Overdue</span><strong>{stats.overdue}</strong><small>Past due date</small></div>
        <div className="stat-card"><span>In progress</span><strong>{stats.inProgress}</strong><small>Currently active</small></div>
      </div>
      <div className="dashboard-grid analytics-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div><h2>Task status</h2><p>How your workload is distributed</p></div>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={status} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={4}>
                  {status.map((item, index) => <Cell key={item.name} fill={colors[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="analytics-legend">
            {status.map((item, index) => (
              <span key={item.name}><i style={{ background: colors[index] }} />{item.name}<b>{item.value}</b></span>
            ))}
          </div>
        </section>
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div><h2>Priority breakdown</h2><p>Tasks by priority level</p></div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.priority}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#7065ee" radius={[7, 7, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}
