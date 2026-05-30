# Visual-to-Prompt Builder

## Projektübersicht

Ein visueller Layout-Builder, der einen Bildschirm simuliert. Der Nutzer platziert Elemente per Drag & Drop auf einem Canvas – Texte, Überschriften, Bilder, Formen, Buttons – und konfiguriert deren Aussehen (Farbe, Schriftart, Schriftgröße, Position, Größe). Wenn das Layout fertig ist, generiert die App automatisch einen präzisen, strukturierten Prompt, den man direkt an Claude, ChatGPT oder ein anderes LLM weitergeben kann, um daraus fertigen Code zu bauen.

**Kerngedanke:** Nicht Text → Layout (wie andere Tools), sondern **Layout → Prompt → Code**. Für alle, die visuell denken, aber keinen Bock haben, stundenlang Prompts zu schreiben.

---

## Tech Stack

- **React** (Vite als Build Tool)
- **TypeScript**
- **Tailwind CSS** für Styling
- **@dnd-kit/core** + **@dnd-kit/sortable** für Drag & Drop
- **Zustand** für State Management
- **Keine Backend** – alles läuft im Browser, State wird im LocalStorage gespeichert

---

## Architektur

Die App besteht aus drei Hauptbereichen:

```
+------------------+-------------------------+------------------+
|                  |                         |                  |
|   LEFT SIDEBAR   |        CANVAS           |  RIGHT SIDEBAR   |
|   (Elemente)     |   (Bildschirm-Sim.)     |  (Properties)    |
|                  |                         |                  |
+------------------+-------------------------+------------------+
|                     BOTTOM BAR                               |
|              (Prompt generieren & anzeigen)                  |
+--------------------------------------------------------------+
```

### Left Sidebar
- Liste aller verfügbaren Element-Typen zum Rausziehen
- Heading, Paragraph, Image (Placeholder), Button, Rectangle, Circle

### Canvas
- Simuliert einen Bildschirm (standardmäßig 1440×900px, skaliert auf den Viewport)
- Elemente sind frei positionierbar (absolute positioning)
- Elemente können angeklickt, verschoben, in der Größe verändert werden
- Ausgewähltes Element wird highlighted

### Right Sidebar
- Zeigt die Properties des aktuell ausgewählten Elements
- Text, Farbe, Schriftart, Schriftgröße, Breite, Höhe, Border Radius, Opacity etc.

### Bottom Bar
- Button: **„Prompt generieren"**
- Gibt den fertigen Prompt in einem Textarea aus – ready to copy & paste

---

## Komponenten-Struktur

```
src/
├── App.tsx
├── store/
│   └── useCanvasStore.ts        # Zustand Store – alle Canvas-Elemente, Selection etc.
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx           # Der Haupt-Canvas
│   │   ├── CanvasElement.tsx    # Einzelnes Element auf dem Canvas
│   │   └── ResizeHandle.tsx     # Resize-Handle für Elemente
│   ├── Sidebar/
│   │   ├── LeftSidebar.tsx      # Element-Auswahl
│   │   ├── ElementItem.tsx      # Draggable Element in der Sidebar
│   │   └── RightSidebar.tsx     # Properties Panel
│   ├── Properties/
│   │   ├── TextProperties.tsx
│   │   ├── ShapeProperties.tsx
│   │   └── ImageProperties.tsx
│   └── PromptPanel/
│       └── PromptPanel.tsx      # Prompt generieren & anzeigen
├── types/
│   └── elements.ts              # TypeScript Types für alle Element-Typen
├── utils/
│   └── promptGenerator.ts       # HERZSTÜCK: Canvas → Prompt Logik
└── constants/
    └── defaults.ts              # Default-Werte für neue Elemente
```

---

## TypeScript Types

