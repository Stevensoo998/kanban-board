import React from "react";
import { LABELS, PRIORITY_COLORS } from "../constants";
import { fmtDate } from "../utils";

export default function TaskCardGhost({ task }) {
  if (!task) return null;

  return (
    <article className="card" style={{ pointerEvents: "none" }}>
      <h3 className="card__title" title={task.title}>
        {task.title}
      </h3>

      {task.description && <p className="card__desc">{task.description}</p>}

      {(task.lastTransition || task.createdAt) && (
        <ul className="card__meta">
          {task.lastTransition ? (
            <li>
              <strong>
                {LABELS[task.lastTransition.from]} &gt;{" "}
                {LABELS[task.lastTransition.to]}:
              </strong>{" "}
              {fmtDate(task.lastTransition.at)}
            </li>
          ) : (
            <li>
              <strong>Created:</strong> {fmtDate(task.createdAt)}
            </li>
          )}
        </ul>
      )}

      <footer className="card__footer">
        <span
          className="pill"
          style={{
            borderColor: PRIORITY_COLORS[task.priority],
            color: PRIORITY_COLORS[task.priority],
          }}
        >
          {task.priority}
        </span>
      </footer>
    </article>
  );
}
