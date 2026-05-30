import React from 'react';
import { ShapeElement } from '../../types/elements';
import { useCanvasStore } from '../../store/useCanvasStore';

interface Props {
  element: ShapeElement;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', min, max }: {
  value: string | number; onChange: (v: string) => void;
  type?: string; min?: number; max?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
    />
  );
}

export default function ShapeProperties({ element }: Props) {
  const update = useCanvasStore((s) => s.updateElement);
  const upd = (key: string, val: unknown) => update(element.id, { [key]: val } as Partial<ShapeElement>);

  return (
    <div className="flex flex-col gap-4">
      <Row label="Fill color">
        <div className="flex gap-1 items-center">
          <input
            type="color"
            value={element.backgroundColor}
            onChange={(e) => upd('backgroundColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
          />
          <Input value={element.backgroundColor} onChange={(v) => upd('backgroundColor', v)} />
        </div>
      </Row>

      <Row label="Border color">
        <div className="flex gap-1 items-center">
          <input
            type="color"
            value={element.borderColor}
            onChange={(e) => upd('borderColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
          />
          <Input value={element.borderColor} onChange={(v) => upd('borderColor', v)} />
        </div>
      </Row>

      <Row label="Border width (px)">
        <Input type="number" value={element.borderWidth} min={0} max={20} onChange={(v) => upd('borderWidth', Number(v))} />
      </Row>

      {element.type === 'rectangle' && (
        <Row label="Border Radius (px)">
          <Input type="number" value={element.borderRadius} min={0} max={999} onChange={(v) => upd('borderRadius', Number(v))} />
        </Row>
      )}
    </div>
  );
}
