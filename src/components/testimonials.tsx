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
  // True for the duration of any scroll *we* initiated (goToPosition's
  // animated scrollTo, or jumpToPosition's instant edge-correction).
  // handleScroll's live "which card is nearest" recompute fires on every
  // scroll event, including the early frames of our own animations - where
  // the viewport is still geometrically closer to the *departing* card -
  // and was overwriting the position we'd just optimistically set, causing
  // a visible flicker back to the previous card at the start of every
  // transition. Gating that recompute while this is true (cleared by
  // scrollend, with a timeout fallback in case that doesn't fire) leaves
  // it live only for genuine user-driven scrolling (drag).
  const programmaticScrollRef = useRef(false);
  const programmaticScrollTimeoutRef = useRef<number | null>(null);
  const activePositionRef = useRef(initialPosition);
  const [activePosition, setActivePosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const activeSlide = slidePositions[activePosition];

  const markProgrammaticScroll = useCallback(() => {
    programmaticScrollRef.current = true;
    if (programmaticScrollTimeoutRef.current !== null) {
      window.clearTimeout(programmaticScrollTimeoutRef.current);
    }
    // Safety net in case scrollend doesn't fire for some reason - well
    // past how long any of these scrollTo animations actually take.
    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 700);
  }, []);

  const goToPosition = useCallback(
    (position: number, behavior: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;
      const boundedPosition = Math.max(
        0,
        Math.min(totalPositions - 1, position),
      );
      const card = cardRefs.current[boundedPosition];
      if (!viewport || !card) return;

      markProgrammaticScroll();
      viewport.scrollTo({
        left: card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2,
        behavior,
      });
      activePositionRef.current = boundedPosition;
      setActivePosition(boundedPosition);
    },
    [totalPositions, markProgrammaticScroll],
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

    markProgrammaticScroll();
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
  }, [markProgrammaticScroll]);

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
    // The reliable "this scroll gesture is actually done" signal - clears
    // the programmatic-scroll gate so live drag tracking resumes. Support
    // is Baseline as of 2024; the timeout in markProgrammaticScroll covers
    // any browser where it doesn't fire.
    const clearProgrammaticScroll = () => {
      programmaticScrollRef.current = false;
    };

    observer.observe(section);
    resizeObserver.observe(viewport);
    viewport.addEventListener("scrollend", clearProgrammaticScroll);
    requestAnimationFrame(centerCurrentSlide);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      viewport.removeEventListener("scrollend", clearProgrammaticScroll);
      if (edgeResetTimerRef.current !== null) {
        window.clearTimeout(edgeResetTimerRef.current);
      }
      if (edgeResetFrameRef.current !== null) {
        window.cancelAnimationFrame(edgeResetFrameRef.current);
      }
      if (programmaticScrollTimeoutRef.current !== null) {
        window.clearTimeout(programmaticScrollTimeoutRef.current);
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
      // Skip the live recompute during our own in-flight animated scrolls -
      // see the comment on programmaticScrollRef above.
      if (!programmaticScrollRef.current) {
        const nearestPosition = findNearestPosition();
        activePositionRef.current = nearestPosition;
        setActivePosition(nearestPosition);
      }
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
              <div className={styles.quoteGroup}>
                <div className={styles.avatar}>
                  <Image
                    src={testimonial.avatar?.url ?? "/testimonials/portrait.png"}
                    alt=""
                    width={testimonial.avatar?.width ?? 128}
                    height={testimonial.avatar?.height ?? 128}
                    quality={95}
                    draggable={false}
                  />
                </div>
                <blockquote className="type-heading-h4-medium">
                  {testimonial.quote}
                </blockquote>
              </div>

              <footer className={styles.author}>
                <cite>{testimonial.author}</cite>
                <p>{testimonial.role}</p>
              </footer>
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
