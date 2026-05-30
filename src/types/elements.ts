export type ElementType = 'heading' | 'paragraph' | 'button' | 'image' | 'rectangle' | 'circle';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'heading' | 'paragraph' | 'button';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '300' | '500' | '700' | '900';
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  borderRadius: number;
}

export interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'circle';
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  placeholder: string;
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
