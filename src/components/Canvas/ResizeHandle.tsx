import React, { useCallback } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { CanvasElement } from '../../types/elements';

type HandlePosition = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

interface Props {
  element: CanvasElement;
  scale: number;
}

const HANDLE_SIZE = 8;

const handles: { pos: HandlePosition; style: React.CSSProperties }[] = [
  { pos: 'nw', style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nw-resize' } },
  { pos: 'n', style: { top: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
  { pos: 'ne', style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'ne-resize' } },
  { pos: 'e', style: { top: '50%', right: -HANDLE_SIZE / 2, transform: 'translateY(-50%)', cursor: 'e-resize' } },
  { pos: 'se', style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'se-resize' } },
  { pos: 's', style: { bottom: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
  { pos: 'sw', style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'sw-resize' } },
  { pos: 'w', style: { top: '50%', left: -HANDLE_SIZE / 2, transform: 'translateY(-50%)', cursor: 'w-resize' } },
];

export default function ResizeHandle({ element, scale }: Props) {
  const resizeElement = useCanvasStore((s) => s.resizeElement);

  const onMouseDown = useCallback(
    (e: React.MouseEvent, pos: HandlePosition) => {
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = element.width;
      const startH = element.height;
      const startElX = element.x;
      const startElY = element.y;

      const onMove = (mv: MouseEvent) => {
        const dx = (mv.clientX - startX) / scale;
        const dy = (mv.clientY - startY) / scale;

        let newW = startW;
        let newH = startH;
        let newX = startElX;
        let newY = startElY;

        if (pos.includes('e')) newW = startW + dx;
        if (pos.includes('s')) newH = startH + dy;
        if (pos.includes('w')) { newW = startW - dx; newX = startElX + dx; }
        if (pos.includes('n')) { newH = startH - dy; newY = startElY + dy; }

        resizeElement(element.id, Math.max(20, newW), Math.max(20, newH), newX, newY);
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [element, scale, resizeElement]
  );

  return (
    <>
      {handles.map(({ pos, style }) => (
        <div
          key={pos}
          onMouseDown={(e) => onMouseDown(e, pos)}
          style={{
            position: 'absolute',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: '#6c63ff',
            border: '1.5px solid #fff',
            borderRadius: 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            zIndex: 9999,
            ...style,
          }}
        />
      ))}
    </>
  );
}
