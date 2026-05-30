import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from '../../store/useCanvasStore';

interface Props {
  x: number;
  y: number;
  elementId: string;
  onClose: () => void;
}

function Divider() {
  return <div className="my-1 border-t border-[#2a2a3e]" />;
}

function Item({
  icon, label, onClick, danger = false, dim = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  dim?: boolean;
}) {
  return (
    <button
      onMouseDown={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left transition-colors rounded-md
        ${danger
          ? 'text-red-400 hover:bg-red-500/10'
          : dim
            ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            : 'text-gray-300 hover:text-white hover:bg-white/8'
        }`}
    >
      <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">{icon}</span>
      {label}
    </button>
  );
}

export default function ContextMenu({ x, y, elementId, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  const {
    elements, duplicateElement, deleteElement,
    bringForward, sendBackward, bringToFront, sendToBack,
    toggleLock, toggleVisibility, selectElement,
  } = useCanvasStore(useShallow((s) => ({
    elements:         s.elements,
    duplicateElement: s.duplicateElement,
    deleteElement:    s.deleteElement,
    bringForward:     s.bringForward,
    sendBackward:     s.sendBackward,
    bringToFront:     s.bringToFront,
    sendToBack:       s.sendToBack,
    toggleLock:       s.toggleLock,
    toggleVisibility: s.toggleVisibility,
    selectElement:    s.selectElement,
  })));

  const element = elements.find((e) => e.id === elementId);

  // Smart positioning — flip if near screen edge
  useLayoutEffect(() => {
    if (!menuRef.current) return;
    const { width, height } = menuRef.current.getBoundingClientRect();
    setPos({
      x: x + width  > window.innerWidth  - 8 ? x - width  : x,
      y: y + height > window.innerHeight - 8 ? y - height : y,
    });
  }, [x, y]);

  // Close on outside click or Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!element) return null;

  const act = (fn: () => void) => { fn(); onClose(); };

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 99999 }}
      className="w-48 bg-[#1e1e2e] border border-[#3a3a5c] rounded-xl shadow-2xl shadow-black/40 py-1.5 px-1"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Element name header */}
      <div className="px-3 py-1 mb-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {element.name}
        </span>
      </div>

      <Divider />

      <Item
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
        label="Duplicate"
        onClick={() => act(() => duplicateElement(elementId))}
      />

      <Divider />

      <Item
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 8 22 12 18 16"/><polyline points="6 16 2 12 6 8"/><line x1="2" y1="12" x2="22" y2="12"/></svg>}
        label="Bring to Front"
        onClick={() => act(() => bringToFront(elementId))}
      />
      <Item
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>}
        label="Bring Forward"
        onClick={() => act(() => bringForward(elementId))}
      />
      <Item
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>}
        label="Send Backward"
        onClick={() => act(() => sendBackward(elementId))}
      />
      <Item
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 16 2 12 6 8"/><polyline points="18 8 22 12 18 16"/><line x1="2" y1="12" x2="22" y2="12"/></svg>}
        label="Send to Back"
        onClick={() => act(() => sendToBack(elementId))}
      />

      <Divider />

      <Item
        icon={element.visible
          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M3 3l18 18"/></svg>
        }
        label={element.visible ? 'Hide' : 'Show'}
        onClick={() => act(() => toggleVisibility(elementId))}
        dim={!element.visible}
      />
      <Item
        icon={element.locked
          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
        }
        label={element.locked ? 'Unlock' : 'Lock'}
        onClick={() => act(() => toggleLock(elementId))}
      />

      <Divider />

      <Item
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>}
        label="Delete"
        onClick={() => act(() => deleteElement(elementId))}
        danger
      />
    </div>
  );
}
