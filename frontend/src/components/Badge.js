import React from "react";

const STATUS_MAP = {
  PENDING:     { label: "Pending",     cls: "badge-pending" },
  IN_PROGRESS: { label: "In Progress", cls: "badge-progress" },
  COMPLETED:   { label: "Completed",   cls: "badge-completed" },
};

const PRIORITY_MAP = {
  1: { label: "Low",    cls: "badge-low" },
  2: { label: "Medium", cls: "badge-medium" },
  3: { label: "High",   cls: "badge-high" },
};

const ROLE_MAP = {
  ADMIN: { label: "Admin", cls: "badge-admin" },
  USER:  { label: "User",  cls: "badge-user" },
};

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: "" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY_MAP[priority] || { label: priority, cls: "" };
  return <span className={`badge ${p.cls}`}>{p.label}</span>;
}

export function RoleBadge({ role }) {
  const r = ROLE_MAP[role] || { label: role, cls: "" };
  return <span className={`badge ${r.cls}`}>{r.label}</span>;
}
