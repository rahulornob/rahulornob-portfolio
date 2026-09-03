"use client";

import { useEffect, useRef } from "react";
import styles from "./dither-cursor-trail.module.css";

// Standard recursive Bayer ordered-dither matrix, built once at module
// load. Values run 0..(size*size - 1); dividing by size*size gives each
// cell a threshold in [0, 1). Comparing a smooth intensity value against
// this structured (not random) pattern is what turns a soft field into
// evenly-textured dots instead of a blurry gradient.
function buildBayerMatrix(size: number): number[][] {
  if (size === 1) return [[0]];
  const half = size / 2;
  const smaller = buildBayerMatrix(half);
  const matrix: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  for (let y = 0; y < half; y++) {
    for (let x = 0; x < half; x++) {
      const v = smaller[y][x];
      matrix[y][x] = 4 * v;
      matrix[y][x + half] = 4 * v + 2;
      matrix[y + half][x] = 4 * v + 3;
      matrix[y + half][x + half] = 4 * v + 1;
    }
  }
  return matrix;
}

const BAYER_SIZE = 8;
const BAYER = buildBayerMatrix(BAYER_SIZE);

// A fine grid pitch and a small, *fixed*-size dot per cell - true ordered
// dithering never resizes the dot itself. The gradient reads entirely
// through which cells clear the Bayer threshold (density), not through
// bigger/darker dots near the head. The radius is sized close to half
// the pitch so a fully-lit run of cells reads as a near-solid mesh
// instead of leaving obvious gaps. (Halved from the previous 6px pitch
// per request - finer grain, same mechanics.)
const CELL_SIZE = 3;
const DOT_RADIUS = CELL_SIZE * 0.44;

// The trail isn't just a handful of chasing points - it's a short "brush"
// of chasing points (for a soft, tapered stroke shape) that stamps into a
// persistent intensity field every frame, and that field itself decays
// over time. The field, not the brush, is what lets a slow circular
// gesture leave a whole visible swirl instead of only ever showing the
// last instant of movement.
const BRUSH_LENGTH = 7;
const HEAD_EASE = 0.4;
const CHASE_EASE = 0.5;
// Wider reach and a gentler per-cell strength - like widening a Gaussian
// blur's radius, the same brush spreads its influence over more area
// instead of concentrating it in a tight, sharp-edged blob. (Dialed back
// 40% from an even wider first pass that felt too big.)
const HEAD_SPLAT_RADIUS = 57;
const TAIL_SPLAT_RADIUS = 24;
const HEAD_SPLAT_STRENGTH = 0.72;
const TAIL_SPLAT_STRENGTH = 0.2;

// Field values are multiplied by this every frame - the actual mechanism
// behind the trail fading out, rather than a separate global-alpha timer.
const FIELD_DECAY = 0.958;
// Below this the cell is treated as fully off, so decay doesn't leave an
// eternal, invisible-but-nonzero tail of float math running forever.
const FIELD_FLOOR = 0.004;

// Light gray throughout - a faint, barely-there tone at the sparse edge
// of the field, rising to a slightly deeper (but still light) gray at
// full intensity, so density alone still carries the gradient.
const COLOR_LOW: [number, number, number] = [240, 240, 241];
const COLOR_HIGH: [number, number, number] = [198, 198, 201];
const COLOR_STEPS = 16;

type Point = { x: number; y: number };

