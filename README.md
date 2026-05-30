# promptcanvas

> **Stop writing prompts. Start drawing them.**

Most AI tools go from text → layout. promptcanvas goes the other way: you arrange elements visually on a canvas, and the app generates a precise, ready-to-use LLM prompt for you — including a human-readable description and a full JSON spec.

Built for developers and designers who think visually but don't want to spend hours crafting the perfect prompt.

---

## How it works

1. **Drag elements onto the canvas** — headings, paragraphs, buttons, images, shapes
2. **Arrange and style them** — set colors, fonts, sizes, positions, border radius, opacity
3. **Hit "Generate Prompt"** — get a structured prompt with both a readable description and a JSON spec
4. **Paste into Claude, ChatGPT, or any LLM** — and get working code back

```
Layout → Prompt → Code
```

---

## The generated prompt

Every prompt contains two parts combined into one:

**Readable description** — so the LLM understands the intent and overall feel of the layout

**JSON specification** — pixel-precise positions, sizes, colors, and properties for every element

```
Du bist ein Web-Entwickler. Baue folgendes Layout als React + Tailwind.

LAYOUT-BESCHREIBUNG:
Eine Seite (1440×900px) mit einer zentrierten Überschrift oben,
einem Hero-Bild in der Mitte und einem grünen CTA-Button unten rechts.

TECHNISCHE SPEZIFIKATION (JSON):
{
  "canvas": { "width": 1440, "height": 900 },
  "elements": [
    {
      "type": "heading",
      "content": "Willkommen",
      "x": 420, "y": 80,
      "width": 600, "height": 100,
      "fontSize": 48,
      "color": "#1a1a2e",
      "position_label": "oben-zentriert"
    },
    ...
  ]
}

ANWEISUNG:
- Halte dich exakt an die JSON-Spezifikation für alle Maße und Farben
- Setze das Layout in sauberem React + Tailwind um
```

The prompt panel has three tabs — **Combined** (default), **Readable**, **JSON** — each with a copy button.

---

## Features

### v1 — Core
- [x] Canvas that simulates a 1440×900px screen
- [x] Drag elements from sidebar onto canvas
- [x] Move elements freely on the canvas
- [x] Click element → edit properties in right sidebar
- [x] Delete elements (Del key or button)
- [x] Generate prompt → copy to clipboard
- [x] Auto-save layout to LocalStorage

### v2 — Polish
- [ ] Resize handles for elements
- [ ] Undo / Redo (Ctrl+Z / Ctrl+Y)
- [ ] Canvas size presets (Desktop, Tablet, Mobile)
- [ ] Z-index / layer order control
- [ ] Output format selector (HTML/CSS, React + Tailwind, Vue)
- [ ] Export / import layouts as JSON

### v3 — Power features
- [ ] Send prompt directly to Claude API and preview the output code
- [ ] Multiple pages / screens
- [ ] Templates (Landing Page, Blog, Dashboard, etc.)
- [ ] Live code preview

---

## Elements

| Element | Properties |
|---|---|
| Heading | text, font size, font family, font weight, color, background, text align, border radius |
| Paragraph | text, font size, font family, font weight, color, background, text align |
| Button | text, font size, color, background color, border radius |
| Image | placeholder description, border radius, object fit |
| Rectangle | background color, border color, border width, border radius |
| Circle | background color, border color, border width |

---

## Tech Stack

- **React** + **Vite**
- **TypeScript**
- **Tailwind CSS**
- **@dnd-kit** for drag & drop
- **Zustand** for state management
- No backend — runs entirely in the browser

---

## Getting started

```bash
git clone https://github.com/yourusername/promptcanvas.git
cd promptcanvas
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start building.

---

## Why this exists

Every other AI design tool asks you to describe what you want in words. But if you already knew how to describe it precisely, you wouldn't need the tool. promptcanvas lets you show it instead — and handles the translation for you.

---

## License

MIT
