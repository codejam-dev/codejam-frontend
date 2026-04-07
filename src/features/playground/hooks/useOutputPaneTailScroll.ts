'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * When `tailEnabled`, keeps a scroll container pinned to the bottom as content grows
 * (streaming stdout lines, console messages, static pre updates).
 */
export function useOutputPaneTailScroll(
  scrollRef: RefObject<HTMLElement | null>,
  tailEnabled: boolean,
  /** Bumps when layout/content source changes so we re-sync and re-attach observers. */
  resyncToken: string
) {
  const tailRef = useRef(tailEnabled);
  tailRef.current = tailEnabled;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !tailRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [scrollRef, tailEnabled, resyncToken]);

  useEffect(() => {
    if (!tailEnabled) return;
    const root = scrollRef.current;
    if (!root) return;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el || !tailRef.current) return;
        el.scrollTop = el.scrollHeight;
      });
    };

    const mo = new MutationObserver(schedule);
    mo.observe(root, { childList: true, subtree: true, characterData: true });

    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    for (const child of root.children) {
      ro.observe(child);
    }

    schedule();

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      ro.disconnect();
    };
  }, [scrollRef, tailEnabled, resyncToken]);
}
