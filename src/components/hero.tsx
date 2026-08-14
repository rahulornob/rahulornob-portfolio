import Image from "next/image";
import { Navigation } from "@/components/navigation";
import type { HeroContent } from "@/sanity/types";
import ButtonSwooshContent from "./ButtonSwooshContent";
import Magnet from "./Magnet";
import styles from "./hero.module.css";

export function Hero({ content }: { content?: HeroContent }) {
  const headline =
    content?.headline ?? "Making the internet slightly less annoying.";
  const intro =
    content?.intro ??
    "Designing for the web, building when needed, and using AI to move faster without letting it make the creative decisions.";
  const ctaLabel = content?.ctaLabel ?? "Start project";

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <Image
        className={styles.background}
        src={content?.backgroundImage?.url ?? "/images/hero.png"}
        alt={content?.backgroundImage?.alt ?? ""}
        fill
        sizes="100vw"
        preload
      />

      <Navigation />

      <div className={styles.content}>
        <div className={styles.copy}>
          <h1 id="hero-title" className="type-heading-h1-medium">
            {headline}
          </h1>
          <p className="type-body-medium-regular">
            {intro}
          </p>
        </div>

        <Magnet
          padding={50}
          disabled={false}
          magnetStrength={10}
          activeTransition="transform 280ms cubic-bezier(0.16, 1, 0.3, 1)"
          inactiveTransition="transform 850ms cubic-bezier(0.16, 1, 0.3, 1)"
        >
          <a
            className={`${styles.cta} type-button-semibold button-swoosh`}
            href="#contact"
          >
            <ButtonSwooshContent text={ctaLabel} />
          </a>
        </Magnet>
      </div>
    </section>
  );
}
