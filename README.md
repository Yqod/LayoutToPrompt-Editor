# LayoutToPrompt Editor

> **Stop writing prompts. Start drawing them.**

Most AI tools go text → layout. LayoutToPrompt goes the other way: arrange elements visually on a canvas, configure every detail, and get a precise, structured LLM prompt — including a human-readable description and a full JSON spec. Paste it into Claude, ChatGPT, or any LLM and get working code back.

Built for developers and designers who think visually but don't want to spend hours crafting the perfect prompt.

---

## How it works

1. **Drag elements onto the canvas** — or click to add them directly from the sidebar
2. **Arrange and style everything** — positions, sizes, colors, typography, shadows, and more
3. **Hit "Generate Prompt"** — get a structured prompt with a readable description + JSON spec
4. **Paste into any LLM** — and get production-ready code back

```
Layout → Prompt → Code
```

---

## The generated prompt

Every prompt contains two parts combined:

**Readable description** — the LLM understands intent, feel, and layout structure

**JSON specification** — pixel-precise positions, sizes, colors, and every property for every element, including `position_label` (e.g. `"top-centered"`, `"bottom-right"`)

The prompt panel has three tabs — **Combined** (default), **Readable**, **JSON** — each with a one-click copy button.

---

## Features

### Canvas
- Simulated screen canvas — Desktop (1440×900), Tablet (768×1024), or Mobile (390×844)
- Freely position and resize elements with drag & drop
- 8-point resize handles on all sides and corners
- Smart snap guides — magnetic alignment to canvas center, element centers, and edges
- Grid overlay for visual orientation
- Click to select, Del to delete, Ctrl+Z / Ctrl+Y for undo/redo
- Auto-save to LocalStorage — layout survives reloads

### Elements

| Element | Configurable Properties |
|---|---|
| **Heading** | H1–H6 level, content, font family, size, weight, style (italic), transform (uppercase/capitalize/lowercase), decoration (underline/strikethrough/overline), alignment, letter spacing, line height, text color, background, border radius |
| **Paragraph** | Content, font family, size, weight, style, transform, decoration, alignment, letter spacing, line height, text color, background, border radius |
| **Button** | Content, font family, size, weight, style, transform, decoration, alignment, letter spacing, line height, text color, background, border radius |
| **Image** | Alt/placeholder description, object-fit (cover/contain/fill/none/scale-down), object-position (3×3 grid picker), shadow (none/sm/md/lg/xl/2xl), border width + color, border radius, grayscale filter |
| **Rectangle** | Fill color, border color, border width, border radius |
| **Circle** | Fill color, border color, border width |

All elements: x/y position, width, height, opacity (0–100%), z-index layer control

### Layers Panel
- Full layer list — all elements listed by z-index (highest on top, Figma-style)
- Drag to reorder layers — z-indices update automatically
- Double-click to rename any layer
- Toggle visibility (eye icon) — hidden elements are excluded from the canvas and prompt
- Lock elements (lock icon) — locked elements can't be moved or resized
- Per-layer delete button

### Prompt Generator
- **5 output languages:** Deutsch, English, Français, Español, Русский
- **4 code formats:** HTML/CSS, React + Tailwind, Vue, HTML + Tailwind
- **Responsive mode** — adds full breakpoint specification (sm/md/lg/xl/2xl) and responsive behavior instructions
- **Add to existing design mode** — instructs the LLM to match existing design systems, conventions, and components rather than starting from scratch
- Optional context field — describe the purpose of the page (e.g. "Landing page for a SaaS app")
- 3 output tabs: Combined (default), Readable, JSON
- One-click copy for each tab

### UX Details
- Click a sidebar element to add it instantly at a default position
- Drag a sidebar element onto the exact position on the canvas
- Hold 120ms + move 5px to initiate drag — prevents accidental drags on clicks
- Snap guides disappear instantly on mouse release
- Auto-numbered element names: "Heading 1", "Rectangle 2", etc.
- Preloader animation on first load

---

## Tech Stack

- **React 18** + **Vite**
- **TypeScript** — strict, no `any`
- **Tailwind CSS**
- **@dnd-kit** — drag & drop (canvas + layers panel)
- **Zustand** — state management with LocalStorage persistence
- **motion** — preloader animations
- No backend — runs entirely in the browser

---

## Getting started

```bash
git clone https://github.com/Yqod/LayoutToPrompt-Editor.git
cd LayoutToPrompt-Editor
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start building.

---

## Why this exists

Every other AI design tool asks you to describe what you want in words. But if you already knew how to describe it precisely, you wouldn't need the tool. LayoutToPrompt lets you show it instead — and handles the translation to code for you.

---

## License

MIT
