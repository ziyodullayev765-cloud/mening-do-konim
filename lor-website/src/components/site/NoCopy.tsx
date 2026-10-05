"use client";

import { useEffect } from "react";

const EDITABLE = "input, textarea, select, [contenteditable='true']";

/** Blocks copy/cut, the long-press/right-click menu and image dragging outside form fields. */
export function NoCopy() {
  useEffect(() => {
    const block = (e: Event) => {
      const target = e.target as Element | null;
      if (target?.closest?.(EDITABLE)) return;
      e.preventDefault();
    };
    const events = ["copy", "cut", "contextmenu", "dragstart"] as const;
    events.forEach((ev) => document.addEventListener(ev, block));
    return () => events.forEach((ev) => document.removeEventListener(ev, block));
  }, []);
  return null;
}
