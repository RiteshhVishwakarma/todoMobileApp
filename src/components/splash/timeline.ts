/**
 * The splash animation, as pure functions of time (seconds).
 *
 * Every function is a worklet, so it runs on the UI thread inside animated styles.
 * Positions are in the logo's design units (the 512-unit space the mascot is drawn in);
 * AnimatedSplash converts them to dp.
 *
 * Story: the empty tick box (same frame as the native splash) pops bigger → the cat rises
 * into the bottom-right corner → crouches and wiggles → leaps onto the box → the tick
 * draws itself → heart + sparkles → dive into the pink box → fade to the app.
 */

export const T = {
  pop: [0.0, 0.3], // box grows from native-splash size to stage size
  appear: [0.1, 0.32], // cat rises into the bottom-right corner
  wiggle: [0.32, 0.58], // crouch + butt wiggle before the jump
  jump: [0.58, 1.02], // leap up and over onto the box, head first
  land: [1.02, 1.12], // squash on landing (box dips)
  rebound: [1.12, 1.34], // springy settle
  eyes: 1.06, // eyes close happily
  tick: [1.06, 1.26], // tick draws itself
  heart: [1.26, 1.5],
  sparkle1: 1.3,
  sparkle2: 1.36,
  sparkleDuration: 0.32,
  tail: [1.28, 1.6],
  clear: [1.62, 1.76], // cat, tick and heart fade as the dive starts
  zoom: [1.62, 2.0], // dive into the pink box…
  fade: [1.88, 2.14], // …which fades to the app
} as const;

/** The animation holds here (cat sitting on the box) until the app's data is ready. */
export const INTRO_END = T.zoom[0];
export const END = T.fade[1];

/** How much bigger than the native splash the mascot gets. */
export const STAGE = 1.7;

/** Where the cat crouches, in design units from its landing spot. */
const START_X = 220;
const START_Y = 620;
/** Below the bottom edge of any phone, at stage size. */
const HIDDEN_Y = 2000;
/** Arc height of the leap. */
const LEAP = 500;

/** Length of the tick path (for the draw-on effect). */
export const TICK_LENGTH = 152;

// ------------------------------------------------------------------ helpers
// Order matters: a worklet captures the functions it calls when it is created, so
// every function must be defined ABOVE the worklets that call it.

function clamp01(x: number): number {
  'worklet';
  return Math.min(1, Math.max(0, x));
}

function seg(t: number, range: readonly [number, number]): number {
  'worklet';
  return clamp01((t - range[0]) / (range[1] - range[0]));
}

function lerp(a: number, b: number, u: number): number {
  'worklet';
  return a + (b - a) * u;
}

function easeOut(u: number): number {
  'worklet';
  return 1 - Math.pow(1 - u, 3);
}

function easeIn(u: number): number {
  'worklet';
  return u * u * u;
}

function easeInOut(u: number): number {
  'worklet';
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function backOut(u: number): number {
  'worklet';
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
}

/** 1 → 0 as the dive starts (cat, tick and heart slip away). */
export function keep(t: number): number {
  'worklet';
  return 1 - easeOut(seg(t, T.clear));
}

// --------------------------------------------------------------- the layers

export function stageScale(t: number): number {
  'worklet';
  return 1 + (STAGE - 1) * backOut(seg(t, T.pop));
}

export interface CatPose {
  dx: number;
  dy: number;
  /** Degrees; positive lifts the head (the cat faces left). */
  rotate: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

export function catPose(t: number): CatPose {
  'worklet';
  // Rise into the corner.
  let dx = START_X;
  let dy = lerp(HIDDEN_Y, START_Y, easeOut(seg(t, T.appear)));
  let rotate = 0;
  let scaleX = 1;
  let scaleY = 1;

  // Crouch and wiggle.
  if (t >= T.wiggle[0] && t < T.jump[0]) {
    const w = seg(t, T.wiggle);
    const crouch = easeOut(Math.min(1, w * 3));
    const shake = Math.sin(w * Math.PI * 6) * crouch;
    scaleY = 1 - 0.14 * crouch;
    scaleX = 1 + 0.08 * crouch;
    rotate = -4 * shake;
    dx += 5 * shake;
  }

  // Leap: head up on the way up, head down on the way down.
  if (t >= T.jump[0]) {
    const j = seg(t, T.jump);
    dx = START_X * (1 - j);
    dy = START_Y * (1 - j) - 4 * LEAP * j * (1 - j);
    rotate = lerp(24, -12, j);
    const stretch = 0.1 * Math.sin(Math.PI * j) + 0.1 * Math.pow(1 - j, 3);
    scaleY = 1 + stretch;
    scaleX = 1 - 0.6 * stretch;
  }

  // Land with a squash, then a springy settle.
  if (t >= T.land[0]) {
    const l = easeOut(seg(t, T.land));
    rotate = lerp(-12, 0, l);
    scaleX = lerp(1, 1.14, l);
    scaleY = lerp(1, 0.84, l);
  }
  if (t >= T.rebound[0]) {
    const r = seg(t, T.rebound);
    const spring = Math.exp(-4 * r) * Math.cos(r * Math.PI * 2.2);
    scaleX = 1 + 0.14 * spring;
    scaleY = 1 - 0.16 * spring;
    rotate = 0;
  }

  return { dx, dy, rotate, scaleX, scaleY, opacity: t < T.appear[0] ? 0 : keep(t) };
}

/** 0 → 1: how far the box is pressed down by the landing. */
export function boxDip(t: number): number {
  'worklet';
  if (t < T.land[0]) return 0;
  if (t < T.rebound[0]) return easeOut(seg(t, T.land));
  const r = seg(t, T.rebound);
  return Math.max(0, Math.exp(-5 * r) * Math.cos(r * Math.PI * 2));
}

export function eyesClosed(t: number): boolean {
  'worklet';
  return t >= T.eyes;
}

/** Stroke-dash offset for the tick: TICK_LENGTH (hidden) → 0 (drawn). */
export function tickOffset(t: number): number {
  'worklet';
  return TICK_LENGTH * (1 - easeOut(seg(t, T.tick)));
}

export function heartPose(t: number): { lift: number; scale: number; opacity: number } {
  'worklet';
  const h = seg(t, T.heart);
  return {
    lift: 18 * (1 - easeOut(h)),
    scale: Math.max(0.001, backOut(h)),
    opacity: h > 0 ? keep(t) : 0,
  };
}

export function sparklePose(
  t: number,
  start: number,
): { rotate: number; scale: number; opacity: number } {
  'worklet';
  const u = seg(t, [start, start + T.sparkleDuration]);
  let scale = 0.001;
  if (u > 0) scale = u < 0.5 ? backOut(u * 2) * 1.15 : lerp(1.15, 0.9, (u - 0.5) * 2);
  return { rotate: 45 * u, scale, opacity: u > 0 ? keep(t) : 0 };
}

export function tailAngle(t: number): number {
  'worklet';
  const w = seg(t, T.tail);
  return 14 * Math.sin(w * Math.PI * 3) * (1 - w);
}

export function zoomScale(t: number): number {
  'worklet';
  return 1 + 24 * easeIn(seg(t, T.zoom));
}

export function overlayOpacity(t: number): number {
  'worklet';
  return 1 - easeInOut(seg(t, T.fade));
}
