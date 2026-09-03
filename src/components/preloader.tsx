"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./preloader.module.css";

export type PreloaderItem = {
  label: string;
  url: string;
  width?: number;
  height?: number;
};

// Ten rapid hard cuts fit inside the existing three-second loader. Every
// image is mounted up front so the switch itself never waits on loading.
const MAX_REEL_ITEMS = 10;
const FRAME_INTERVAL = 140;
const ENTRANCE_DELAY = 350;
const DURATION = 3000;

// Show up to ten images, sampled evenly when a larger custom reel is used.
function pickDisplayReel(reel: PreloaderItem[]): PreloaderItem[] {
  const want = Math.min(MAX_REEL_ITEMS, reel.length);
  if (reel.length <= want) return reel;
  return Array.from({ length: want }, (_, i) => reel[Math.floor((i * reel.length) / want)]);
}

export function Preloader({
  items,
  leftLabel = "rahulornob",
  rightLabel = "design engineer",
}: {
  items: PreloaderItem[];
  leftLabel?: string;
  rightLabel?: string;
}) {
  const reel = items.length
    ? pickDisplayReel(items)
    : [{ label: "Portfolio", url: "/images/hero.png" }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 700 : DURATION;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const finish = () => {
      document.body.style.overflow = previousOverflow;
      setVisible(false);
      // Global, unscoped marker (not a CSS-module class) so any component -
      // the hero content in particular - can gate its own entrance
      // transition on the preloader actually being gone, instead of
      // guessing a delay that has to be kept in sync with this timeline.
      document.documentElement.classList.add("preloader-done");
    };

    let frameTimer: number | undefined;
    const frameStartTimer = reducedMotion || reel.length <= 1
      ? undefined
      : window.setTimeout(() => {
          frameTimer = window.setInterval(() => {
            setActiveIndex((current) => {
              const next = current + 1;
              // Hold on the last image instead of looping back to the
              // first - the sequence is meant to finish, not cycle.
              if (next >= reel.length - 1 && frameTimer) {
                window.clearInterval(frameTimer);
              }
              return Math.min(next, reel.length - 1);
            });
          }, FRAME_INTERVAL);
        }, ENTRANCE_DELAY);
    const closeTimer = window.setTimeout(finish, duration);
    const skip = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };

    window.addEventListener("keydown", skip);
    return () => {
      if (frameTimer) window.clearInterval(frameTimer);
      if (frameStartTimer) window.clearTimeout(frameStartTimer);
      window.clearTimeout(closeTimer);
      window.removeEventListener("keydown", skip);
      document.body.style.overflow = previousOverflow;
    };
  }, [reel.length]);

  if (!visible) return null;

  return (
    <div className={styles.preloader} aria-hidden="true">
      <div className={styles.stage}>
        <div className={`${styles.sideCopy} ${styles.sideCopyLeft}`}>
          <span>{leftLabel}</span>
        </div>

        <div className={styles.reelWrap}>
          {reel.map((item, index) => {
            const ratio = item.width && item.height ? item.width / item.height : 2;
            const isActive = index === activeIndex;

            return (
              <div
                className={styles.tile}
                data-active={isActive ? "true" : undefined}
                aria-hidden={!isActive}
                key={item.url}
              >
                <div className={styles.tileFrame} style={{ aspectRatio: ratio }}>
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 82vw, 350px"
                    quality={75}
                    loading="eager"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className={`${styles.sideCopy} ${styles.sideCopyRight}`}>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}
