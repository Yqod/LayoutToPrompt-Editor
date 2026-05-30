import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CanvasElement, ElementType } from '../types/elements';
import {
  DEFAULT_HEADING,
  DEFAULT_PARAGRAPH,
  DEFAULT_BUTTON,
  DEFAULT_RECTANGLE,
  DEFAULT_CIRCLE,
  DEFAULT_IMAGE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CanvasPresetId,
} from '../constants/defaults';

interface CanvasStore {
  elements: CanvasElement[];
  selectedId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  canvasPreset: CanvasPresetId;
  history: CanvasElement[][];
  historyIndex: number;

  addElement: (type: ElementType, x?: number, y?: number) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number, x?: number, y?: number) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  setCanvasSize: (preset: CanvasPresetId, width: number, height: number) => void;
  // Layers panel actions
  renameElement: (id: string, name: string) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  reorderLayers: (orderedIds: string[]) => void;
}

const TYPE_NAMES: Record<ElementType, string> = {
  heading:   'Heading',
  paragraph: 'Paragraph',
  button:    'Button',
  image:     'Image',
  rectangle: 'Rectangle',
  circle:    'Circle',
};

let idCounter = 1;
function genId() {
  return `el_${Date.now()}_${idCounter++}`;
}

function makeDefault(type: ElementType, x: number, y: number, name: string): CanvasElement {
  const id = genId();
  const base = { id, x, y, name, visible: true, locked: false };
  switch (type) {
    case 'heading':   return { ...DEFAULT_HEADING,   ...base };
    case 'paragraph': return { ...DEFAULT_PARAGRAPH, ...base };
    case 'button':    return { ...DEFAULT_BUTTON,    ...base };
    case 'rectangle': return { ...DEFAULT_RECTANGLE, ...base };
    case 'circle':    return { ...DEFAULT_CIRCLE,    ...base };
    case 'image':     return { ...DEFAULT_IMAGE,     ...base };
  }
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      elements: [],
      selectedId: null,
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      canvasPreset: 'desktop' as CanvasPresetId,
      history: [[]],
      historyIndex: 0,

      addElement: (type, x = 100, y = 100) => {
        set((state) => {
          const count = state.elements.filter((e) => e.type === type).length + 1;
          const name = `${TYPE_NAMES[type]} ${count}`;
          const newEl = makeDefault(type, x, y, name);
          const maxZ = state.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
          const el = { ...newEl, zIndex: maxZ + 1 };
          const newElements = [...state.elements, el];
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(newElements);
          return {
            elements: newElements,
            selectedId: el.id,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      updateElement: (id, updates) => {
        set((state) => {
          const newElements = state.elements.map((el) =>
            el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
          );
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(newElements);
          return { elements: newElements, history: newHistory, historyIndex: newHistory.length - 1 };
        });
      },

      deleteElement: (id) => {
        set((state) => {
          const newElements = state.elements.filter((el) => el.id !== id);
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(newElements);
          return {
            elements: newElements,
            selectedId: state.selectedId === id ? null : state.selectedId,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      selectElement: (id) => set({ selectedId: id }),

      moveElement: (id, x, y) => {
        set((state) => ({
          elements: state.elements.map((el) => el.id === id ? { ...el, x, y } : el),
        }));
      },

      resizeElement: (id, width, height, x, y) => {
        set((state) => ({
          elements: state.elements.map((el) => {
            if (el.id !== id) return el;
            return {
              ...el,
              width: Math.max(20, width),
              height: Math.max(20, height),
              ...(x !== undefined ? { x } : {}),
              ...(y !== undefined ? { y } : {}),
            };
          }),
        }));
      },

      bringForward: (id) => {
        set((state) => {
          const el = state.elements.find((e) => e.id === id);
          if (!el) return state;
          const above = state.elements.filter((e) => e.zIndex > el.zIndex);
          if (above.length === 0) return state;
          const nextZ = Math.min(...above.map((e) => e.zIndex));
          const target = state.elements.find((e) => e.zIndex === nextZ);
          return {
            elements: state.elements.map((e) => {
              if (e.id === id) return { ...e, zIndex: nextZ };
              if (target && e.id === target.id) return { ...e, zIndex: el.zIndex };
              return e;
            }),
          };
        });
      },

      sendBackward: (id) => {
        set((state) => {
          const el = state.elements.find((e) => e.id === id);
          if (!el) return state;
          const below = state.elements.filter((e) => e.zIndex < el.zIndex);
          if (below.length === 0) return state;
          const prevZ = Math.max(...below.map((e) => e.zIndex));
          const target = state.elements.find((e) => e.zIndex === prevZ);
          return {
            elements: state.elements.map((e) => {
              if (e.id === id) return { ...e, zIndex: prevZ };
              if (target && e.id === target.id) return { ...e, zIndex: el.zIndex };
              return e;
            }),
          };
        });
      },

      undo: () => {
        const { historyIndex, history } = get();
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        set({ elements: history[newIndex], historyIndex: newIndex, selectedId: null });
      },

      redo: () => {
        const { historyIndex, history } = get();
        if (historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        set({ elements: history[newIndex], historyIndex: newIndex, selectedId: null });
      },

      clearCanvas: () => {
        set({ elements: [], selectedId: null, history: [[]], historyIndex: 0 });
      },

      setCanvasSize: (preset, width, height) => {
        set({ canvasPreset: preset, canvasWidth: width, canvasHeight: height, selectedId: null });
      },

      renameElement: (id, name) => {
        set((state) => ({
          elements: state.elements.map((el) => el.id === id ? { ...el, name } : el),
        }));
      },

      toggleVisibility: (id) => {
        set((state) => ({
          elements: state.elements.map((el) => el.id === id ? { ...el, visible: !el.visible } : el),
        }));
      },

      toggleLock: (id) => {
        set((state) => ({
          elements: state.elements.map((el) => el.id === id ? { ...el, locked: !el.locked } : el),
        }));
      },

      // orderedIds: top layer first (highest z-index)
      reorderLayers: (orderedIds) => {
        set((state) => ({
          elements: state.elements.map((el) => {
            const idx = orderedIds.indexOf(el.id);
            if (idx === -1) return el;
            return { ...el, zIndex: orderedIds.length - idx };
          }),
        }));
      },
    }),
    {
      name: 'layout-to-text-canvas',
      partialize: (state) => ({
        elements: state.elements,
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        canvasPreset: state.canvasPreset,
      }),
    }
  )
);
