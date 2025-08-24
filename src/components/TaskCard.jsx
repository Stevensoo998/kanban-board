import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LABELS, PRIORITY_COLORS } from "../constants";

function fmt(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    // keep layout animation when sorting or after a drag
    animateLayoutChanges: (args) => args.isSorting || args.wasDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition && transition.length
        ? transition
        : "transform 220ms cubic-bezier(.2,0,0,1)",
    willChange: "transform",
    opacity: isDragging ? 0.6 : 1,
  };

  const now = Date.now();
  const justCompleted =
    task?.lastTransition?.to === "done" &&
    now - new Date(task.lastTransition.at).getTime() < 2000;
  const justCreated =
    task?.createdAt &&
    !task?.lastTransition &&
    now - new Date(task.createdAt).getTime() < 2000;

  const cardClass = `card${justCompleted ? " flash-success" : ""}${
    justCreated ? " flash-create" : ""
  }`;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cardClass}
      role="listitem"
      aria-label={task.title}
      {...attributes}
      {...listeners}
    >
      <h3 className="card__title" title={task.title}>
        {task.title}
      </h3>

      {task.description && <p className="card__desc">{task.description}</p>}

      <div className="card__meta-line">
        {task.lastTransition ? (
          <>
            <strong>
              {LABELS[task.lastTransition.from]} &gt;{" "}
              {LABELS[task.lastTransition.to]}:
            </strong>{" "}
            {fmt(task.lastTransition.at)}
          </>
        ) : task.createdAt ? (
          <>
            <strong>Created:</strong> {fmt(task.createdAt)}
          </>
        ) : null}
      </div>

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

        <div className="card__actions">
          <button
            className="iconbtn"
            title="Edit"
            aria-label="Edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            ✎
          </button>
          <button
            className="iconbtn"
            title="Delete"
            aria-label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            🗑
          </button>
        </div>
      </footer>
    </article>
  );
}
