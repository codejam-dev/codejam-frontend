'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import type { EditorSettings } from '@/types/playground.types';

export interface MobileSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
}

function SwitchToggle({
  pressed,
  onPressedChange,
  id,
  label,
}: {
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
  id: string;
  label: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={pressed}
      aria-label={label}
      onClick={() => onPressedChange(!pressed)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        pressed ? 'justify-end bg-violet-600' : 'justify-start bg-zinc-700'
      }`}
    >
      <span className="block h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}

export default function MobileSettingsSheet({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: MobileSettingsSheetProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const setFontSize = (next: number) => {
    const clamped = Math.min(24, Math.max(12, next));
    onSettingsChange({ ...settings, fontSize: clamped });
  };

  const setTabSize = (next: number) => {
    const clamped = Math.min(8, Math.max(2, next));
    onSettingsChange({ ...settings, tabSize: clamped });
  };

  const isDark = settings.theme === 'vs-dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[51] flex max-h-[70vh] flex-col rounded-t-2xl border-t border-zinc-700/60 bg-[#0d1117] shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-settings-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-zinc-600" aria-hidden />
            </div>

            <div className="flex items-center justify-between border-b border-zinc-700/50 px-4 pb-3 pt-1">
              <h2 id="mobile-settings-title" className="text-base font-semibold text-white">
                Editor Settings
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 pb-6 pt-4">
              <ul className="flex flex-col gap-5">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300">Font Size</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFontSize(settings.fontSize - 1)}
                      disabled={settings.fontSize <= 12}
                      className="rounded-lg border border-zinc-600 p-1.5 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-40"
                      aria-label="Decrease font size"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-mono text-white">
                      {settings.fontSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFontSize(settings.fontSize + 1)}
                      disabled={settings.fontSize >= 24}
                      className="rounded-lg border border-zinc-600 p-1.5 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-40"
                      aria-label="Increase font size"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </li>

                <li className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300">Tab Size</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTabSize(settings.tabSize - 1)}
                      disabled={settings.tabSize <= 2}
                      className="rounded-lg border border-zinc-600 p-1.5 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-40"
                      aria-label="Decrease tab size"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-mono text-white">
                      {settings.tabSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTabSize(settings.tabSize + 1)}
                      disabled={settings.tabSize >= 8}
                      className="rounded-lg border border-zinc-600 p-1.5 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-40"
                      aria-label="Increase tab size"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </li>

                <li className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300">Theme</span>
                  <div className="flex rounded-full bg-zinc-800 p-0.5">
                    <button
                      type="button"
                      onClick={() => onSettingsChange({ ...settings, theme: 'vs-dark' })}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        isDark ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => onSettingsChange({ ...settings, theme: 'vs-light' })}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        !isDark ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Light
                    </button>
                  </div>
                </li>

                <li className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300">Minimap</span>
                  <SwitchToggle
                    id="setting-minimap"
                    label="Toggle minimap"
                    pressed={settings.minimap}
                    onPressedChange={(minimap) => onSettingsChange({ ...settings, minimap })}
                  />
                </li>

                <li className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300">Line Numbers</span>
                  <SwitchToggle
                    id="setting-line-numbers"
                    label="Toggle line numbers"
                    pressed={settings.lineNumbers}
                    onPressedChange={(lineNumbers) =>
                      onSettingsChange({ ...settings, lineNumbers })
                    }
                  />
                </li>

                <li className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-300">Word Wrap</span>
                  <SwitchToggle
                    id="setting-word-wrap"
                    label="Toggle word wrap"
                    pressed={settings.wordWrap}
                    onPressedChange={(wordWrap) => onSettingsChange({ ...settings, wordWrap })}
                  />
                </li>
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
