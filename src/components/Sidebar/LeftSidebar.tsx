import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import ElementItem from './ElementItem';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ElementType } from '../../types/elements';

const ELEMENTS: { type: ElementType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'heading',
    label: 'Heading',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    type: 'paragraph',
    label: 'Text',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7V4h16v3M9 20h6M12 4v16" />
      </svg>
    ),
  },
  {
    type: 'button',
    label: 'Button',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="8" width="18" height="8" rx="4" />
        <line x1="9" y1="12" x2="15" y2="12" />
      </svg>
    ),
  },
  {
    type: 'image',
    label: 'Image',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    type: 'rectangle',
    label: 'Rectangle',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
      </svg>
    ),
  },
  {
    type: 'circle',
    label: 'Circle',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

export default function LeftSidebar() {
  const { elements, clearCanvas, undo, redo, addElement } = useCanvasStore(useShallow((s) => ({
    elements: s.elements,
    clearCanvas: s.clearCanvas,
    undo: s.undo,
    redo: s.redo,
    addElement: s.addElement,
  })));

  return (
    <aside className="w-[72px] bg-[#1e1e2e] flex flex-col items-center py-4 gap-2 select-none shrink-0">
      {/* Logo */}
      <div className="mb-2">
        <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
      </div>

      <div className="w-full px-2 flex flex-col gap-1.5">
        {ELEMENTS.map((el) => (
          <ElementItem key={el.type} type={el.type} label={el.label} icon={el.icon} onClick={() => addElement(el.type)} />
        ))}
      </div>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex flex-col gap-1 px-2 w-full">
        <button
          onClick={undo}
          title="Undo (Ctrl+Z)"
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
          </svg>
        </button>
        <button
          onClick={redo}
          title="Redo (Ctrl+Y)"
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-.49-3.5" />
          </svg>
        </button>

        {elements.length > 0 && (
          <button
            onClick={() => { if (confirm('Clear canvas?')) clearCanvas(); }}
            title="Clear canvas"
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
