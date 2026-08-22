"use client";

import Image from "next/image";
import type { ProjectContent } from "@/cms/types";
import ButtonSwooshContent from "./ButtonSwooshContent";
import Magnet from "./Magnet";
import RevealHeading from "./RevealHeading";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./project-showcase.module.css";

type Thumbnail = {
  alt: string;
  height: number;
  src?: string;
  width: number;
};

type Project = {
  description: string;
  slug: string;
  tags: string[];
  thumbnails: Thumbnail[];
  title: string;
};

const placeholderThumbnails = (project: string): Thumbnail[] => [
  { alt: `${project} project preview one`, width: 1050, height: 600 },
  { alt: `${project} project preview two`, width: 1050, height: 600 },
  { alt: `${project} project preview three`, width: 1050, height: 600 },
];

const sharedDescription =
  "The website was designed to capture early demand and build credibility before launch. It converted initial interest into a growing waitlist while clearly communicating Enroute’s performance-driven positioning.";

const fallbackProjects: Project[] = [
  {
    title:
      "NowHealth — Brand and launch website for performance-focused health lab",
    slug: "nowhealth",
    tags: ["Web design", "Web design", "Web design"],
    description: sharedDescription,
    thumbnails: placeholderThumbnails("NowHealth"),
  },
  {
    title:
      "JiniHome — Brand and launch website for performance-focused health lab",
    slug: "jinihome",
    tags: ["Web design", "Web design", "Web design"],
    description: sharedDescription,
    thumbnails: placeholderThumbnails("JiniHome"),
  },
  {
    title:
      "Food (SRM) — Brand and launch website for performance-focused health lab",
    slug: "food-srm",
    tags: ["Web design", "Web design", "Web design"],
    description: sharedDescription,
    thumbnails: placeholderThumbnails("Food SRM"),
  },
  {
    title:
      "NowHealth — Brand and launch website for performance-focused health lab",
    slug: "nowhealth-two",
    tags: ["Web design", "Web design", "Web design"],
    description: sharedDescription,
    thumbnails: placeholderThumbnails("NowHealth"),
  },
  {
    title:
      "NowHealth — Brand and launch website for performance-focused health lab",
    slug: "nowhealth-three",
    tags: ["Web design", "Web design", "Web design"],
    description: sharedDescription,
    thumbnails: placeholderThumbnails("NowHealth"),
  },
];

