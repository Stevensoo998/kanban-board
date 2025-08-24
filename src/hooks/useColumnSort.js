import React, { useEffect, useState } from "react";

export function useColumnSort() {
  const [sortModes, setSortModes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kanban-sort-modes")) || {
        todo: "manual",
        inprogress: "manual",
        done: "manual",
      };
    } catch {
      return { todo: "manual", inprogress: "manual", done: "manual" };
    }
  });

  useEffect(() => {
    try { localStorage.setItem("kanban-sort-modes", JSON.stringify(sortModes)); } catch {}
  }, [sortModes]);

  const rank = { high: 0, medium: 1, low: 2 };

  function sortTasksForColumn(colId, tasks) {
    const mode = sortModes[colId] || "manual";
    if (mode === "manual") return tasks;
    const copy = [...tasks];
    copy.sort((a, b) => {
      const diff = rank[a.priority] - rank[b.priority];
      return mode === "high-low" ? diff : -diff;
    });
    return copy;
  }

  function canManualReorder(colId) {
    return (sortModes[colId] || "manual") === "manual";
  }

  return { sortModes, setSortModes, sortTasksForColumn, canManualReorder };
}
