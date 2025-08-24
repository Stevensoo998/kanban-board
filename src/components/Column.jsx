import React from "react";
import TaskCard from "./TaskCard";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

export default function Column({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
  sortMode = "manual",
  onChangeSort,
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  const rank = { high: 0, medium: 1, low: 2 };

  const tasksToRender = React.useMemo(() => {
    if (sortMode === "manual") return tasks;
    const copy = [...tasks];
    copy.sort((a, b) => {
      const diff = rank[a.priority] - rank[b.priority];
      return sortMode === "high-low" ? diff : -diff;
    });
    return copy;
  }, [tasks, sortMode]);

  return (
    <section
      className={`column column--${column.id}`}
      aria-labelledby={`${column.id}-title`}
    >
      <div className="column__title">
        <h2 id={`${column.id}-title`} style={{ margin: 0 }}>
          {column.title}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge">{tasks.length}</span>
          <select
            aria-label="Sort tasks"
            className="select"
            value={sortMode}
            onChange={(e) => onChangeSort?.(e.target.value)}
            style={{ paddingBlock: 4, paddingInline: 8 }}
          >
            <option value="manual">Manual</option>
            <option value="high-low">High → Low</option>
            <option value="low-high">Low → High</option>
          </select>
        </div>
      </div>

      <SortableContext
        items={tasksToRender.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="column__listWrap" data-col={column.id}>
          <div
            id={column.id}
            ref={setNodeRef}
            className="column__list"
            role="list"
          >
            {tasksToRender.length === 0 ? (
              <p className="muted">No cards</p>
            ) : (
              tasksToRender.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </div>
        </div>
      </SortableContext>
    </section>
  );
}
