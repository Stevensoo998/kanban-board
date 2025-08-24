import { useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export const COLUMN_ORDER = ["todo", "inprogress", "done"];
export const LABELS = { todo: "To Do", inprogress: "In Progress", done: "Done" };

const EMPTY_BOARD = {
  columns: {
    todo: {
      id: "todo",
      title: "To Do",
      taskIds: ["t-1", "t-2", "t-3", "t-4"],
    },
    inprogress: {
      id: "inprogress",
      title: "In Progress",
      taskIds: ["t-5", "t-6", "t-7"],
    },
    done: {
      id: "done",
      title: "Done",
      taskIds: ["t-8", "t-9", "t-10"],
    },
  },
  tasks: {
    

    // To Do
    "t-1": {
      id: "t-1",
      title: "test1",
      description: "test desc 2",
      priority: "high",
      createdAt: "2025-08-15T09:00:00.000Z",
      lastTransition: null,
    },
    "t-2": {
      id: "t-2",
      title: "test 2",
      description: "test desc 2",
      priority: "medium",
      createdAt: "2025-08-11T09:45:00.000Z",
      lastTransition: null,
    },
    "t-3": {
      id: "t-3",
      title: "test 3",
      description: "test desc 3",
      priority: "low",
      createdAt: "2025-08-13T16:40:00.000Z",
      lastTransition: null,
    },
    "t-4": {
      id: "t-4",
      title: "test 4",
      description: "test desc 4",
      priority: "low",
      createdAt: "2025-08-01T12:00:00.000Z",
      lastTransition: null,
    },

    // In Progress
    "t-5": {
      id: "t-5",
      title: "test 5",
      description: "test desc 5",
      priority: "high",
      createdAt: "2025-07-30T08:30:00.000Z",
      lastTransition: { from: "todo", to: "inprogress", at: "2025-08-10T09:00:00.000Z" },
    },
    "t-6": {
      id: "t-6",
      title: "test 6",
      description: "test desc 6",
      priority: "medium",
      createdAt: "2025-08-02T10:00:00.000Z",
      lastTransition: { from: "todo", to: "inprogress", at: "2025-08-12T11:15:00.000Z" },
    },
    "t-7": {
      id: "t-7",
      title: "test 7",
      description: "test desc 7",
      priority: "medium",
      createdAt: "2025-08-04T13:20:00.000Z",
      lastTransition: { from: "todo", to: "inprogress", at: "2025-08-14T14:10:00.000Z" },
    },

    // Done
    "t-8": {
      id: "t-8",
      title: "test 8",
      description: "test desc 8",
      priority: "medium",
      createdAt: "2025-08-06T10:10:00.000Z",
      lastTransition: { from: "inprogress", to: "done", at: "2025-08-16T15:30:00.000Z" },
    },
    "t-9": {
      id: "t-9",
      title: "test 9",
      description: "test desc 9",
      priority: "high",
      createdAt: "2025-08-03T08:00:00.000Z",
      lastTransition: { from: "inprogress", to: "done", at: "2025-08-05T18:00:00.000Z" },
    },
    "t-10": {
      id: "t-10",
      title: "test 10",
      description: "test desc 10",
      priority: "low",
      createdAt: "2025-07-28T07:20:00.000Z",
      lastTransition: { from: "todo", to: "done", at: "2025-08-08T07:45:00.000Z" },
    },
  },
};

export function useBoardState(initialBoard = EMPTY_BOARD) {
  const [board, setBoard] = useLocalStorage("kanban-board", initialBoard);

  const columnTasks = useMemo(() => {
    const map = { todo: [], inprogress: [], done: [] };
    for (const col of COLUMN_ORDER) {
      map[col] = board.columns[col].taskIds
        .map((id) => board.tasks[id])
        .filter(Boolean);
    }
    return map;
  }, [board]);

  function findColumnIdContainingTask(taskId) {
    for (const [colId, col] of Object.entries(board.columns)) {
      if (col.taskIds.includes(taskId)) return colId;
    }
    return null;
  }
  function findColumnIdByContainer(containerId) {
    return Object.keys(board.columns).find((id) => id === containerId) ?? null;
  }

  function createTask({ title, description, priority, columnId }) {
    const id = `t-${Date.now()}`;
    const now = new Date().toISOString();
    const next = structuredClone(board);
    next.tasks[id] = { id, title, description, priority, createdAt: now, lastTransition: null };
    next.columns[columnId].taskIds = [id, ...next.columns[columnId].taskIds];
    setBoard(next);
  }

  function updateTask({ id, title, description, priority, columnId }) {
    const fromCol = findColumnIdContainingTask(id);
    const next = structuredClone(board);
    if (!next.tasks[id]) return;

    if (title !== undefined) next.tasks[id].title = title;
    if (description !== undefined) next.tasks[id].description = description;
    if (priority !== undefined) next.tasks[id].priority = priority;

    if (fromCol && columnId && fromCol !== columnId) {
      const fromList = next.columns[fromCol].taskIds;
      const idx = fromList.indexOf(id);
      if (idx > -1) fromList.splice(idx, 1);
      next.columns[columnId].taskIds.unshift(id);
      next.tasks[id].lastTransition = { from: fromCol, to: columnId, at: new Date().toISOString() };
    }

    setBoard(next);
  }

  function deleteTask(taskId) {
    const next = structuredClone(board);
    const col = findColumnIdContainingTask(taskId);
    if (col) {
      const list = next.columns[col].taskIds;
      const idx = list.indexOf(taskId);
      if (idx > -1) list.splice(idx, 1);
    }
    delete next.tasks[taskId];
    setBoard(next);
  }

  function reorderInColumn(colId, activeId, overId, arrayMove) {
    const next = structuredClone(board);
    const list = next.columns[colId].taskIds;
    const oldIndex = list.indexOf(activeId);
    let newIndex = list.indexOf(overId);
    if (newIndex === -1) newIndex = list.length - 1;
    if (oldIndex !== newIndex) {
      next.columns[colId].taskIds = arrayMove(list, oldIndex, newIndex);
      setBoard(next);
    }
  }

  function moveAcrossColumns(fromCol, toCol, activeId, overId) {
    const next = structuredClone(board);
    const fromList = next.columns[fromCol].taskIds;
    const toList = next.columns[toCol].taskIds;

    const fromIndex = fromList.indexOf(activeId);
    if (fromIndex > -1) fromList.splice(fromIndex, 1);

    const overIndex = toList.indexOf(overId);
    const insertAt = overIndex >= 0 ? overIndex : toList.length;
    toList.splice(insertAt, 0, activeId);

    if (next.tasks[activeId]) {
      next.tasks[activeId].lastTransition = { from: fromCol, to: toCol, at: new Date().toISOString() };
    }
    setBoard(next);
  }

  return {
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
  };
}
