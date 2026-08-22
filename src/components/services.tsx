"use client";

import Image from "next/image";
import type { CmsImage, ServicesContent } from "@/cms/types";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import RevealHeading from "./RevealHeading";
import styles from "./services.module.css";

type Service = {
  description: string;
  id: string;
  images?: CmsImage[];
  tags: string[];
  title: string;
};

const fallbackServices: Service[] = [
  {
    id: "website-design",
    title: "Website Design",
    description:
      "I design responsive websites from landing pages to full marketing sites, with a strong focus on layout, visual direction, interactions, and usability.",
    tags: ["Web design", "UI design", "Responsive design"],
  },
  {
    id: "design-engineering",
    title: "Design Engineering",
    description:
      "I take designs further with interactive prototypes, motion, and AI-assisted workflows, so ideas can be tested and refined before they reach development.",
    tags: ["Prototyping", "Interaction", "AI workflow"],
  },
  {
    id: "mobile-app-design",
    title: "Mobile App Design",
    description:
      "I design mobile interfaces and user flows that are easy to understand, visually polished, and consistent across the full experience.",
    tags: ["App design", "UI/UX", "Prototyping"],
  },
  {
    id: "pitch-deck-design",
    title: "Pitch Deck Design",
    description:
      "I turn raw content into clear, well-structured presentations with strong hierarchy, visual storytelling, and slides that are actually easy to follow.",
    tags: ["Pitch deck", "Presentation", "Visual design"],
  },
  {
    id: "brand-collateral-design",
    title: "Brand Collateral Design",
    description:
      "I design business cards, banners, booklets, leaflets, and other print materials, keeping everything consistent with the existing brand and ready for production.",
    tags: ["Print design", "Brand collateral", "Marketing materials"],
  },
];

function ServiceItem({
  index,
  isOpen,
  onToggle,
  service,
}: {
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  service: Service;
}) {
  const itemStyle = { "--service-index": index } as CSSProperties;
  const panelId = `${service.id}-panel`;

  return (
    <article
      className={`${styles.service} ${isOpen ? styles.open : ""}`}
      data-service-item
      style={itemStyle}
    >
      <button
        className={styles.trigger}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>{service.title}</span>
        <span className={styles.icon} aria-hidden="true">
          <Image src="/icons/plus.svg" alt="" width={24} height={24} />
        </span>
      </button>

      <div className={styles.panel} id={panelId} aria-hidden={!isOpen}>
        <div className={styles.panelInner}>
          <div className={styles.details}>
            <div className={styles.copy}>
              <p>{service.description}</p>
              <div className={styles.tags} aria-label={`${service.title} skills`}>
                {service.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className={styles.images} aria-label={`${service.title} examples`}>
              {service.images?.length
                ? service.images.map((image, index) => (
                    <div className={styles.imagePlaceholder} key={`${image.url}-${index}`}>
                      {image.url && (
                        <Image
                          src={image.url}
                          alt={image.alt ?? `${service.title} example ${index + 1}`}
                          width={image.width ?? 800}
                          height={image.height ?? 600}
                          sizes="(max-width: 640px) 72vw, 240px"
                          quality={95}
                        />
                      )}
                    </div>
                  ))
                : [1, 2, 3].map((image) => (
                    <div className={styles.imagePlaceholder} key={image} />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Services({ content }: { content?: ServicesContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [openService, setOpenService] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const cmsServices = content?.items
    ?.filter((service) => service.title)
    .map((service, index): Service => ({
      title: service.title as string,
      id: service.id ?? `service-${index + 1}`,
      description: service.description ?? "",
      tags: service.tags ?? [],
      images: service.images?.filter((image) => image.url),
    }));
  const services = cmsServices?.length ? cmsServices : fallbackServices;

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
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className={`${styles.services} ${isVisible ? styles.visible : ""}`}
      aria-labelledby="services-title"
    >
      <header className={styles.header}>
        <RevealHeading
          id="services-title"
          className="type-heading-h1-medium"
          lines={[content?.heading ?? "The stuff I do best"]}
        />
        <p className="type-body-medium-regular">
          {content?.intro ??
            "Mostly websites. Sometimes apps, decks, and whatever else needs better taste and fewer unnecessary clicks."}
        </p>
      </header>

      <div className={styles.list}>
        {services.map((service, index) => (
          <ServiceItem
            service={service}
            index={index}
            isOpen={openService === service.id}
            onToggle={() =>
              setOpenService((current) =>
                current === service.id ? "" : service.id,
              )
            }
            key={service.id}
          />
        ))}
      </div>
    </section>
  );
}
