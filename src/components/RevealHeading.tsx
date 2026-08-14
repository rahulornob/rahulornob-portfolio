"use client";

import type { CSSProperties, ElementType } from "react";
import { useEffect, useRef } from "react";
import styles from "./reveal-heading.module.css";

type RevealHeadingProps = {
  as?: "h2" | "h3" | "p" | "span";
  className?: string;
  delayIndex?: number;
  id?: string;
  lines: string[];
};

export default function RevealHeading({
  as = "h2",
  className = "",
  delayIndex = 0,
  id,
  lines,
}: RevealHeadingProps) {
  const headingRef = useRef<HTMLElement>(null);
  const Heading = as as ElementType;
  let wordIndex = 0;

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        heading.dataset.revealed = "true";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.2 },
    );

    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  return (
    <Heading
      ref={headingRef}
      id={id}
      className={`${styles.heading} ${className}`.trim()}
      style={{ "--reveal-delay": delayIndex } as CSSProperties}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, lineIndex) => (
        <span className={styles.line} aria-hidden="true" key={lineIndex}>
          {line.split(" ").map((word, index, words) => {
            const currentIndex = wordIndex++;

            return (
              <span key={`${word}-${index}`}>
                <span className={styles.clip}>
                  <span
                    className={styles.word}
                    style={
                      {
                        "--word-index": currentIndex,
                        "--total-index": `calc(var(--reveal-delay) + ${currentIndex})`,
                      } as CSSProperties
                    }
                  >
                    {word}
                  </span>
                </span>
                {index < words.length - 1 ? " " : null}
              </span>
            );
          })}
        </span>
      ))}
    </Heading>
  );
}
