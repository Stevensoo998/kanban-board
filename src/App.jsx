import React, { useEffect, useState } from "react";
import "./index.css";
import Column from "./components/Column";
import NewTaskModal from "./components/NewTaskModal";
import ConfirmDialog from "./components/ConfirmDialog";
import { useBoardState, COLUMN_ORDER } from "./hooks/useBoardState";
import { useColumnSort } from "./hooks/useColumnSort";
import { useDndBoard } from "./hooks/useDndBoard";

export default function App() {
  const {
    board,
    setBoard,
    columnTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderInColumn,
    moveAcrossColumns,
    findColumnIdContainingTask,
    findColumnIdByContainer,
  } = useBoardState();

  const { sortModes, setSortModes, sortTasksForColumn, canManualReorder } =
    useColumnSort();

  const { DndWrapper } = useDndBoard({
    board,
    canManualReorder,
    findFromCol: findColumnIdContainingTask,
    findToCol: (overId) =>
      findColumnIdContainingTask(overId) ?? findColumnIdByContainer(overId),
    reorderInColumn,
    moveAcrossColumns,
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("kanban-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("kanban-theme", theme);
    } catch {}
  }, [theme]);
  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  const [showNewTask, setShowNewTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editMeta, setEditMeta] = useState({ id: null, col: "todo" });

  function openEdit(task) {
    const col = findColumnIdContainingTask(task.id) || "todo";
    setEditMeta({ id: task.id, col });
    setShowEditTask(true);
  }

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  function askDelete(taskId) {
    setPendingDeleteId(taskId);
    setConfirmOpen(true);
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <h1 className="app__title"> Kanban Task Board</h1>
        </div>
        <div className="app__actions">
          <button
            className="iconbtn app__theme"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="btn app__new" onClick={() => setShowNewTask(true)}>
            + New task
          </button>
        </div>
      </header>

      <DndWrapper>
        <main className="board" role="list" aria-label="Kanban board">
          {COLUMN_ORDER.map((colId) => {
            const tasks = sortTasksForColumn(colId, columnTasks[colId]);
            return (
              <Column
                key={colId}
                column={board.columns[colId]}
                tasks={tasks}
                onEditTask={openEdit}
                onDeleteTask={askDelete}
                sortMode={sortModes[colId]}
                onChangeSort={(mode) =>
                  setSortModes((m) => ({ ...m, [colId]: mode }))
                }
              />
            );
          })}
        </main>
      </DndWrapper>

      <NewTaskModal
        open={showNewTask}
        onClose={() => setShowNewTask(false)}
        onCreate={createTask}
      />

      <NewTaskModal
        open={showEditTask}
        onClose={() => setShowEditTask(false)}
        onUpdate={updateTask}
        initialTask={editMeta.id ? board.tasks[editMeta.id] : null}
        initialColumnId={editMeta.col}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this card"
        message={
          pendingDeleteId
            ? `Delete "${
                board.tasks[pendingDeleteId]?.title ?? "this card"
              }"? This cannot be undone.`
            : "Delete this card?"
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDeleteId) deleteTask(pendingDeleteId);
        }}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
