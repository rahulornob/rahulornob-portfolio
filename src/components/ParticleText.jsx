'use client';

import { useEffect, useRef } from 'react';
import styles from './particle-text.module.css';

export default function ParticleText({
  text = 'brilliant.',
  particleSize = 3,
  particleGap = 5,
  backgroundParticleSize = 2,
  backgroundParticleGap = 7,
  textColor = '#b3b3b3',
  backgroundParticleColor = 'rgba(17, 17, 17, 0.055)',
  mouseRadius = 80,
  mouseStrength = 5,
  friction = 0.82,
  ease = 0.055,
  className = ''
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const offscreen = document.createElement('canvas');
    const offscreenContext = offscreen.getContext('2d', {
      alpha: true,
      willReadFrequently: true
    });
    if (!offscreenContext) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { active: false, x: 0, y: 0 };
    let particles = [];
    let width = 0;
    let height = 0;
    let animationFrame = null;
    let resizeFrame = null;
    let isVisible = true;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      let activeColor = '';

      for (const particle of particles) {
        if (particle.color !== activeColor) {
          activeColor = particle.color;
          context.fillStyle = activeColor;
        }
        context.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        );
      }
    };

    const update = () => {
      let isMoving = pointer.active;

      for (const particle of particles) {
        if (pointer.active && !reducedMotion) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distanceSquared = dx * dx + dy * dy;

          if (distanceSquared < mouseRadius * mouseRadius) {
            const distance = Math.sqrt(distanceSquared) || 0.001;
            const force = (mouseRadius - distance) / mouseRadius;
            particle.vx += (dx / distance) * force * particle.repelStrength;
            particle.vy += (dy / distance) * force * particle.repelStrength;
          }
        }

        particle.vx += (particle.originX - particle.x) * particle.ease;
        particle.vy += (particle.originY - particle.y) * particle.ease;
        particle.vx *= particle.friction;
        particle.vy *= particle.friction;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (
          Math.abs(particle.vx) > 0.01 ||
          Math.abs(particle.vy) > 0.01 ||
          Math.abs(particle.originX - particle.x) > 0.05 ||
          Math.abs(particle.originY - particle.y) > 0.05
        ) {
          isMoving = true;
        }
      }

      return isMoving;
    };

    const animate = () => {
      if (!isVisible || reducedMotion) {
        animationFrame = null;
        draw();
        return;
      }

      const shouldContinue = update();
      draw();
      animationFrame = shouldContinue
        ? window.requestAnimationFrame(animate)
        : null;
    };

    const startAnimation = () => {
      if (animationFrame === null && isVisible) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const buildParticles = () => {
      const bounds = container.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      offscreen.width = width;
      offscreen.height = height;
      offscreenContext.clearRect(0, 0, width, height);

      let fontSize = Math.min(height * 0.58, 180);
      offscreenContext.font = `500 ${fontSize}px "Aspekta Variable", Arial, sans-serif`;
      const maximumTextWidth = width * 0.84;

      while (
        fontSize > 20 &&
        offscreenContext.measureText(text).width > maximumTextWidth
      ) {
        fontSize -= 2;
        offscreenContext.font = `500 ${fontSize}px "Aspekta Variable", Arial, sans-serif`;
      }

      offscreenContext.fillStyle = '#000000';
      offscreenContext.textAlign = 'center';
      offscreenContext.textBaseline = 'middle';
      offscreenContext.fillText(text, width / 2, height / 2);

      const pixels = offscreenContext.getImageData(0, 0, width, height).data;
      const nextParticles = [];

      for (let y = backgroundParticleGap / 2; y < height; y += backgroundParticleGap) {
        for (let x = backgroundParticleGap / 2; x < width; x += backgroundParticleGap) {
          nextParticles.push({
            originX: x,
            originY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            color: backgroundParticleColor,
            size: backgroundParticleSize,
            repelStrength: mouseStrength * 0.7,
            ease: ease * 0.82,
            friction: Math.min(0.9, friction + 0.025)
          });
        }
      }

      for (let y = 0; y < height; y += particleGap) {
        for (let x = 0; x < width; x += particleGap) {
          const alpha = pixels[(y * width + x) * 4 + 3];
          if (alpha < 90) continue;

          nextParticles.push({
            originX: x,
            originY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            color: textColor,
            size: particleSize,
            repelStrength: mouseStrength,
            ease,
            friction
          });
        }
      }

      particles = nextParticles;
      draw();
      startAnimation();
    };

    const handlePointerMove = event => {
      if (event.pointerType === 'touch' || reducedMotion) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
      startAnimation();
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      startAnimation();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(buildParticles);
    });

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        startAnimation();
      } else if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    });

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    resizeObserver.observe(container);
    visibilityObserver.observe(container);

    document.fonts.ready.then(buildParticles);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    };
  }, [
    backgroundParticleColor,
    backgroundParticleGap,
    backgroundParticleSize,
    ease,
    friction,
    mouseRadius,
    mouseStrength,
    particleGap,
    particleSize,
    text,
    textColor
  ]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`.trim()}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <span className={styles.visuallyHidden}>{text}</span>
    </div>
  );
}
