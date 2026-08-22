"use client";

import Image from "next/image";
import type { AboutContent } from "@/cms/types";
import { useEffect, useRef, useState } from "react";
import RevealHeading from "./RevealHeading";
import styles from "./about.module.css";

const fallbackLogos = [
  { name: "Taskpin", src: "/logos/taskpin.svg", width: 86, height: 20 },
  {
    name: "VisionSpring",
    src: "/logos/visionspring.svg",
    width: 114,
    height: 24,
  },
  { name: "BIMA", src: "/logos/bima.svg", width: 105, height: 26 },
  {
    name: "Simply Real Market",
    src: "/logos/simplyrealmarket.svg",
    width: 70,
    height: 28,
  },
  {
    name: "Musemind",
    src: "/logos/musemind.svg",
    width: 108,
    height: 16,
  },
  {
    name: "Grameenphone",
    src: "/logos/grameenphone.svg",
    width: 120,
    height: 24,
  },
  { name: "Gofo", src: "/logos/gofo.svg", width: 69, height: 12 },
];

type Logo = {
  alt?: string;
  height: number;
  name: string;
  src: string;
  width: number;
};

function LogoSet({
  hidden = false,
  logos,
}: {
  hidden?: boolean;
  logos: Logo[];
}) {
  return (
    <div className={styles.logoSet} aria-hidden={hidden || undefined}>
      {logos.map((logo) => (
        <div className={styles.logo} key={logo.name} title={logo.name}>
          <Image
            src={logo.src}
            alt={hidden ? "" : logo.name}
            width={logo.width}
            height={logo.height}
          />
        </div>
      ))}
    </div>
  );
}

export function About({ content }: { content?: AboutContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const cmsLogos = content?.logos
    ?.filter((logo) => logo.url)
    .map((logo) => ({
      alt: logo.alt,
      height: logo.height ?? 24,
      name: logo.name,
      src: logo.url as string,
      width: logo.width ?? 100,
    }));
  const logos = cmsLogos?.length ? cmsLogos : fallbackLogos;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`${styles.about} ${isVisible ? styles.visible : ""}`}
      aria-labelledby="about-title"
    >
      <header className={styles.header}>
        <p className={`${styles.eyebrow} type-body-regular`}>
          {content?.eyebrow ?? "Why me"}
        </p>
        <RevealHeading
          id="about-title"
          className="type-heading-h2-medium"
          lines={[
            content?.heading ??
              "5+ years in, I’m faster at finding what matters, better at knowing what doesn’t, and still annoyingly picky about the details people actually notice.",
          ]}
        />
      </header>

      <div className={styles.marquee} aria-label="Selected client logos">
        <div className={styles.track}>
          <LogoSet logos={logos} />
          <LogoSet logos={logos} hidden />
        </div>
      </div>
    </section>
  );
}
