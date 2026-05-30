import React from 'react';
import { TextElement } from '../../types/elements';
import { useCanvasStore } from '../../store/useCanvasStore';

interface Props {
  element: TextElement;
}

const FONTS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Verdana', 'Times New Roman', 'monospace'];

const WEIGHTS = [
  { value: '300',    label: 'Light'    },
  { value: 'normal', label: 'Regular'  },
  { value: '500',    label: 'Medium'   },
  { value: 'bold',   label: 'Bold'     },
  { value: '700',    label: '700'      },
  { value: '900',    label: 'Black'    },
] as const;

const LETTER_SPACING = [
  { value: 'tighter', label: 'Tighter', css: '-0.05em' },
  { value: 'tight',   label: 'Tight',   css: '-0.025em' },
  { value: 'normal',  label: 'Normal',  css: '0em' },
  { value: 'wide',    label: 'Wide',    css: '0.025em' },
  { value: 'wider',   label: 'Wider',   css: '0.05em' },
  { value: 'widest',  label: 'Widest',  css: '0.1em' },
] as const;

const LINE_HEIGHT = [
  { value: 'none',    label: 'None',    css: 1 },
  { value: 'tight',   label: 'Tight',   css: 1.25 },
  { value: 'snug',    label: 'Snug',    css: 1.375 },
  { value: 'normal',  label: 'Normal',  css: 1.5 },
  { value: 'relaxed', label: 'Relaxed', css: 1.625 },
  { value: 'loose',   label: 'Loose',   css: 2 },
] as const;

// ── shared micro-components ──────────────────────────────────────────────────

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

function ToggleGroup<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; title?: string }[];
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          title={opt.title}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
            value === opt.value
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'bg-[#2a2a3e] border-[#3a3a5c] text-gray-400 hover:border-violet-500 hover:text-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <Row label={label}>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
      />
    </Row>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const safeColor = value === 'transparent' ? '#ffffff' : value;
  return (
    <Row label={label}>
      <div className="flex gap-1 items-center">
        <input
          type="color"
          value={safeColor}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
        />
      </div>
    </Row>
  );
}

// ── main component ───────────────────────────────────────────────────────────

export default function TextProperties({ element }: Props) {
  const update = useCanvasStore((s) => s.updateElement);
  const upd = <K extends keyof TextElement>(key: K, val: TextElement[K]) =>
    update(element.id, { [key]: val } as Partial<TextElement>);

  const ls  = element.letterSpacing  ?? 'normal';
  const lh  = element.lineHeight     ?? 'normal';
  const td  = element.textDecoration ?? 'none';
  const tt  = element.textTransform  ?? 'none';
  const fs  = element.fontStyle      ?? 'normal';

  return (
    <div className="flex flex-col gap-4">

      {/* Content */}
      <Row label="Content">
        <textarea
          value={element.content}
          onChange={(e) => upd('content', e.target.value)}
          rows={3}
          className="w-full px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500 resize-none"
        />
      </Row>

      {/* Heading level */}
      {element.type === 'heading' && (
        <Row label="Heading level">
          <ToggleGroup
            value={String(element.hLevel ?? 1) as `${1|2|3|4|5|6}`}
            onChange={(v) => upd('hLevel', Number(v) as 1|2|3|4|5|6)}
            options={([1,2,3,4,5,6] as const).map((n) => ({ value: String(n) as `${typeof n}`, label: `H${n}` }))}
          />
        </Row>
      )}

      {/* Font family */}
      <Row label="Font">
        <Select value={element.fontFamily} onChange={(v) => upd('fontFamily', v)}>
          {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
        </Select>
      </Row>

      {/* Size + Weight */}
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Size (px)" value={element.fontSize} min={8} max={300} onChange={(v) => upd('fontSize', v)} />
        <Row label="Weight">
          <Select value={element.fontWeight} onChange={(v) => upd('fontWeight', v as TextElement['fontWeight'])}>
            {WEIGHTS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
          </Select>
        </Row>
      </div>

      {/* Font style (italic) */}
      <Row label="Style">
        <ToggleGroup
          value={fs}
          onChange={(v) => upd('fontStyle', v)}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'italic', label: <em>Italic</em>, title: 'Italic' },
          ]}
        />
      </Row>

      {/* Text transform */}
      <Row label="Transform">
        <ToggleGroup
          value={tt}
          onChange={(v) => upd('textTransform', v)}
          options={[
            { value: 'none',       label: '—',  title: 'None' },
            { value: 'capitalize', label: 'Aa', title: 'Capitalize' },
            { value: 'uppercase',  label: 'AA', title: 'Uppercase' },
            { value: 'lowercase',  label: 'aa', title: 'Lowercase' },
          ]}
        />
      </Row>

      {/* Text decoration */}
      <Row label="Decoration">
        <ToggleGroup
          value={td}
          onChange={(v) => upd('textDecoration', v)}
          options={[
            { value: 'none',         label: '—', title: 'None' },
            { value: 'underline',    label: <span style={{ textDecoration: 'underline' }}>U</span>,         title: 'Underline' },
            { value: 'line-through', label: <span style={{ textDecoration: 'line-through' }}>S</span>,      title: 'Strikethrough' },
            { value: 'overline',     label: <span style={{ textDecoration: 'overline' }}>O</span>,          title: 'Overline' },
          ]}
        />
      </Row>

      {/* Alignment */}
      <Row label="Alignment">
        <ToggleGroup
          value={element.textAlign}
          onChange={(v) => upd('textAlign', v)}
          options={[
            { value: 'left',   label: '⬛◻◻', title: 'Left' },
            { value: 'center', label: '◻⬛◻', title: 'Center' },
            { value: 'right',  label: '◻◻⬛', title: 'Right' },
          ]}
        />
      </Row>

      {/* Letter spacing */}
      <Row label="Letter spacing">
        <Select value={ls} onChange={(v) => upd('letterSpacing', v as TextElement['letterSpacing'])}>
          {LETTER_SPACING.map((o) => (
            <option key={o.value} value={o.value}>{o.label} ({o.css})</option>
          ))}
        </Select>
      </Row>

      {/* Line height */}
      <Row label="Line height">
        <Select value={lh} onChange={(v) => upd('lineHeight', v as TextElement['lineHeight'])}>
          {LINE_HEIGHT.map((o) => (
            <option key={o.value} value={o.value}>{o.label} ({o.css})</option>
          ))}
        </Select>
      </Row>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-2">
        <ColorRow label="Text color"  value={element.color}           onChange={(v) => upd('color', v)} />
        <ColorRow label="Background"  value={element.backgroundColor} onChange={(v) => upd('backgroundColor', v)} />
      </div>

      {/* Border radius */}
      <NumberInput label="Border radius (px)" value={element.borderRadius} min={0} max={999} onChange={(v) => upd('borderRadius', v)} />
    </div>
  );
}
