"use client";

import Image from "next/image";
import type { TestimonialContent, TestimonialsContent } from "@/cms/types";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./testimonials.module.css";
import RevealHeading from "./RevealHeading";

const fallbackTestimonial: TestimonialContent = {
  author: "Nothing Rahman",
  role: "Product Manager, SaaS Platform",
  quote:
    "Collaborating with Better Mistakes was an absolute joy. They build fast without ever on quality and consistently.",
};

const fallbackTestimonials = Array.from(
  { length: 5 },
  () => fallbackTestimonial,
);

export function Testimonials({ content }: { content?: TestimonialsContent }) {
  const cmsTestimonials = content?.items?.filter(
    (item) => item.quote && item.author,
  );
  const testimonials = cmsTestimonials?.length
    ? cmsTestimonials
    : fallbackTestimonials;
  const slideCount = testimonials.length;
  const totalPositions = slideCount + 2;
  const initialSlide = Math.min(2, slideCount - 1);
  const slidePositions = [
    slideCount - 1,
    ...Array.from({ length: slideCount }, (_, index) => index),
    0,
  ];
  const initialPosition = initialSlide + 1;
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const dragRef = useRef({ active: false, startScrollLeft: 0, startX: 0 });
  const scrollFrameRef = useRef<number | null>(null);
  const edgeResetTimerRef = useRef<number | null>(null);
  const edgeResetFrameRef = useRef<number | null>(null);
  const activePositionRef = useRef(initialPosition);
  const [activePosition, setActivePosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const activeSlide = slidePositions[activePosition];

  const goToPosition = useCallback(
    (position: number, behavior: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;
      const boundedPosition = Math.max(
        0,
        Math.min(totalPositions - 1, position),
      );
      const card = cardRefs.current[boundedPosition];
      if (!viewport || !card) return;

      viewport.scrollTo({
        left: card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2,
        behavior,
      });
      activePositionRef.current = boundedPosition;
      setActivePosition(boundedPosition);
    },
    [totalPositions],
  );

  const goToSlide = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      goToPosition(index + 1, behavior);
    },
    [goToPosition],
  );

  const findNearestPosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return activePositionRef.current;

    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const distance = Math.abs(
        card.offsetLeft + card.offsetWidth / 2 - viewportCenter,
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }, []);

  const jumpToPosition = useCallback((position: number) => {
    const viewport = viewportRef.current;
    const card = cardRefs.current[position];
    if (!viewport || !card) return;

    if (edgeResetFrameRef.current !== null) {
      window.cancelAnimationFrame(edgeResetFrameRef.current);
    }

    viewport.dataset.resetting = "true";
    viewport.style.scrollSnapType = "none";
    viewport.scrollLeft =
      card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    activePositionRef.current = position;
    setActivePosition(position);

    edgeResetFrameRef.current = window.requestAnimationFrame(() => {
      edgeResetFrameRef.current = window.requestAnimationFrame(() => {
        delete viewport.dataset.resetting;
        viewport.style.removeProperty("scroll-snap-type");
        edgeResetFrameRef.current = null;
      });
    });
  }, []);

  const normalizeEdgePosition = useCallback(() => {
    const nearestPosition = findNearestPosition();

    if (nearestPosition === 0) {
      jumpToPosition(slideCount);
    } else if (nearestPosition === totalPositions - 1) {
      jumpToPosition(1);
    }
  }, [findNearestPosition, jumpToPosition, slideCount, totalPositions]);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (!section || !viewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    const centerCurrentSlide = () =>
      goToPosition(activePositionRef.current, "auto");
    const resizeObserver = new ResizeObserver(centerCurrentSlide);

    observer.observe(section);
    resizeObserver.observe(viewport);
    requestAnimationFrame(centerCurrentSlide);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      if (edgeResetTimerRef.current !== null) {
        window.clearTimeout(edgeResetTimerRef.current);
      }
      if (edgeResetFrameRef.current !== null) {
        window.cancelAnimationFrame(edgeResetFrameRef.current);
      }
    };
  }, [goToPosition]);

  useEffect(() => {
    if (isDragging) return;

    const autoRotate = window.setInterval(() => {
      goToPosition(activePositionRef.current + 1);
    }, 5000);

    return () => window.clearInterval(autoRotate);
  }, [goToPosition, isDragging]);

  const handleScroll = () => {
    if (scrollFrameRef.current !== null) return;

    scrollFrameRef.current = requestAnimationFrame(() => {
      const nearestPosition = findNearestPosition();
      activePositionRef.current = nearestPosition;
      setActivePosition(nearestPosition);
      scrollFrameRef.current = null;
    });

    if (edgeResetTimerRef.current !== null) {
      window.clearTimeout(edgeResetTimerRef.current);
    }
    edgeResetTimerRef.current = window.setTimeout(normalizeEdgePosition, 140);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const viewport = event.currentTarget;
    viewport.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      startScrollLeft: viewport.scrollLeft,
      startX: event.clientX,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    event.currentTarget.scrollLeft =
      dragRef.current.startScrollLeft -
      (event.clientX - dragRef.current.startX);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    goToPosition(findNearestPosition());
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.testimonials} ${isVisible ? styles.visible : ""}`}
      aria-labelledby="testimonials-title"
    >
      <RevealHeading
        id="testimonials-title"
        className="type-heading-h1-medium"
        lines={[content?.heading ?? "Nice things people said"]}
      />

      <div
        ref={viewportRef}
        className={`${styles.viewport} ${isDragging ? styles.dragging : ""}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goToPosition(activePositionRef.current - 1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goToPosition(activePositionRef.current + 1);
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onScroll={handleScroll}
      >
        <div className={styles.track}>
          {slidePositions.map((realIndex, position) => {
            const testimonial = testimonials[realIndex];

            return (
              <article
              ref={(node) => {
                cardRefs.current[position] = node;
              }}
              className={`${styles.card} ${
                position === activePosition ? styles.activeCard : ""
              }`}
              aria-hidden={position !== activePosition}
              key={`${realIndex}-${position}`}
            >
              <div className={styles.portrait}>
                <Image
                  src={testimonial.portrait?.url ?? "/testimonials/portrait.png"}
                  alt={testimonial.author ?? "Client portrait"}
                  width={testimonial.portrait?.width ?? 1080}
                  height={testimonial.portrait?.height ?? 1350}
                  sizes="(max-width: 640px) calc(100vw - 32px), 300px"
                  draggable={false}
                />
              </div>

              <div className={styles.content}>
                <div className={styles.quoteGroup}>
                  {testimonial.companyLogo?.url ? (
                    <div
                      className={`${styles.logo} ${styles.cmsLogo}`}
                      aria-label={testimonial.company ?? "Client company"}
                    >
                      <Image
                        src={testimonial.companyLogo.url}
                        alt=""
                        width={testimonial.companyLogo.width ?? 120}
                        height={testimonial.companyLogo.height ?? 40}
                      />
                    </div>
                  ) : (
                    <div className={styles.logo} aria-label="Cosmos">
                      <Image
                        src="/testimonials/cosmos-wordmark.svg"
                        alt=""
                        width={98}
                        height={17}
                      />
                      <Image
                        src="/testimonials/cosmos-mark.svg"
                        alt=""
                        width={7}
                        height={7}
                      />
                    </div>
                  )}
                  <blockquote>{testimonial.quote}</blockquote>
                </div>

                <footer className={styles.author}>
                  <cite>{testimonial.author}</cite>
                  <p>{testimonial.role}</p>
                </footer>
              </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className={styles.dots} aria-label="Choose testimonial">
        {Array.from({ length: slideCount }, (_, index) => (
          <button
            className={index === activeSlide ? styles.activeDot : ""}
            type="button"
            aria-label={`Show testimonial ${index + 1}`}
            aria-current={index === activeSlide ? "true" : undefined}
            onClick={() => goToSlide(index)}
            key={index}
          />
        ))}
      </div>
    </section>
  );
}
