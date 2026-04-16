import React, { useState, useEffect, useCallback } from "react";
import { taskAPI } from "../services/api";
import { StatusBadge, PriorityBadge } from "../components/Badge";
import TaskModal from "../components/TaskModal";
import Spinner from "../components/Spinner";

const PRIORITY_LABELS = { 1: "Low", 2: "Medium", 3: "High" };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", search: "", page: 1, limit: 10 });

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
      const res = await taskAPI.getAll(params);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch {
      showAlert("error", "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleFilterChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value, page: 1 }));
  };

  const openCreate = () => { setEditTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditTask(task); setModalOpen(true); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editTask) {
        await taskAPI.update(editTask.id, data);
        showAlert("success", "Task updated successfully.");
      } else {
        await taskAPI.create(data);
        showAlert("success", "Task created successfully.");
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      throw err; // Let modal handle the error display
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await taskAPI.delete(id);
      showAlert("success", "Task deleted.");
      fetchTasks();
    } catch {
      showAlert("error", "Failed to delete task.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage and track your tasks</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Task</button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type === "error" ? "error" : "success"}`}>
          {alert.type === "error" ? "⚠" : "✓"} {alert.msg}
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="form-input"
          name="search"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select className="form-select" name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="form-select" name="priority" value={filters.priority} onChange={handleFilterChange}>
          <option value="">All Priorities</option>
          <option value="3">High</option>
          <option value="2">Medium</option>
          <option value="1">Low</option>
        </select>
      </div>

      {/* Task list */}
      <div className="card">
        {loading ? (
          <Spinner />
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">No tasks found. Create your first one!</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-item-body">
                  <div className="task-title">{task.title}</div>
                  {task.description && <div className="task-desc">{task.description}</div>}
                  <div className="task-meta">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    {task.user && (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        by {task.user.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <button className="task-action-btn" onClick={() => openEdit(task)}>Edit</button>
                  <button className="task-action-btn del" onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <span>
              Showing {(filters.page - 1) * filters.limit + 1}–
              {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="pagination-btns">
              <button
                className="btn btn-ghost"
                disabled={!pagination.hasPrev}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              >← Prev</button>
              <button
                className="btn btn-ghost"
                disabled={!pagination.hasNext}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <TaskModal
          task={editTask}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          loading={saving}
        />
      )}
    </div>
  );
}
