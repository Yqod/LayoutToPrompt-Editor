import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from '../../store/useCanvasStore';
import { CanvasElement, ElementType } from '../../types/elements';

// ── type icons ───────────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: ElementType }) {
  const cls = 'text-gray-500 shrink-0';
  switch (type) {
    case 'heading':   return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7" /></svg>;
    case 'paragraph': return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>;
    case 'button':    return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="8" rx="4" /></svg>;
    case 'image':     return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
    case 'rectangle': return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /></svg>;
    case 'circle':    return <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>;
  }
}

// ── single sortable layer row ─────────────────────────────────────────────────

interface LayerItemProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onToggleVisible: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
}

function LayerItem({ element, isSelected, onSelect, onRename, onToggleVisible, onToggleLock, onDelete }: LayerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: element.id });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(element.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(element.name);
      inputRef.current?.select();
    }
  }, [editing, element.name]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const hidden = !element.visible;
  const locked = element.locked;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`
        group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer select-none
        transition-colors duration-100
        ${isSelected ? 'bg-violet-600/20 border border-violet-500/40' : 'hover:bg-white/5 border border-transparent'}
        ${hidden ? 'opacity-40' : ''}
      `}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0 p-0.5 touch-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
          <circle cx="2.5" cy="2.5" r="1.5" /><circle cx="7.5" cy="2.5" r="1.5" />
          <circle cx="2.5" cy="7"   r="1.5" /><circle cx="7.5" cy="7"   r="1.5" />
          <circle cx="2.5" cy="11.5" r="1.5" /><circle cx="7.5" cy="11.5" r="1.5" />
        </svg>
      </button>

      {/* Type icon */}
      <TypeIcon type={element.type} />

      {/* Name — double-click to edit */}
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') setEditing(false);
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 bg-[#0d0d1a] text-gray-100 text-xs px-1 py-0.5 rounded border border-violet-500 outline-none"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className={`flex-1 min-w-0 text-xs truncate ${isSelected ? 'text-gray-100' : 'text-gray-400'}`}
          title={element.name}
        >
          {element.name}
        </span>
      )}

      {/* Action buttons — only visible on hover / when active */}
      <div className={`flex items-center gap-0.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        {/* Visibility */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
          title={hidden ? 'Show' : 'Hide'}
          className="p-0.5 text-gray-500 hover:text-gray-200 transition-colors"
        >
          {hidden ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>

        {/* Lock */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
          title={locked ? 'Unlock' : 'Lock'}
          className="p-0.5 text-gray-500 hover:text-gray-200 transition-colors"
        >
          {locked ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
          )}
        </button>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
          className="p-0.5 text-gray-600 hover:text-red-400 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── panel ─────────────────────────────────────────────────────────────────────

export default function LayersPanel() {
  const { elements, selectedId, selectElement, renameElement, toggleVisibility, toggleLock, deleteElement, reorderLayers } =
    useCanvasStore(useShallow((s) => ({
      elements:         s.elements,
      selectedId:       s.selectedId,
      selectElement:    s.selectElement,
      renameElement:    s.renameElement,
      toggleVisibility: s.toggleVisibility,
      toggleLock:       s.toggleLock,
      deleteElement:    s.deleteElement,
      reorderLayers:    s.reorderLayers,
    })));

  // Show highest z-index at top (Figma convention)
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((e) => e.id === active.id);
    const newIndex = sorted.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex);
    reorderLayers(reordered.map((e) => e.id));
  };

  if (elements.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" className="mb-2">
          <rect x="2" y="7" width="20" height="4" rx="1" />
          <rect x="2" y="13" width="20" height="4" rx="1" />
        </svg>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          No layers yet.<br />Add elements to the canvas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-1.5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-0.5">
            {sorted.map((el) => (
              <LayerItem
                key={el.id}
                element={el}
                isSelected={selectedId === el.id}
                onSelect={() => selectElement(el.id)}
                onRename={(name) => renameElement(el.id, name)}
                onToggleVisible={() => toggleVisibility(el.id)}
                onToggleLock={() => toggleLock(el.id)}
                onDelete={() => deleteElement(el.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