function ThumbnailSet({
  hidden = false,
  thumbnails,
}: {
  hidden?: boolean;
  thumbnails: Thumbnail[];
}) {
  return (
    <div className={styles.thumbnailSet} aria-hidden={hidden || undefined}>
      {thumbnails.map((thumbnail, index) => {
        const ratio = thumbnail.width / thumbnail.height;
        const thumbnailStyle = {
          "--thumbnail-ratio": ratio,
        } as CSSProperties;

        return (
          <div
            className={styles.thumbnail}
            key={`${thumbnail.alt}-${index}`}
            style={thumbnailStyle}
          >
            {thumbnail.src ? (
              <Image
                src={thumbnail.src}
                alt={hidden ? "" : thumbnail.alt}
                width={thumbnail.width}
                height={thumbnail.height}
                unoptimized
                draggable={false}
              />
            ) : (
              <span className={styles.placeholder} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjectCard({ project, speed }: { project: Project; speed: number }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startTime: 0,
    startX: 0,
  });
  const motionStyle = {
    "--project-duration": "60s",
  } as CSSProperties;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const syncSpeed = () => {
      const travelDistance = track.scrollWidth / 3;
      if (travelDistance <= 0) return;
      track.style.setProperty(
        "--project-duration",
        `${travelDistance / speed}s`,
      );
      track.dataset.speedReady = "true";
    };

    syncSpeed();
    const resizeObserver = new ResizeObserver(syncSpeed);
    resizeObserver.observe(track);
    return () => resizeObserver.disconnect();
  }, [speed]);

  useEffect(() => {
    const gallery = galleryRef.current;
    const track = trackRef.current;
    if (!gallery || !track) return;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track.dataset.playing = "true";
          return;
        }

        track.dataset.playing = "false";
        const animation = track.getAnimations()[0];
        if (animation) animation.currentTime = 0;
      },
      { rootMargin: "0px 0px 5% 0px", threshold: 0 },
    );

    visibilityObserver.observe(gallery);
    return () => visibilityObserver.disconnect();
  }, []);

  const getGalleryAnimation = (gallery: HTMLDivElement) => {
    const track = gallery.querySelector(`.${styles.thumbnailTrack}`);
    return track?.getAnimations()[0] ?? null;
  };

  const updateGallerySpeed = (gallery: HTMLDivElement, playbackRate: number) => {
    getGalleryAnimation(gallery)?.updatePlaybackRate(playbackRate);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    const animation = getGalleryAnimation(event.currentTarget);
    if (!animation) return;

    dragRef.current = {
      active: true,
      startTime: Number(animation.currentTime ?? 0),
      startX: event.clientX,
    };
    event.currentTarget.dataset.dragging = "true";
    event.currentTarget.setPointerCapture(event.pointerId);
    animation.updatePlaybackRate(0);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    const gallery = event.currentTarget;
    const animation = getGalleryAnimation(gallery);
    const track = gallery.querySelector(`.${styles.thumbnailTrack}`);
    if (!animation || !track) return;

    const duration = Number(animation.effect?.getTiming().duration);
    const travelDistance = track.scrollWidth / 3;
    if (!Number.isFinite(duration) || travelDistance <= 0) return;

    const dragDistance = event.clientX - dragRef.current.startX;
    const targetTime =
      dragRef.current.startTime - dragDistance * (duration / travelDistance);
    animation.currentTime = ((targetTime % duration) + duration) % duration;
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const isMouseHover =
      event.pointerType === "mouse" && event.currentTarget.matches(":hover");
    updateGallerySpeed(event.currentTarget, isMouseHover ? 0.5 : 1);
  };

  return (
    <article className={styles.project} data-project-card>
      <div
        ref={galleryRef}
        className={styles.gallery}
        role="region"
        aria-label={`${project.title} image gallery. Drag left or right to browse.`}
        onPointerEnter={(event) => updateGallerySpeed(event.currentTarget, 0.5)}
        onPointerLeave={(event) => {
          if (!dragRef.current.active) updateGallerySpeed(event.currentTarget, 1);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div ref={trackRef} className={styles.thumbnailTrack} style={motionStyle}>
          <ThumbnailSet thumbnails={project.thumbnails} hidden />
          <ThumbnailSet thumbnails={project.thumbnails} />
          <ThumbnailSet thumbnails={project.thumbnails} hidden />
        </div>
      </div>

      <div className={styles.projectInfo}>
        <div className={styles.projectPrimary}>
          <RevealHeading as="h3" lines={[project.title]} />
          <div className={styles.tags} aria-label="Project services">
            {project.tags.map((tag, tagIndex) => (
              <RevealHeading
                as="span"
                className={styles.tag}
                delayIndex={tagIndex * 2}
                lines={[tag]}
                key={`${tag}-${tagIndex}`}
              />
            ))}
          </div>
        </div>

        <RevealHeading
          as="p"
          className={styles.description}
          lines={[project.description]}
        />
      </div>
    </article>
  );
}

export function ProjectShowcase({
  carouselSpeed = 60,
  heading,
  projects: cmsProjects,
}: {
  carouselSpeed?: number;
  heading?: string;
  projects?: ProjectContent[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);
  const cmsProjectItems = cmsProjects
    ?.filter((project) => project.title)
    .map((project, index): Project => {
      const title = project.title as string;
      const cmsThumbnails = project.images
        ?.filter((image) => image.url)
        .map((image, imageIndex) => ({
          alt: image.alt ?? `${title} project preview ${imageIndex + 1}`,
          height: image.height ?? 600,
          src: image.url,
          width: image.width ?? 1050,
        }));

      return {
        title,
        slug: project.slug ?? `project-${index + 1}`,
        tags: project.tags ?? [],
        description: project.description ?? "",
        thumbnails: cmsThumbnails?.length
          ? cmsThumbnails
          : placeholderThumbnails(title),
      };
    });
  const projects = cmsProjectItems?.length ? cmsProjectItems : fallbackProjects;
  const normalizedSpeed = Math.min(100, Math.max(20, carouselSpeed));
  const headingLines = heading?.trim()
    ? heading.split("\n")
    : ["A selection", "of things I’ve made"];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const headingObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadingVisible(true);
          headingObserver.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );

    headingObserver.observe(section);
    section
      .querySelectorAll("[data-project-card]")
      .forEach((card) => cardObserver.observe(card));

    return () => {
      headingObserver.disconnect();
      cardObserver.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className={`${styles.showcase} ${
        headingVisible ? styles.headingVisible : ""
      }`}
      aria-labelledby="projects-title"
    >
      <RevealHeading
        id="projects-title"
        className="type-heading-h1-medium"
        lines={headingLines}
      />

      <div className={styles.projectList}>
        {projects.map((project) => (
          <ProjectCard project={project} speed={normalizedSpeed} key={project.slug} />
        ))}
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
          <ButtonSwooshContent text="Start project">
            <RevealHeading as="span" lines={["Start project"]} />
          </ButtonSwooshContent>
        </a>
      </Magnet>
    </section>
  );
}
