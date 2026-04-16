import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { taskAPI } from "../services/api";
import { StatusBadge, PriorityBadge } from "../components/Badge";
import Spinner from "../components/Spinner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRes = await taskAPI.getAll({ limit: 5, page: 1 });
        setTasks(tasksRes.data.data.tasks);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  const pending   = tasks.filter((t) => t.status === "PENDING").length;
  const inProg    = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
            {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="page-subtitle">Here's what's happening with your tasks</p>
        </div>
        <Link to="/tasks" className="btn btn-primary">+ New Task</Link>
      </div>

      {/* User's own task stats */}
      <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text-muted)", marginBottom: "12px" }}>
        Your Recent Activity
      </p>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: "var(--warning)" }}>{pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-label">In Progress</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>{inProg}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{completed}</div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card" style={{ marginTop: "24px" }}>
        <div className="card-header">
          <h2 className="card-title">Recent Tasks</h2>
          <Link to="/tasks" style={{ fontSize: "13px", color: "var(--accent)" }}>View all →</Link>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No tasks yet. Create your first one!</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-item-body">
                  <div className="task-title">{task.title}</div>
                  {task.description && (
                    <div className="task-desc">{task.description}</div>
                  )}
                  <div className="task-meta">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
