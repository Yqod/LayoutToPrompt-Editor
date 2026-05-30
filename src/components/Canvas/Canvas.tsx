import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from '../../store/useCanvasStore';
import { CanvasElement as CanvasElementType, ElementType } from '../../types/elements';
import CanvasElement from './CanvasElement';
import ContextMenu from './ContextMenu';

interface SnapGuide {
  type: 'x' | 'y'; // x = vertical line, y = horizontal line
  position: number;
}

const SNAP_THRESHOLD = 6;

function computeSnap(
  id: string,
  rawX: number,
  rawY: number,
  dragging: CanvasElementType,
  all: CanvasElementType[],
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number; guides: SnapGuide[] } {
  let snappedX = rawX;
  let snappedY = rawY;
  let snappedOnX = false;
  let snappedOnY = false;
  const xSet = new Set<number>();
  const ySet = new Set<number>();

  const tryX = (guideAt: number, snapTo: number) => {
    xSet.add(guideAt);
    if (!snappedOnX) { snappedX = snapTo; snappedOnX = true; }
  };
  const tryY = (guideAt: number, snapTo: number) => {
    ySet.add(guideAt);
    if (!snappedOnY) { snappedY = snapTo; snappedOnY = true; }
  };

  const elCX = rawX + dragging.width / 2;
  const elCY = rawY + dragging.height / 2;
  const elR  = rawX + dragging.width;
  const elB  = rawY + dragging.height;

  // Canvas center axes
  const ccX = canvasWidth / 2;
  const ccY = canvasHeight / 2;
  if (Math.abs(elCX - ccX) < SNAP_THRESHOLD) tryX(ccX, ccX - dragging.width / 2);
  if (Math.abs(elCY - ccY) < SNAP_THRESHOLD) tryY(ccY, ccY - dragging.height / 2);

  // Canvas edges
  if (Math.abs(rawX) < SNAP_THRESHOLD)                         tryX(0,           0);
  if (Math.abs(elR - canvasWidth) < SNAP_THRESHOLD)            tryX(canvasWidth,  canvasWidth - dragging.width);
  if (Math.abs(rawY) < SNAP_THRESHOLD)                         tryY(0,            0);
  if (Math.abs(elB - canvasHeight) < SNAP_THRESHOLD)           tryY(canvasHeight, canvasHeight - dragging.height);

  // Other elements
  for (const other of all) {
    if (other.id === id) continue;
    const oCX = other.x + other.width / 2;
    const oCY = other.y + other.height / 2;
    const oR  = other.x + other.width;
    const oB  = other.y + other.height;

    // Center–center alignment
    if (Math.abs(elCX - oCX) < SNAP_THRESHOLD) tryX(oCX, oCX - dragging.width / 2);
    if (Math.abs(elCY - oCY) < SNAP_THRESHOLD) tryY(oCY, oCY - dragging.height / 2);

    // Left edge of dragged vs left/right edge of other
    if (Math.abs(rawX - other.x) < SNAP_THRESHOLD) tryX(other.x, other.x);
    if (Math.abs(rawX - oR) < SNAP_THRESHOLD)       tryX(oR,      oR);
    // Right edge of dragged vs left/right edge of other
    if (Math.abs(elR - other.x) < SNAP_THRESHOLD)   tryX(other.x, other.x - dragging.width);
    if (Math.abs(elR - oR) < SNAP_THRESHOLD)         tryX(oR,      oR - dragging.width);

    // Top edge of dragged vs top/bottom edge of other
    if (Math.abs(rawY - other.y) < SNAP_THRESHOLD) tryY(other.y, other.y);
    if (Math.abs(rawY - oB) < SNAP_THRESHOLD)       tryY(oB,      oB);
    // Bottom edge of dragged vs top/bottom edge of other
    if (Math.abs(elB - other.y) < SNAP_THRESHOLD)   tryY(other.y, other.y - dragging.height);
    if (Math.abs(elB - oB) < SNAP_THRESHOLD)         tryY(oB,      oB - dragging.height);
  }

  const guides: SnapGuide[] = [
    ...[...xSet].map(pos => ({ type: 'x' as const, position: pos })),
    ...[...ySet].map(pos => ({ type: 'y' as const, position: pos })),
  ];

  return { x: snappedX, y: snappedY, guides };
}

