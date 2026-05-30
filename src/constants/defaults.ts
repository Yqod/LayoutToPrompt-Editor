import { TextElement, ShapeElement, ImageElement } from '../types/elements';

type WithoutId<T> = Omit<T, 'id'>;

export const DEFAULT_HEADING: WithoutId<TextElement> = {
  type: 'heading',
  x: 100,
  y: 80,
  width: 400,
  height: 60,
  opacity: 100,
  zIndex: 1,
  content: 'Überschrift',
  fontSize: 36,
  fontFamily: 'Inter',
  fontWeight: 'bold',
  color: '#1a1a2e',
  backgroundColor: 'transparent',
  textAlign: 'left',
  borderRadius: 0,
};

export const DEFAULT_PARAGRAPH: WithoutId<TextElement> = {
  type: 'paragraph',
  x: 100,
  y: 160,
  width: 400,
  height: 80,
  opacity: 100,
  zIndex: 1,
  content: 'Hier steht dein Text. Klicke zum Bearbeiten.',
  fontSize: 16,
  fontFamily: 'Inter',
  fontWeight: 'normal',
  color: '#374151',
  backgroundColor: 'transparent',
  textAlign: 'left',
  borderRadius: 0,
};

export const DEFAULT_BUTTON: WithoutId<TextElement> = {
  type: 'button',
  x: 100,
  y: 260,
  width: 180,
  height: 48,
  opacity: 100,
  zIndex: 1,
  content: 'Button',
  fontSize: 16,
  fontFamily: 'Inter',
  fontWeight: 'bold',
  color: '#ffffff',
  backgroundColor: '#6c63ff',
  textAlign: 'center',
  borderRadius: 8,
};

export const DEFAULT_RECTANGLE: WithoutId<ShapeElement> = {
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 200,
  height: 120,
  opacity: 100,
  zIndex: 1,
  backgroundColor: '#e5e7eb',
  borderColor: '#d1d5db',
  borderWidth: 1,
  borderRadius: 8,
};

export const DEFAULT_CIRCLE: WithoutId<ShapeElement> = {
  type: 'circle',
  x: 100,
  y: 100,
  width: 120,
  height: 120,
  opacity: 100,
  zIndex: 1,
  backgroundColor: '#e5e7eb',
  borderColor: '#d1d5db',
  borderWidth: 1,
  borderRadius: 60,
};

export const DEFAULT_IMAGE: WithoutId<ImageElement> = {
  type: 'image',
  x: 100,
  y: 100,
  width: 300,
  height: 200,
  opacity: 100,
  zIndex: 1,
  placeholder: 'Bild-Beschreibung',
  borderRadius: 8,
  objectFit: 'cover',
};

export const CANVAS_WIDTH = 1440;
export const CANVAS_HEIGHT = 900;

export const CANVAS_PRESETS = [
  { id: 'desktop', label: 'Desktop',  width: 1440, height: 900  },
  { id: 'tablet',  label: 'Tablet',   width: 768,  height: 1024 },
  { id: 'mobile',  label: 'Mobile',   width: 390,  height: 844  },
] as const;

export type CanvasPresetId = typeof CANVAS_PRESETS[number]['id'];
