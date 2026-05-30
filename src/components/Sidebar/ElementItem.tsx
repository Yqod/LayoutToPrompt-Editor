import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ElementType } from '../../types/elements';

interface Props {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function ElementItem({ type, label, icon, onClick }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { type },
  });

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('elementType', type);
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-grab active:cursor-grabbing
        border border-gray-200 bg-white hover:bg-violet-50 hover:border-violet-300
        transition-all duration-150 select-none
        ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}
      `}
      title={`Add ${label}`}
    >
      <div className="text-gray-500 hover:text-violet-600 transition-colors">{icon}</div>
      <span className="text-[11px] text-gray-600 font-medium leading-none">{label}</span>
    </div>
  );
}