export default function Canvas() {
  const { elements, selectedId, canvasWidth, canvasHeight, selectElement, deleteElement, undo, redo, addElement, togglePromptOpen, promptOpen } =
    useCanvasStore(useShallow((s) => ({
      elements:         s.elements,
      selectedId:       s.selectedId,
      canvasWidth:      s.canvasWidth,
      canvasHeight:     s.canvasHeight,
      selectElement:    s.selectElement,
      deleteElement:    s.deleteElement,
      undo:             s.undo,
      redo:             s.redo,
      addElement:       s.addElement,
      togglePromptOpen: s.togglePromptOpen,
      promptOpen:       s.promptOpen,
    })));

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  // Compute scale to fit canvas in container
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const padding = 48;
      const sx = (width - padding) / canvasWidth;
      const sy = (height - padding) / canvasHeight;
      setScale(Math.min(sx, sy, 1));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [canvasWidth, canvasHeight]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) deleteElement(selectedId);
      }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, deleteElement, undo, redo]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) selectElement(null);
  }, [selectElement]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('elementType') as ElementType;
      if (!type) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      addElement(type, Math.round(x - 100), Math.round(y - 30));
    },
    [scale, addElement]
  );

  // Snap guide callbacks — stable refs so CanvasElement memoisation isn't broken
  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  const makeDragMove = useCallback(
    (id: string) => (rawX: number, rawY: number) => {
      const dragging = elementsRef.current.find(e => e.id === id);
      if (!dragging) return { x: rawX, y: rawY };
      const result = computeSnap(id, rawX, rawY, dragging, elementsRef.current, canvasWidth, canvasHeight);
      setSnapGuides(result.guides);
      return { x: result.x, y: result.y };
    },
    [canvasWidth, canvasHeight]
  );

  const handleDragEnd = useCallback(() => setSnapGuides([]), []);

  const makeContextMenu = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, elementId: id });
    },
    []
  );

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-[#f0f0f0] overflow-hidden relative"
      style={{ minWidth: 0 }}
    >
      {isOver && (
        <div className="absolute inset-0 bg-violet-500/10 border-4 border-violet-400 border-dashed z-50 pointer-events-none rounded-lg" />
      )}

      <div
        ref={setNodeRef}
        onMouseDown={handleCanvasClick}
        onContextMenu={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          width: canvasWidth,
          height: canvasHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: '#ffffff',
          position: 'relative',
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Elements */}
        {sorted.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            scale={scale}
            onDragMove={makeDragMove(el.id)}
            onDragEnd={handleDragEnd}
            onContextMenu={makeContextMenu(el.id)}
          />
        ))}

        {/* Snap guide lines */}
        {snapGuides.map((guide, i) =>
          guide.type === 'x' ? (
            <div
              key={`x-${i}`}
              style={{
                position: 'absolute',
                left: guide.position,
                top: 0,
                width: 1,
                height: canvasHeight,
                background: 'linear-gradient(to bottom, transparent, #a855f7 10%, #a855f7 90%, transparent)',
                pointerEvents: 'none',
                zIndex: 9990,
                transform: 'translateX(-0.5px)',
              }}
            />
          ) : (
            <div
              key={`y-${i}`}
              style={{
                position: 'absolute',
                top: guide.position,
                left: 0,
                height: 1,
                width: canvasWidth,
                background: 'linear-gradient(to right, transparent, #a855f7 10%, #a855f7 90%, transparent)',
                pointerEvents: 'none',
                zIndex: 9990,
                transform: 'translateY(-0.5px)',
              }}
            />
          )
        )}
      </div>

      {/* Canvas info */}
      <div className="absolute bottom-3 right-4 text-xs text-gray-400 select-none">
        {canvasWidth}×{canvasHeight}px · scale {Math.round(scale * 100)}%
      </div>

      {/* Context menu — fixed position, not affected by canvas scale */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          elementId={contextMenu.elementId}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Generate Prompt — floating button below canvas */}
      {elements.length > 0 && (
        <button
          onClick={togglePromptOpen}
          className={`
            absolute bottom-5 left-1/2 -translate-x-1/2
            flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold
            transition-all duration-200 shadow-lg select-none
            ${promptOpen
              ? 'bg-violet-700 text-white shadow-violet-700/30'
              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/40 hover:shadow-violet-500/50 hover:scale-105'
            }
          `}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Generate Prompt
        </button>
      )}
    </div>
  );
}
