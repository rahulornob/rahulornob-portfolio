"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./cursor.module.css";

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, summary';
// Regions that already run their own custom cursor (the project gallery's
// drag cue) opt out here so the two don't show on top of each other.
const HIDE_SELECTOR = "[data-cursor-hide]";
const ACTIVE_CLASS = "custom-cursor-active";
// Off for now by request - hovering a [data-cursor] element still grows
// the dot like any other interactive element, it just won't show its
// text label. Flip this back on to restore the labeled-pill behavior.
const SHOW_LABELS = false;

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  // Starts hidden so it doesn't flash at the top-left corner before the
  // first real pointer position arrives.
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Desktop only - on touch/coarse pointers there's no real cursor to
    // replace, so leave the platform default alone entirely. The element
    // itself always renders (see below) so this ref exists on mount; the
    // `(hover: none)` rule in cursor.module.css keeps it invisible there
    // even if this check somehow disagreed with the CSS media query.
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    const dot = dotRef.current;
    if (!dot) return;

    document.documentElement.classList.add(ACTIVE_CLASS);

    // hasPosition is distinct from the rAF loop having run at all - the
    // loop starts ticking immediately on mount, well before any real
    // pointer event necessarily arrives, so it can't double as "we know
    // where the pointer is" without racing the first move event.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      hasPosition: false,
      lastFrame: 0,
      raf: 0,
    };

    const placeImmediately = (clientX: number, clientY: number) => {
      motion.hasPosition = true;
      motion.x = clientX;
      motion.y = clientY;
      motion.targetX = clientX;
      motion.targetY = clientY;
      motion.lastFrame = 0;
      dot.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
    };

    const follow = (time: number) => {
      if (motion.hasPosition) {
        const elapsed = motion.lastFrame
          ? Math.min(time - motion.lastFrame, 32)
          : 16;
        const amount = reduceMotion ? 1 : 1 - Math.exp(-elapsed / 105);
        const dx = motion.targetX - motion.x;
        const dy = motion.targetY - motion.y;

        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          motion.x += dx * amount;
          motion.y += dy * amount;
          dot.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0) translate(-50%, -50%)`;
        }
      }

      motion.lastFrame = time;
      motion.raf = window.requestAnimationFrame(follow);
    };
    motion.raf = window.requestAnimationFrame(follow);

    const move = (event: PointerEvent) => {
      motion.targetX = event.clientX;
      motion.targetY = event.clientY;
      if (!motion.hasPosition) {
        placeImmediately(event.clientX, event.clientY);
        const target = event.target as HTMLElement | null;
        setHidden(Boolean(target?.closest(HIDE_SELECTOR)));
      }
    };

    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      setHidden(Boolean(target?.closest(HIDE_SELECTOR)));

      const labeled = SHOW_LABELS ? target?.closest<HTMLElement>("[data-cursor]") : null;
      if (labeled) {
        setLabel(labeled.dataset.cursor || null);
        setHovering(true);
        return;
      }
      setLabel(null);
      setHovering(Boolean(target?.closest(INTERACTIVE_SELECTOR) || target?.closest("[data-cursor]")));
    };

    const leaveWindow = () => {
      setHovering(false);
      setLabel(null);
      setHidden(true);
    };
    const enterWindow = (event: PointerEvent) => {
      placeImmediately(event.clientX, event.clientY);
      const target = document.elementFromPoint(event.clientX, event.clientY);
      setHidden(Boolean(target?.closest(HIDE_SELECTOR)));
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.addEventListener("pointerleave", leaveWindow);
    document.addEventListener("pointerenter", enterWindow);

    return () => {
      window.cancelAnimationFrame(motion.raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leaveWindow);
      document.removeEventListener("pointerenter", enterWindow);
      document.documentElement.classList.remove(ACTIVE_CLASS);
    };
  }, []);

  return (
    <div className={styles.cursor} data-custom-cursor aria-hidden="true">
      <div
        className={`${styles.dot} ${hovering ? styles.hovering : ""} ${label ? styles.labeled : ""} ${hidden ? styles.hidden : ""}`}
        ref={dotRef}
      >
        {label ? <span className={styles.label}>{label}</span> : null}
      </div>
    </div>
  );
}
