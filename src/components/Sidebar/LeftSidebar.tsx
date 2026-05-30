import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import ElementItem from './ElementItem';
import LayersPanel from './LayersPanel';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ElementType } from '../../types/elements';

const ELEMENTS: { type: ElementType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'heading',
    label: 'Heading',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7" /></svg>,
  },
  {
    type: 'paragraph',
    label: 'Text',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>,
  },
  {
    type: 'button',
    label: 'Button',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="8" rx="4" /><line x1="9" y1="12" x2="15" y2="12" /></svg>,
  },
  {
    type: 'image',
    label: 'Image',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  },
  {
    type: 'rectangle',
    label: 'Rectangle',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /></svg>,
  },
  {
    type: 'circle',
    label: 'Circle',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>,
  },
];

type Mode = 'elements' | 'layers';

export default function LeftSidebar() {
  const [mode, setMode] = useState<Mode>('elements');

  const { elements, clearCanvas, undo, redo, addElement } = useCanvasStore(useShallow((s) => ({
    elements:    s.elements,
    clearCanvas: s.clearCanvas,
    undo:        s.undo,
    redo:        s.redo,
    addElement:  s.addElement,
  })));

  return (
    <aside
      className={`
        ${mode === 'layers' ? 'w-52' : 'w-20'}
        bg-[#1e1e2e] flex flex-col select-none shrink-0 transition-all duration-200
      `}
    >
      {/* ── Tab switcher ── */}
      <div className="flex items-center justify-around px-2 pt-3 pb-2 shrink-0">
        <button
          onClick={() => setMode('elements')}
          title="Elements"
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
            mode === 'elements' ? 'bg-violet-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          {mode === 'layers' && <span className="text-[9px] font-semibold leading-none">Elements</span>}
        </button>

        {/* Wrapper div owns the relative context so the badge isn't clipped by the button */}
        <div className="relative">
          <button
            onClick={() => setMode('layers')}
            title="Layers"
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
              mode === 'layers' ? 'bg-violet-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            {mode === 'layers' && <span className="text-[9px] font-semibold leading-none">Layers</span>}
          </button>
          {elements.length > 0 && mode !== 'layers' && (
            <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none pointer-events-none">
              {elements.length}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-[#2a2a3e] mx-2 mb-2" />

      {/* ── Elements panel ── */}
      {mode === 'elements' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 px-2 flex flex-col gap-1.5 overflow-y-auto">
            {ELEMENTS.map((el) => (
              <ElementItem
                key={el.type}
                type={el.type}
                label={el.label}
                icon={el.icon}
                onClick={() => addElement(el.type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Layers panel ── */}
      {mode === 'layers' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 pb-1 shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {elements.length} layer{elements.length !== 1 ? 's' : ''}
            </span>
          </div>
          <LayersPanel />
        </div>
      )}

      {/* ── Bottom controls (always visible) ── */}
      <div className="border-t border-[#2a2a3e] mx-2 mt-1" />
      <div className={`flex ${mode === 'layers' ? 'flex-row justify-around' : 'flex-col'} gap-1 px-2 py-2 shrink-0`}>
        <button
          onClick={undo}
          title="Undo (Ctrl+Z)"
          className="flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
          </svg>
        </button>

        <button
          onClick={redo}
          title="Redo (Ctrl+Y)"
          className="flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-.49-3.5" />
          </svg>
        </button>

        {elements.length > 0 && (
          <button
            onClick={() => { if (confirm('Clear canvas?')) clearCanvas(); }}
            title="Clear canvas"
            className="flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