```typescript
// types/elements.ts

export type ElementType = 'heading' | 'paragraph' | 'button' | 'image' | 'rectangle' | 'circle';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;          // Position auf dem Canvas (px)
  y: number;
  width: number;
  height: number;
  opacity: number;    // 0–100
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'heading' | 'paragraph' | 'button';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '300' | '500' | '700' | '900';
  color: string;          // hex
  backgroundColor: string; // hex oder 'transparent'
  textAlign: 'left' | 'center' | 'right';
  borderRadius: number;
}

export interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'circle';
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;   // nur für rectangle
}

export interface ImageElement extends BaseElement {
  type: 'image';
  placeholder: string;    // Beschreibung des Bildes z.B. "Hero image of a mountain"
  borderRadius: number;
  objectFit: 'cover' | 'contain' | 'fill';
}

export type CanvasElement = TextElement | ShapeElement | ImageElement;

export interface CanvasState {
  elements: CanvasElement[];
  selectedId: string | null;
  canvasWidth: number;
  canvasHeight: number;
}
```

---

## Der Prompt-Generator (Herzstück)

Der Generator produziert **immer beides** – einen lesbaren Beschreibungsblock UND einen JSON-Dump. Das LLM bekommt damit den Kontext aus dem lesbaren Teil und die Präzision aus dem JSON.

```typescript
// utils/promptGenerator.ts

export interface GeneratedPrompt {
  readable: string;   // Für manuelles Copy-Paste in ChatGPT / Claude
  json: string;       // Roher JSON-Dump des Canvas-State
  combined: string;   // Beides kombiniert – der finale Prompt
}

export function generatePrompt(state: CanvasState, userContext: string = '', outputFormat: 'html' | 'react' | 'vue' | 'tailwind' = 'html'): GeneratedPrompt {

  // 1. LESBARER TEIL
  // Beispiel-Output readable:
  /*
  Du bist ein Web-Entwickler. Baue folgendes Layout als HTML/CSS.

  KONTEXT: [optionale User-Beschreibung, z.B. "Landing Page für eine SaaS App"]

  LAYOUT-BESCHREIBUNG:
  Eine Seite (1440×900px) mit einer zentrierten Überschrift im oberen Bereich,
  darunter ein großes Hero-Bild das die Mitte dominiert, und einem
  Call-to-Action Button unten mittig in kräftigem Lila.
  */

  // 2. JSON-DUMP
  // Exakte technische Spezifikation aller Elemente:
  /*
  TECHNISCHE SPEZIFIKATION (JSON):
  {
    "canvas": { "width": 1440, "height": 900 },
    "elements": [
      {
        "id": "el_1",
        "type": "heading",
        "content": "Willkommen bei unserer App",
        "x": 360, "y": 80,
        "width": 720, "height": 80,
        "fontSize": 48,
        "fontWeight": "bold",
        "fontFamily": "Inter",
        "color": "#1a1a2e",
        "backgroundColor": "transparent",
        "textAlign": "center",
        "position_label": "oben-zentriert"
      },
      {
        "id": "el_2",
        "type": "image",
        "placeholder": "Hero image of a mountain landscape",
        "x": 220, "y": 180,
        "width": 1000, "height": 400,
        "borderRadius": 16,
        "objectFit": "cover",
        "position_label": "mittig"
      },
      {
        "id": "el_3",
        "type": "button",
        "content": "Jetzt starten",
        "x": 580, "y": 720,
        "width": 280, "height": 56,
        "backgroundColor": "#6c63ff",
        "color": "#ffffff",
        "borderRadius": 28,
        "fontSize": 18,
        "fontWeight": "bold",
        "position_label": "unten-zentriert"
      }
    ]
  }
  */

  // 3. COMBINED = lesbarer Teil + JSON + Coding-Anweisung
  /*
  ...lesbarer Teil...
  ...JSON-Dump...

  ANWEISUNG:
  - Halte dich exakt an die Maße, Farben und Positionen aus der JSON-Spezifikation
  - Nutze die Layout-Beschreibung für den Gesamtkontext und das Gefühl
  - Setze das Layout in sauberem [HTML/CSS | React + Tailwind | Vue] um
  - Bilder als <img> mit passendem placeholder src
  - Kein externes CSS-Framework außer [gewähltes Format]
  */
}
```

