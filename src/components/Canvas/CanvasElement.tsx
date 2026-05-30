import React, { useCallback, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from '../../store/useCanvasStore';
import { CanvasElement as CanvasElementType, TextElement, ShapeElement, ImageElement } from '../../types/elements';
import ResizeHandle from './ResizeHandle';

interface Props {
  element: CanvasElementType;
  scale: number;
  onDragMove?: (x: number, y: number) => { x: number; y: number };
  onDragEnd?: () => void;
}

function ElementContent({ element }: { element: CanvasElementType }) {
  switch (element.type) {
    case 'heading':
    case 'paragraph':
    case 'button': {
      const t = element as TextElement;
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              t.textAlign === 'center' ? 'center' : t.textAlign === 'right' ? 'flex-end' : 'flex-start',
            padding: element.type === 'button' ? '0 16px' : '4px 8px',
            fontFamily: t.fontFamily,
            fontSize: t.fontSize,
            fontWeight: t.fontWeight,
            color: t.color,
            backgroundColor: t.backgroundColor === 'transparent' ? 'transparent' : t.backgroundColor,
            borderRadius: t.borderRadius,
            wordBreak: 'break-word',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {t.content}
        </div>
      );
    }
    case 'rectangle': {
      const s = element as ShapeElement;
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: s.backgroundColor,
            border: `${s.borderWidth}px solid ${s.borderColor}`,
            borderRadius: s.borderRadius,
            boxSizing: 'border-box',
          }}
        />
      );
    }
    case 'circle': {
      const s = element as ShapeElement;
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: s.backgroundColor,
            border: `${s.borderWidth}px solid ${s.borderColor}`,
            borderRadius: '50%',
            boxSizing: 'border-box',
          }}
        />
      );
    }
    case 'image': {
      const img = element as ImageElement;
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#e5e7eb',
            borderRadius: img.borderRadius,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxSizing: 'border-box',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', padding: '0 8px', lineHeight: 1.3 }}>
            {img.placeholder}
          </span>
        </div>
      );
    }
  }
}

export default function CanvasElement({ element, scale, onDragMove, onDragEnd }: Props) {
  const { selectedId, selectElement, moveElement } = useCanvasStore(useShallow((s) => ({
    selectedId: s.selectedId,
    selectElement: s.selectElement,
    moveElement: s.moveElement,
  })));

  const isSelected = selectedId === element.id;
  const dragStart = useRef<{ mouseX: number; mouseY: number; elX: number; elY: number } | null>(null);
  const isDragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).dataset.resize) return;
      e.stopPropagation();

      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        elX: element.x,
        elY: element.y,
      };
      isDragging.current = false;

      // Drag only activates after holding 120ms AND moving 5px — prevents accidental drags on clicks
      let dragReady = false;
      const activationTimer = setTimeout(() => { dragReady = true; }, 120);

      const onMove = (mv: MouseEvent) => {
        if (!dragStart.current || !dragReady) return;
        const dx = (mv.clientX - dragStart.current.mouseX) / scale;
        const dy = (mv.clientY - dragStart.current.mouseY) / scale;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          isDragging.current = true;
          const rawX = dragStart.current.elX + dx;
          const rawY = dragStart.current.elY + dy;
          const snapped = onDragMove ? onDragMove(rawX, rawY) : { x: rawX, y: rawY };
          moveElement(element.id, snapped.x, snapped.y);
        }
      };

      const onUp = () => {
        clearTimeout(activationTimer);
        if (!isDragging.current) {
          selectElement(element.id);
        } else {
          onDragEnd?.();
        }
        dragStart.current = null;
        isDragging.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [element, scale, moveElement, selectElement, onDragMove, onDragEnd]
  );

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
        opacity: element.opacity / 100,
        cursor: 'move',
        outline: isSelected ? '2px solid #6c63ff' : 'none',
        outlineOffset: 1,
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <ElementContent element={element} />
      {isSelected && <ResizeHandle element={element} scale={scale} />}
    </div>
  );
}
