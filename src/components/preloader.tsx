"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useState } from "react";
import styles from "./preloader.module.css";

export type PreloaderItem = {
  label: string;
  url: string;
};

const FRAME_INTERVAL = 145;
const DURATION = 3200;

export function Preloader({ items }: { items: PreloaderItem[] }) {
  const reel = items.length
    ? items.slice(0, 8)
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
    };

    let frameTimer: number | undefined;
    const frameStartTimer = reducedMotion
      ? undefined
      : window.setTimeout(() => {
          frameTimer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % reel.length);
          }, FRAME_INTERVAL);
        }, 430);
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

  const activeItem = reel[activeIndex];

  return (
    <div className={styles.preloader} aria-hidden="true">
      <div className={styles.grain} />
      <div className={styles.swipeEdge} />

      <div className={styles.stage}>
        <div className={`${styles.sideCopy} ${styles.sideCopyLeft}`}>
          <span>Selected</span>
          <strong>Work</strong>
        </div>

        <div className={styles.reelWrap}>
          <div className={styles.reel}>
            {reel.map((item, index) => (
              <div
                className={`${styles.frame} ${index === activeIndex ? styles.activeFrame : ""}`}
                style={{ "--frame-rotation": `${(index - 3) * 0.35}deg` } as CSSProperties}
                key={`${item.url}-${index}`}
              >
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 82vw, 520px"
                  quality={75}
                  loading="eager"
                />
              </div>
            ))}
            <div className={styles.reelFlash} />
          </div>

          <div className={styles.reelMeta}>
            <span>{activeItem?.label || "Selected project"}</span>
            <span>{String(activeIndex + 1).padStart(2, "0")} / {String(reel.length).padStart(2, "0")}</span>
          </div>

          <div className={styles.progress}><span /></div>
        </div>

        <div className={`${styles.sideCopy} ${styles.sideCopyRight}`}>
          <span>Rahul</span>
          <strong>Ornob</strong>
        </div>
      </div>

      <div className={styles.cornerMeta}>
        <span>Design × Code</span>
        <span>Portfolio / 2026</span>
      </div>
    </div>
  );
}
