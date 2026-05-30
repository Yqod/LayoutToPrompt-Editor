import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from '../../store/useCanvasStore';
import { TextElement, ShapeElement, ImageElement } from '../../types/elements';
import TextProperties from '../Properties/TextProperties';
import ShapeProperties from '../Properties/ShapeProperties';
import ImageProperties from '../Properties/ImageProperties';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min, max }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <input
      type="number"
      value={Math.round(value)}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
    />
  );
}

const TYPE_LABELS: Record<string, string> = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  button: 'Button',
  image: 'Image',
  rectangle: 'Rectangle',
  circle: 'Circle',
};

export default function RightSidebar() {
  const { elements, selectedId, updateElement, deleteElement, bringForward, sendBackward } = useCanvasStore(useShallow((s) => ({
    elements: s.elements,
    selectedId: s.selectedId,
    updateElement: s.updateElement,
    deleteElement: s.deleteElement,
    bringForward: s.bringForward,
    sendBackward: s.sendBackward,
  })));

  const element = elements.find((e) => e.id === selectedId);

  if (!element) {
    return (
      <aside className="w-56 bg-[#1e1e2e] border-l border-[#2a2a3e] flex flex-col items-center justify-center p-6 text-center shrink-0">
        <div className="text-gray-600 mb-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Click an element<br />to edit it
        </p>
      </aside>
    );
  }

  const upd = (key: string, val: unknown) => updateElement(element.id, { [key]: val } as never);

  return (
    <aside className="w-56 bg-[#1e1e2e] border-l border-[#2a2a3e] flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[#2a2a3e]">
        <span className="text-xs font-semibold text-gray-200">{TYPE_LABELS[element.type]}</span>
        <button
          onClick={() => deleteElement(element.id)}
          className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded"
          title="Delete element"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-5 overflow-y-auto">
        {/* Position & Size */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Position & Size</p>
          <div className="grid grid-cols-2 gap-2">
            <Row label="X">
              <NumberInput value={element.x} onChange={(v) => upd('x', v)} />
            </Row>
            <Row label="Y">
              <NumberInput value={element.y} onChange={(v) => upd('y', v)} />
            </Row>
            <Row label="W">
              <NumberInput value={element.width} min={20} onChange={(v) => upd('width', v)} />
            </Row>
            <Row label="H">
              <NumberInput value={element.height} min={20} onChange={(v) => upd('height', v)} />
            </Row>
          </div>
        </div>

        {/* Opacity */}
        <Row label={`Opacity: ${element.opacity}%`}>
          <input
            type="range"
            min={0}
            max={100}
            value={element.opacity}
            onChange={(e) => upd('opacity', Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </Row>

        {/* Z-Index controls */}
        <Row label={`Layer (z-index: ${element.zIndex})`}>
          <div className="flex gap-1">
            <button
              onClick={() => sendBackward(element.id)}
              className="flex-1 py-1.5 text-xs bg-[#2a2a3e] text-gray-400 hover:text-white hover:bg-[#3a3a5c] rounded-md border border-[#3a3a5c] transition-colors"
              title="Send backward"
            >
              ↓ Back
            </button>
            <button
              onClick={() => bringForward(element.id)}
              className="flex-1 py-1.5 text-xs bg-[#2a2a3e] text-gray-400 hover:text-white hover:bg-[#3a3a5c] rounded-md border border-[#3a3a5c] transition-colors"
              title="Bring forward"
            >
              ↑ Front
            </button>
          </div>
        </Row>

        {/* Divider */}
        <div className="border-t border-[#2a2a3e]" />

        {/* Type-specific properties */}
        {(element.type === 'heading' || element.type === 'paragraph' || element.type === 'button') && (
          <TextProperties element={element as TextElement} />
        )}
        {(element.type === 'rectangle' || element.type === 'circle') && (
          <ShapeProperties element={element as ShapeElement} />
        )}
        {element.type === 'image' && (
          <ImageProperties element={element as ImageElement} />
        )}
      </div>
    </aside>
  );
}