export function DitherCursorTrail() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      cols = Math.max(1, Math.ceil(width / CELL_SIZE));
      rows = Math.max(1, Math.ceil(height / CELL_SIZE));
      field = new Float32Array(cols * rows);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);

    const bucketColors = Array.from({ length: COLOR_STEPS }, (_, i) => {
      const t = i / (COLOR_STEPS - 1);
      const r = Math.round(COLOR_LOW[0] + (COLOR_HIGH[0] - COLOR_LOW[0]) * t);
      const g = Math.round(COLOR_LOW[1] + (COLOR_HIGH[1] - COLOR_LOW[1]) * t);
      const b = Math.round(COLOR_LOW[2] + (COLOR_HIGH[2] - COLOR_LOW[2]) * t);
      return `rgb(${r}, ${g}, ${b})`;
    });

    const brush: Point[] = Array.from({ length: BRUSH_LENGTH }, () => ({
      x: -1000,
      y: -1000,
    }));
    let target: Point | null = null;
    let lastMoveAt = 0;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        target = null;
        return;
      }
      target = { x, y };
      lastMoveAt = performance.now();
    };
    const onLeave = () => {
      target = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    // Splat a soft, smoothstepped falloff into the field around (x, y),
    // additive and clamped to 1 so repeated passes over the same spot
    // saturate instead of blowing out.
    const splat = (x: number, y: number, radius: number, strength: number) => {
      const minCol = Math.max(0, Math.floor((x - radius) / CELL_SIZE));
      const maxCol = Math.min(cols - 1, Math.ceil((x + radius) / CELL_SIZE));
      const minRow = Math.max(0, Math.floor((y - radius) / CELL_SIZE));
      const maxRow = Math.min(rows - 1, Math.ceil((y + radius) / CELL_SIZE));
      for (let row = minRow; row <= maxRow; row++) {
        const cy = row * CELL_SIZE + CELL_SIZE / 2;
        for (let col = minCol; col <= maxCol; col++) {
          const cx = col * CELL_SIZE + CELL_SIZE / 2;
          const dx = cx - x;
          const dy = cy - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = 1 - dist / radius;
          if (t <= 0) continue;
          const falloff = t * t * (3 - 2 * t);
          const index = row * cols + col;
          field[index] = Math.min(1, field[index] + falloff * strength);
        }
      }
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (cols === 0 || rows === 0) return;

      if (target) {
        brush[0].x += (target.x - brush[0].x) * HEAD_EASE;
        brush[0].y += (target.y - brush[0].y) * HEAD_EASE;
      }
      for (let i = 1; i < brush.length; i++) {
        brush[i].x += (brush[i - 1].x - brush[i].x) * CHASE_EASE;
        brush[i].y += (brush[i - 1].y - brush[i].y) * CHASE_EASE;
      }

      const now = performance.now();
      const active = target && now - lastMoveAt < 220;
      if (active) {
        for (let i = 0; i < brush.length; i++) {
          const t = i / (brush.length - 1);
          const radius = HEAD_SPLAT_RADIUS + (TAIL_SPLAT_RADIUS - HEAD_SPLAT_RADIUS) * t;
          const strength = HEAD_SPLAT_STRENGTH + (TAIL_SPLAT_STRENGTH - HEAD_SPLAT_STRENGTH) * t;
          splat(brush[i].x, brush[i].y, radius, strength);
        }
      }

      // Decay every cell - this is the trail's fade mechanism. A cell
      // that dips under the floor is snapped to exactly 0 so an idle
      // field eventually stops doing any (even negligible) work.
      let anyLit = false;
      for (let i = 0; i < field.length; i++) {
        const v = field[i] * FIELD_DECAY;
        field[i] = v < FIELD_FLOOR ? 0 : v;
        if (field[i] > 0) anyLit = true;
      }

      ctx.clearRect(0, 0, width, height);
      if (!anyLit) return;

      const paths = Array.from({ length: COLOR_STEPS }, () => new Path2D());
      for (let row = 0; row < rows; row++) {
        const cy = row * CELL_SIZE + CELL_SIZE / 2;
        const bayerRow = BAYER[row % BAYER_SIZE];
        const rowOffset = row * cols;
        for (let col = 0; col < cols; col++) {
          const intensity = field[rowOffset + col];
          if (intensity <= 0) continue;

          const threshold = bayerRow[col % BAYER_SIZE] / (BAYER_SIZE * BAYER_SIZE);
          if (intensity <= threshold) continue;

          const cx = col * CELL_SIZE + CELL_SIZE / 2;
          const bucket = Math.min(COLOR_STEPS - 1, Math.floor(intensity * COLOR_STEPS));
          const path = paths[bucket];
          path.moveTo(cx + DOT_RADIUS, cy);
          path.arc(cx, cy, DOT_RADIUS, 0, Math.PI * 2);
        }
      }
      for (let b = 0; b < COLOR_STEPS; b++) {
        ctx.fillStyle = bucketColors[b];
        ctx.fill(paths[b]);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.wrap} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
