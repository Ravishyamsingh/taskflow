import React from "react";

export default function Spinner({ fullscreen }) {
  return (
    <div className={`spinner-wrap ${fullscreen ? "fullscreen" : ""}`}>
      <div className="spinner" />
    </div>
  );
}
