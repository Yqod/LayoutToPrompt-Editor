import React from 'react';
import { ImageElement } from '../../types/elements';
import { useCanvasStore } from '../../store/useCanvasStore';

interface Props {
  element: ImageElement;
}

// ── shared micro-components (same pattern as TextProperties) ─────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
    >
      {children}
    </select>
  );
}

function Btn({ active, onClick, children, title }: {
  active: boolean; onClick: () => void; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
        active
          ? 'bg-violet-600 border-violet-600 text-white'
          : 'bg-[#2a2a3e] border-[#3a3a5c] text-gray-400 hover:border-violet-500 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function ImageProperties({ element }: Props) {
  const update = useCanvasStore((s) => s.updateElement);
  const upd = <K extends keyof ImageElement>(key: K, val: ImageElement[K]) =>
    update(element.id, { [key]: val } as Partial<ImageElement>);

  const pos      = element.objectPosition ?? 'center';
  const shadow   = element.shadow         ?? 'none';
  const bw       = element.borderWidth    ?? 0;
  const bc       = element.borderColor    ?? '#d1d5db';
  const gs       = element.grayscale      ?? false;

  // 3×3 position grid entries
  const POSITIONS: { value: ImageElement['objectPosition']; label: string }[] = [
    { value: 'top-left',     label: '↖' }, { value: 'top',    label: '↑' }, { value: 'top-right',    label: '↗' },
    { value: 'left',         label: '←' }, { value: 'center', label: '✦' }, { value: 'right',        label: '→' },
    { value: 'bottom-left',  label: '↙' }, { value: 'bottom', label: '↓' }, { value: 'bottom-right', label: '↘' },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* Description */}
      <Row label="Description">
        <textarea
          value={element.placeholder}
          onChange={(e) => upd('placeholder', e.target.value)}
          rows={3}
          placeholder="e.g. Hero image of a mountain landscape"
          className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500 resize-none"
        />
        <p className="text-[10px] text-gray-500">Used as alt text in the generated prompt.</p>
      </Row>

      {/* Object Fit */}
      <Row label="Object fit">
        <Select value={element.objectFit} onChange={(v) => upd('objectFit', v as ImageElement['objectFit'])}>
          <option value="cover">cover</option>
          <option value="contain">contain</option>
          <option value="fill">fill</option>
          <option value="none">none</option>
          <option value="scale-down">scale-down</option>
        </Select>
      </Row>

      {/* Object Position — 3×3 grid */}
      <Row label="Object position">
        <div className="grid grid-cols-3 gap-1">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              title={p.value}
              onClick={() => upd('objectPosition', p.value)}
              className={`py-1.5 text-sm rounded-md border transition-colors ${
                pos === p.value
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-[#2a2a3e] border-[#3a3a5c] text-gray-400 hover:border-violet-500 hover:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Row>

      {/* Shadow */}
      <Row label="Shadow">
        <div className="flex gap-1">
          {(['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
            <Btn key={s} active={shadow === s} onClick={() => upd('shadow', s)}>{s}</Btn>
          ))}
        </div>
      </Row>

      {/* Border */}
      <div className="grid grid-cols-2 gap-2">
        <Row label="Border width (px)">
          <input
            type="number"
            value={bw}
            min={0}
            max={16}
            onChange={(e) => upd('borderWidth', Number(e.target.value))}
            className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
          />
        </Row>
        <Row label="Border color">
          <div className="flex gap-1 items-center">
            <input
              type="color"
              value={bc}
              onChange={(e) => upd('borderColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
            />
            <input
              type="text"
              value={bc}
              onChange={(e) => upd('borderColor', e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
            />
          </div>
        </Row>
      </div>

      {/* Border Radius */}
      <Row label="Border radius (px)">
        <input
          type="number"
          value={element.borderRadius}
          min={0}
          max={999}
          onChange={(e) => upd('borderRadius', Number(e.target.value))}
          className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
        />
      </Row>

      {/* Filters */}
      <Row label="Filters">
        <div className="flex gap-1">
          <Btn active={!gs} onClick={() => upd('grayscale', false)} title="Color">Color</Btn>
          <Btn active={gs}  onClick={() => upd('grayscale', true)}  title="Grayscale">Grayscale</Btn>
        </div>
      </Row>

    </div>
  );
}