### position_label Logik

Jedes Element bekommt automatisch ein `position_label` basierend auf seiner Position relativ zum Canvas:

| Position auf Canvas | Label |
|---|---|
| y < 33% | "oben" |
| y 33–66% | "mittig" |
| y > 66% | "unten" |
| x < 33% | "links" |
| x 33–66% | "zentriert" |
| x > 66% | "rechts" |

Kombiniert also z.B. "oben-zentriert", "mittig-links", "unten-rechts" etc.

### UI im PromptPanel

Das PromptPanel zeigt drei Tabs:
- **„Kombiniert"** – der fertige Prompt zum direkten Copy-Paste (default)
- **„Lesbar"** – nur die menschliche Beschreibung
- **„JSON"** – nur der rohe JSON-Dump

Außerdem:
- Dropdown: Output-Format wählen (HTML/CSS, React + Tailwind, Vue)
- Textfeld: optionaler Kontext-Input ("Wofür ist diese Seite?")
- Copy-Button für jeden Tab

---

## Features – Priorität

### Must Have (v1)
- [ ] Canvas mit simuliertem Bildschirm
- [ ] Elemente per Drag & Drop vom Sidebar auf Canvas ziehen
- [ ] Elemente auf dem Canvas verschieben (drag)
- [ ] Element anklicken → Properties in rechter Sidebar bearbeiten
- [ ] Elemente löschen (Entf-Taste oder Button)
- [ ] Prompt generieren Button → Prompt wird angezeigt und kann kopiert werden
- [ ] LocalStorage: Layout wird automatisch gespeichert

### Should Have (v2)
- [ ] Resize-Handles für Elemente
- [ ] Undo / Redo (Ctrl+Z / Ctrl+Y)
- [ ] Canvas-Größe wählbar (Desktop, Tablet, Mobile)
- [ ] Zindex / Ebenen-Reihenfolge ändern
- [ ] Code-Format wählbar (HTML/CSS, React, Vue, Tailwind)
- [ ] Layouts als JSON exportieren und importieren

### Nice to Have (v3)
- [ ] Direkt an Claude API schicken und Code-Output anzeigen
- [ ] Mehrere Seiten / Screens
- [ ] Templates (Landing Page, Blog, Dashboard etc.)
- [ ] Echtzeit-Preview des generierten Codes

---

## Entwicklungs-Reihenfolge

1. **Projekt aufsetzen** – Vite + React + TypeScript + Tailwind + dnd-kit + Zustand installieren
2. **Store aufsetzen** – `useCanvasStore.ts` mit allen State-Operationen
3. **Canvas bauen** – Leerer Canvas mit korrekten Dimensionen
4. **Erstes Element** – Heading-Element manuell auf Canvas platzieren und anzeigen
5. **Drag from Sidebar** – Elemente aus linker Sidebar auf Canvas ziehen
6. **Drag on Canvas** – Elemente auf dem Canvas verschieben
7. **Properties Panel** – Rechte Sidebar mit Edit-Feldern
8. **Alle Element-Typen** – Paragraph, Button, Image, Rectangle, Circle
9. **Prompt-Generator** – Die Kern-Logik bauen und testen
10. **UI Polish** – Alles schön machen
11. **LocalStorage** – State persistieren

---

## Wichtige Hinweise für Claude Code

- Immer TypeScript, keine `any` Types
- Komponenten klein halten, max. ~150 Zeilen pro File
- Zustand Store ist die Single Source of Truth – keine lokalen States für Canvas-Daten
- Der Prompt-Generator gibt immer **beides** aus: lesbaren Text UND JSON-Dump, kombiniert in einem finalen Prompt
- Das PromptPanel hat drei Tabs: Kombiniert (default), Lesbar, JSON – alle mit Copy-Button
- UX-Priorität: Der Canvas soll sich anfühlen wie ein echtes Design-Tool (Figma-ähnlich)
- Mobile-Unterstützung ist kein Muss für v1 – Desktop first
