import React from 'react';
import { ImageElement } from '../../types/elements';
import { useCanvasStore } from '../../store/useCanvasStore';

interface Props {
  element: ImageElement;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

export default function ImageProperties({ element }: Props) {
  const update = useCanvasStore((s) => s.updateElement);
  const upd = (key: string, val: unknown) => update(element.id, { [key]: val } as Partial<ImageElement>);

  return (
    <div className="flex flex-col gap-4">
      <Row label="Description">
        <textarea
          value={element.placeholder}
          onChange={(e) => upd('placeholder', e.target.value)}
          rows={3}
          placeholder="e.g. Hero image of a mountain landscape"
          className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500 resize-none"
        />
        <p className="text-[10px] text-gray-500">This description is used as the alt text in the generated prompt.</p>
      </Row>

      <Row label="Object Fit">
        <select
          value={element.objectFit}
          onChange={(e) => upd('objectFit', e.target.value)}
          className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </Row>

      <Row label="Border Radius (px)">
        <input
          type="number"
          value={element.borderRadius}
          min={0}
          max={999}
          onChange={(e) => upd('borderRadius', Number(e.target.value))}
          className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
        />
      </Row>
    </div>
  );
}
