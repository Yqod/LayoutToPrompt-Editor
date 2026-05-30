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
  name: string;
  visible: boolean;
  locked: boolean;
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
  hLevel?: 1 | 2 | 3 | 4 | 5 | 6;                            // heading only
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
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
  objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  borderWidth: number;
  borderColor: string;
  grayscale: boolean;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement;

export interface CanvasState {
  elements: CanvasElement[];
  selectedId: string | null;
  canvasWidth: number;
  canvasHeight: number;
}
