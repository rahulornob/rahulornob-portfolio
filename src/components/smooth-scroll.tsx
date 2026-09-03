"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      anchors: true,
      autoRaf: true,
      // Scrolling past the footer wraps seamlessly back to the top (and
      // vice versa from the very top) instead of stopping dead at the
      // page's edges. Lenis implements this by letting the animated
      // scroll value grow unbounded and applying it modulo the page's
      // scroll limit, so the wrap is a continuous motion, not a jump-cut
      // reset - and scrollTo() (anchor links included) already accounts
      // for it by taking whichever wrap direction is shorter.
      infinite: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
