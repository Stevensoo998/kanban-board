import React, { useEffect, useRef, useState } from "react";
export default function NewTaskModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  defaultColumn = "todo",
  initialTask = null,
  initialColumnId = "todo",
}) {
  const isEdit = Boolean(initialTask);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [columnId, setColumnId] = useState(defaultColumn);
  const [closing, setClosing] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setClosing(false);

    if (isEdit) {
      setTitle(initialTask.title || "");
      setDesc(initialTask.description || "");
      setPriority(initialTask.priority || "medium");
      setColumnId(initialColumnId || "todo");
    } else {
      setTitle("");
      setDesc("");
      setPriority("medium");
      setColumnId(defaultColumn);
    }
    setTimeout(() => titleRef.current?.focus(), 0);
  }, [open, isEdit, initialTask, initialColumnId, defaultColumn]);

  if (!open) return null;

  function requestClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 160);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEdit) {
      onUpdate({
        id: initialTask.id,
        title: title.trim(),
        description: desc.trim() || undefined,
        priority,
        columnId,
      });
    } else {
      onCreate({
        title: title.trim(),
        description: desc.trim() || undefined,
        priority,
        columnId,
      });
    }
    requestClose();
  }

  function handleBackdrop(e) {
    if (e.target.getAttribute("data-backdrop")) requestClose();
  }

  function onKeyDown(e) {
    if (e.key === "Escape") requestClose();
  }

  return (
    <div
      className="modal__backdrop"
      data-backdrop
      data-closing={closing ? "true" : undefined}
      onClick={handleBackdrop}
      onKeyDown={onKeyDown}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal" data-closing={closing ? "true" : undefined}>
        <header className="modal__header">
          <h3 className="modal__title">
            {isEdit ? "Edit task" : "Create new task"}
          </h3>
          <button
            className="btn btn--ghost"
            onClick={requestClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal__body">
          <label className="field">
            <span className="field__label">Title</span>
            <input
              ref={titleRef}
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short task name"
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Description</span>
            <textarea
              className="textarea"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Optional details"
              rows={4}
            />
          </label>

          <div className="grid2">
            <label className="field">
              <span className="field__label">Priority</span>
              <select
                className="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </label>

            <label className="field">
              <span className="field__label">Column</span>
              <select
                className="select"
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          <footer className="modal__footer">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={requestClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn">
              {isEdit ? "Save changes" : "Create"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
