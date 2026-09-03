"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      anchors: true,
      autoRaf: true,
      autoToggle: true,
      duration: 0.95,
      easing: (time) => 1 - Math.pow(1 - time, 4),
      overscroll: true,
      respectReducedMotion: true,
      smoothWheel: true,
      stopInertiaOnNavigate: true,
      syncTouch: false,
      wheelMultiplier: 1.1,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
