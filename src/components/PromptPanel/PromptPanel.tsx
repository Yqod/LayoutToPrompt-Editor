import React, { useState, useCallback } from 'react'; // useState still used for tab/format/language/context
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from '../../store/useCanvasStore';
import { generatePrompt, OutputFormat, PromptLanguage } from '../../utils/promptGenerator';

type Tab = 'combined' | 'readable' | 'json';

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'html',     label: 'HTML/CSS' },
  { value: 'react',    label: 'React + Tailwind' },
  { value: 'vue',      label: 'Vue' },
  { value: 'tailwind', label: 'HTML + Tailwind' },
];

const LANGUAGE_OPTIONS: { value: PromptLanguage; flag: string; label: string }[] = [
  { value: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
  { value: 'fr', flag: '🇫🇷', label: 'Français' },
  { value: 'es', flag: '🇪🇸', label: 'Español' },
  { value: 'ru', flag: '🇷🇺', label: 'Русский' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-[#2a2a3e] text-gray-300 hover:bg-violet-600 hover:text-white border border-[#3a3a5c]'
      }`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

export default function PromptPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('combined');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('html');
  const [language, setLanguage] = useState<PromptLanguage>('de');
  const [userContext, setUserContext] = useState('');

  const { elements, canvasWidth, canvasHeight, responsive, addToExisting, promptOpen, togglePromptOpen } = useCanvasStore(useShallow((s) => ({
    elements:         s.elements,
    canvasWidth:      s.canvasWidth,
    canvasHeight:     s.canvasHeight,
    responsive:       s.responsive,
    addToExisting:    s.addToExisting,
    promptOpen:       s.promptOpen,
    togglePromptOpen: s.togglePromptOpen,
  })));

  const prompt = generatePrompt(
    { elements, selectedId: null, canvasWidth, canvasHeight },
    userContext,
    outputFormat,
    language,
    responsive,
    addToExisting
  );

  const activeContent: Record<Tab, string> = {
    combined: prompt.combined,
    readable: prompt.readable,
    json:     prompt.json,
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'combined', label: 'Combined' },
    { id: 'readable', label: 'Readable' },
    { id: 'json',     label: 'JSON' },
  ];

  return (
    <div className="border-t border-[#2a2a3e] bg-[#1e1e2e] shrink-0">
      {/* Collapse handle — minimal, just a thin drag target */}
      {promptOpen && (
        <button
          onClick={togglePromptOpen}
          className="w-full flex items-center justify-center py-1 text-gray-600 hover:text-gray-400 transition-colors group"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            className="group-hover:translate-y-0.5 transition-transform"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {/* Expanded panel */}
      {promptOpen && (
        <div className="px-4 pb-4 flex flex-col gap-3">

          {/* Controls row */}
          <div className="flex gap-3 items-end flex-wrap">

            {/* Output format */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                className="px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Language</label>
              <div className="flex gap-0.5 bg-[#0d0d1a] rounded-md p-0.5 border border-[#2a2a3e]">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    title={lang.label}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                      language === lang.value
                        ? 'bg-violet-600 text-white font-semibold'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a3e]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="hidden sm:inline">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="flex flex-col gap-1 flex-1 min-w-48">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Context (optional)
              </label>
              <input
                type="text"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="e.g. Landing page for a SaaS app"
                className="px-2 py-1.5 text-sm bg-[#2a2a3e] text-gray-100 border border-[#3a3a5c] rounded-md focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Tabs + copy */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a3e]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <CopyButton text={activeContent[activeTab]} />
          </div>

          {/* Output textarea */}
          <textarea
            readOnly
            value={activeContent[activeTab]}
            rows={8}
            className="w-full px-3 py-2 text-xs font-mono bg-[#0d0d1a] text-gray-300 border border-[#2a2a3e] rounded-lg focus:outline-none resize-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
