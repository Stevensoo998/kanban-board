import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDndContext,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { defaultDropAnimationSideEffects } from "@dnd-kit/core";
import TaskCardGhost from "../components/TaskCardGhost";
import React from "react";

function getWraps() {
  return Array.from(document.querySelectorAll(".column__listWrap[data-col]"));
}
function forceReflow(node) {
  node && node.getBoundingClientRect();
}
function measureWrap(wrap) {
  const list = wrap.firstElementChild;
  return list ? Math.round(list.scrollHeight) : 0;
}

export function useDndBoard({
  board,
  canManualReorder,
  findFromCol,
  findToCol,
  reorderInColumn,
  moveAcrossColumns,
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const dropAnimation = {
    duration: 260,
    easing: "cubic-bezier(.22,1,.36,1)",
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: "0.25" },
        dragOverlay: { filter: "drop-shadow(0 10px 24px rgba(0,0,0,.35))" },
      },
    }),
  };

  const startHeightsRef = React.useRef(new Map());

  function handleDragEndCore(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const fromCol = findFromCol(activeId);
    const toCol = findToCol(overId);
    if (!fromCol || !toCol) return;

    if (fromCol === toCol) {
      if (!canManualReorder?.(fromCol)) return;
      reorderInColumn(fromCol, activeId, overId, arrayMove);
    } else {
      moveAcrossColumns(fromCol, toCol, activeId, overId);
    }
  }

  function ActiveOverlay({ board }) {
    const { active } = useDndContext();
    const task = active ? board.tasks[String(active.id)] : null;
    return (
      <DragOverlay zIndex={20000} dropAnimation={dropAnimation}>
        {task ? (
          <div className="drag-overlay">
            <TaskCardGhost task={task} />
          </div>
        ) : null}
      </DragOverlay>
    );
  }

  function DndWrapper({ children }) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        autoScroll={false}
        onDragStart={() => {
          const map = new Map();
          for (const wrap of getWraps()) {
            const colId = wrap.getAttribute("data-col");
            const h = measureWrap(wrap);
            map.set(colId, h);
            wrap.style.transition = "none";
            wrap.style.overflow = "hidden";
            wrap.style.height = `${h}px`;
            forceReflow(wrap);
          }
          startHeightsRef.current = map;
        }}
        onDragEnd={(event) => {
          handleDragEndCore(event);

          Promise.resolve().then(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const reduced = window.matchMedia?.(
                  "(prefers-reduced-motion: reduce)"
                )?.matches;

                for (const wrap of getWraps()) {
                  const colId = wrap.getAttribute("data-col");
                  const from =
                    startHeightsRef.current.get(colId) ??
                    parseFloat(getComputedStyle(wrap).height || "0");
                  const to = measureWrap(wrap);

                  wrap.style.transition = "none";
                  forceReflow(wrap);

                  if (reduced || Math.abs(to - from) < 1) {
                    wrap.style.height = `${to}px`;
                    continue;
                  }

                  const anim = wrap.animate(
                    [{ height: `${from}px` }, { height: `${to}px` }],
                    { duration: 260, easing: "ease-in-out", fill: "forwards" }
                  );
                  anim.onfinish = () => {
                    wrap.style.height = `${to}px`;
                    wrap.style.transition = "";
                  };
                }

                startHeightsRef.current.clear();
              });
            });
          });
        }}
      >
        {children}
        <ActiveOverlay board={board} />
      </DndContext>
    );
  }

  return { DndWrapper };
}
