import React from 'react';
import { TextElement } from '../../types/elements';
import { useCanvasStore } from '../../store/useCanvasStore';

interface Props {
  element: TextElement;
}

const FONTS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Verdana', 'Times New Roman'];
const WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: 'normal', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: 'bold', label: 'Bold' },
  { value: '700', label: '700' },
  { value: '900', label: 'Black' },
] as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', min, max, step }: {
  value: string | number; onChange: (v: string) => void;
  type?: string; min?: number; max?: number; step?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
    />
  );
}

export default function TextProperties({ element }: Props) {
  const update = useCanvasStore((s) => s.updateElement);
  const upd = (key: string, val: unknown) => update(element.id, { [key]: val } as Partial<TextElement>);

  return (
    <div className="flex flex-col gap-4">
      <Row label="Content">
        <textarea
          value={element.content}
          onChange={(e) => upd('content', e.target.value)}
          rows={3}
          className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500 resize-none"
        />
      </Row>

      <Row label="Font">
        <select
          value={element.fontFamily}
          onChange={(e) => upd('fontFamily', e.target.value)}
          className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
        >
          {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </Row>

      <div className="grid grid-cols-2 gap-2">
        <Row label="Size (px)">
          <Input type="number" value={element.fontSize} min={8} max={200} onChange={(v) => upd('fontSize', Number(v))} />
        </Row>
        <Row label="Weight">
          <select
            value={element.fontWeight}
            onChange={(e) => upd('fontWeight', e.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
          >
            {WEIGHTS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </Row>
      </div>

      <Row label="Alignment">
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => upd('textAlign', align)}
              className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                element.textAlign === align
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-[#2a2a3e] border-[#3a3a5c] text-gray-400 hover:border-violet-500'
              }`}
            >
              {align === 'left' ? '⬛◻◻' : align === 'center' ? '◻⬛◻' : '◻◻⬛'}
            </button>
          ))}
        </div>
      </Row>

      <div className="grid grid-cols-2 gap-2">
        <Row label="Text color">
          <div className="flex gap-1 items-center">
            <input
              type="color"
              value={element.color}
              onChange={(e) => upd('color', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <Input value={element.color} onChange={(v) => upd('color', v)} />
          </div>
        </Row>
        <Row label="Background">
          <div className="flex gap-1 items-center">
            <input
              type="color"
              value={element.backgroundColor === 'transparent' ? '#ffffff' : element.backgroundColor}
              onChange={(e) => upd('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <Input value={element.backgroundColor} onChange={(v) => upd('backgroundColor', v)} />
          </div>
        </Row>
      </div>

      <Row label="Border Radius (px)">
        <Input type="number" value={element.borderRadius} min={0} max={999} onChange={(v) => upd('borderRadius', Number(v))} />
      </Row>
    </div>
  );
}
