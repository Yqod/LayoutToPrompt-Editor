import React, { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from './store/useCanvasStore';
import { ElementType } from './types/elements';
import { CANVAS_PRESETS } from './constants/defaults';
import LeftSidebar from './components/Sidebar/LeftSidebar';
import RightSidebar from './components/Sidebar/RightSidebar';
import Canvas from './components/Canvas/Canvas';
import PromptPanel from './components/PromptPanel/PromptPanel';
import Preloader from './components/react-bits/preloader';

const PRESET_ICONS: Record<string, React.ReactNode> = {
  desktop: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  tablet: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  mobile: (
    <svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
};

export default function App() {
  const { addElement, canvasPreset, setCanvasSize, promptOpen, togglePromptOpen, elements } = useCanvasStore(useShallow((s) => ({
    addElement:        s.addElement,
    canvasPreset:      s.canvasPreset,
    setCanvasSize:     s.setCanvasSize,
    promptOpen:        s.promptOpen,
    togglePromptOpen:  s.togglePromptOpen,
    elements:          s.elements,
  })));

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over?.id === 'canvas' && active.data.current?.type) {
        const type = active.data.current.type as ElementType;
        addElement(type, 200, 200);
      }
    },
    [addElement]
  );

  return (
    <Preloader
      loading={loading}
      variant="stairs"
      position="fixed"
      duration={1600}
      bgColor="#6c63ff"
      loadingText="Loading your experience"
      textClassName="!text-white"
      stairCount={10}
      stairsRevealFrom="left"
      stairsRevealDirection="up"
      zIndex={9999}
      className="h-screen"
    >
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-[#0d0d1a] overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Top bar */}
        <header className="flex items-center px-4 py-2 bg-[#1e1e2e] border-b border-[#2a2a3e] shrink-0 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">LayoutToText</span>
            <span className="text-[10px] text-gray-500 bg-[#2a2a3e] px-2 py-0.5 rounded-full hidden sm:block">
              Visual Prompt Builder
            </span>
          </div>

          {/* Canvas preset switcher — centred */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-0.5 bg-[#0d0d1a] rounded-lg p-0.5 border border-[#2a2a3e]">
              {CANVAS_PRESETS.map((preset) => {
                const isActive = canvasPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setCanvasSize(preset.id, preset.width, preset.height)}
                    title={`${preset.label} · ${preset.width}×${preset.height}px`}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                      ${isActive
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a3e]'
                      }
                    `}
                  >
                    {PRESET_ICONS[preset.id]}
                    <span>{preset.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-violet-200' : 'text-gray-600'}`}>
                      {preset.width}×{preset.height}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Prompt — primary CTA */}
          <button
            onClick={togglePromptOpen}
            disabled={elements.length === 0}
            className={`
              flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 shrink-0
              disabled:opacity-30 disabled:cursor-not-allowed
              ${promptOpen
                ? 'bg-violet-700 text-white ring-2 ring-violet-500/40'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 hover:scale-[1.02]'
              }
            `}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Prompt
          </button>
        </header>

        {/* Main area */}
        <div className="flex flex-1 min-h-0">
          <LeftSidebar />
          <Canvas />
          <RightSidebar />
        </div>

        {/* Bottom prompt panel */}
        <PromptPanel />
      </div>

      <DragOverlay>
        <div className="bg-violet-600/30 border-2 border-dashed border-violet-400 rounded-lg w-24 h-12 flex items-center justify-center text-xs text-violet-300 font-medium">
          Element
        </div>
      </DragOverlay>
    </DndContext>
    </Preloader>
  );
}
