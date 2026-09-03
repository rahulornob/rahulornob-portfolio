import Image from "next/image";
import { Navigation, type NavItem, type SocialLink } from "@/components/navigation";
import { DitherCursorTrail } from "@/components/dither-cursor-trail";
import type { AboutContent, HeroContent } from "@/cms/types";
import styles from "./hero.module.css";

type Logo = {
  alt?: string;
  height: number;
  name: string;
  src: string;
  width: number;
};

// Dark-on-light variants of the About section's client logos - that
// section sits on a dark background and uses white cutout marks, which
// disappear against this section's white background, so the brand row
// here gets its own exports of the same seven logos.
const fallbackLogos: Logo[] = [
  { name: "Taskpin", src: "/logos/taskpin-dark.svg", width: 150, height: 72 },
  {
    name: "VisionSpring",
    src: "/logos/visionspring-dark.svg",
    width: 178,
    height: 72,
  },
  { name: "BIMA", src: "/logos/bima-dark.svg", width: 169, height: 72 },
  {
    name: "Simply Real Market",
    src: "/logos/simplyrealmarket-dark.svg",
    width: 134,
    height: 72,
  },
  { name: "Musemind", src: "/logos/musemind-dark.svg", width: 172, height: 72 },
  {
    name: "Grameenphone",
    src: "/logos/grameenphone-dark.svg",
    width: 183,
    height: 72,
  },
  { name: "Gofo", src: "/logos/gofo-dark.svg", width: 133, height: 72 },
];

const fallbackBio = [
  "I’m a visual-first designer with 5+ years of experience across web, product, telecom, healthcare, finance, and social impact. I care about sharp interfaces, strong visual direction, and making digital work feel polished without making it harder to use.",
  "I’ve spent the last few years moving between client work, internal teams, freelance projects, and building my own stuff, which is probably why I like staying close to both design and execution.",
];

export function Hero({
  about,
  content,
  navigation,
  socials,
}: {
  about?: AboutContent;
  content?: HeroContent;
  navigation?: NavItem[];
  socials?: SocialLink[];
}) {
  const name = content?.name ?? "Rahul Ornob";
  const title = content?.title ?? "Design Engineer";
  const bio = content?.bio?.length ? content.bio : fallbackBio;
  const wantLabel = content?.wantLabel ?? "Want me on your team?";
  const ctaLabel = content?.ctaLabel ?? "Let’s talk";

  const cmsLogos = about?.logos
    ?.filter((logo) => logo.url)
    .map((logo) => ({
      alt: logo.alt,
      height: logo.height ?? 24,
      name: logo.name,
      src: logo.url as string,
      width: logo.width ?? 100,
    }));
  const logos = cmsLogos?.length ? cmsLogos : fallbackLogos;

  const renderLogos = (hidden: boolean) =>
    logos.map((logo) => (
      <div
        className={styles.brandLogo}
        key={logo.name}
        title={hidden ? undefined : logo.name}
      >
        <Image
          src={logo.src}
          alt={hidden ? "" : logo.alt || logo.name}
          width={logo.width}
          height={logo.height}
          quality={95}
        />
      </div>
    ));

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <DitherCursorTrail />
      <div className={styles.bottomFade} aria-hidden="true" />

      <Navigation items={navigation} socials={socials} />

      <div className={styles.content}>
        <div className={styles.avatar}>
          <div className={styles.avatarImageWrap}>
            <Image
              className={styles.avatarImage}
              src={content?.avatar?.url ?? "/images/hero-portrait.jpg"}
              alt={content?.avatar?.alt ?? ""}
              fill
              sizes="120px"
              quality={95}
              priority
            />
          </div>
          <span className={styles.status} aria-hidden="true" />
        </div>

        <div className={styles.copy}>
          <div className={styles.identity}>
            <h1 id="hero-title" className="type-heading-h4-medium">
              {name}
            </h1>
            <p className={`type-body-medium-regular ${styles.role}`}>
              {title}
            </p>
          </div>

          <div className={styles.bio}>
            {bio.map((paragraph, index) => (
              <p key={index} className="type-body-medium-regular">
                {paragraph}
              </p>
            ))}
          </div>

          <div className={styles.contact}>
            <p className={styles.contactEyebrow}>{wantLabel}</p>
            <a
              className={styles.contactLink}
              href="#contact"
              data-cursor={ctaLabel}
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>

      <div className={styles.brands} aria-label="Selected client logos">
        <div className={styles.brandsTrack}>
          <div className={styles.brandsRow}>{renderLogos(false)}</div>
          <div className={styles.brandsRow} aria-hidden="true">
            {renderLogos(true)}
          </div>
        </div>
        <div className={`${styles.brandsFade} ${styles.brandsFadeLeft}`} />
        <div className={`${styles.brandsFade} ${styles.brandsFadeRight}`} />
      </div>
    </section>
  );
}
