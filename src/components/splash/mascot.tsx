/**
 * The Momo mascot (sleepy kitty on a tick box), split into layers so the splash can
 * animate each part. Same artwork as assets/images/logo.svg, in its 512-unit space.
 */
import { memo, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  type PathProps,
} from 'react-native-svg';

/** Design point the screen is centred on (the mascot's centre). */
export const MASCOT_CENTER = { x: 258, y: 286 };
/** Pivot points, in design units. */
export const PIVOT = {
  feet: { x: 262, y: 300 },
  boxBottom: { x: 256, y: 452 },
  boxCenter: { x: 256, y: 345 },
  tail: { x: 356, y: 252 },
  heart: { x: 350, y: 128 },
  sparkle1: { x: 404, y: 189 },
  sparkle2: { x: 110, y: 345 },
};

export const TICK_PATH = 'M206 352 L 242 388 L 310 314';

type LayerProps = { viewBox: string; width: number; height: number; children: ReactNode };

/** One full-screen SVG; every layer shares the same viewBox so they line up exactly. */
export const Layer = memo(function Layer({ viewBox, width, height, children }: LayerProps) {
  return (
    <Svg width={width} height={height} viewBox={viewBox} style={StyleSheet.absoluteFill} pointerEvents="none">
      {children}
    </Svg>
  );
});

export function BoxShape() {
  return (
    <>
      <Defs>
        <LinearGradient id="momoSplashBox" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F7AFC8" />
          <Stop offset="1" stopColor="#EE8DB2" />
        </LinearGradient>
      </Defs>
      <Rect x={146} y={262} width={220} height={190} rx={46} fill="#E07BA3" />
      <Rect x={146} y={252} width={220} height={186} rx={46} fill="url(#momoSplashBox)" />
    </>
  );
}

/** The tick; its props (stroke-dash offset) are animated by the caller. */
export function tickProps(): PathProps {
  return {
    d: TICK_PATH,
    stroke: '#FFFFFF',
    strokeWidth: 24,
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
}

const TAIL_PATH = 'M356 252 C 398 254, 404 302, 380 324';

export function TailShape() {
  return (
    <>
      <Path d={TAIL_PATH} stroke="#F2B9CE" strokeWidth={34} fill="none" strokeLinecap="round" />
      <Path d={TAIL_PATH} stroke="#FFFFFF" strokeWidth={24} fill="none" strokeLinecap="round" />
      <Circle cx={380} cy={324} r={12} fill="#F7B6CC" />
    </>
  );
}

function Silhouette() {
  return (
    <>
      <Ellipse cx={272} cy={236} rx={112} ry={54} />
      <Ellipse cx={200} cy={284} rx={26} ry={15} />
      <Ellipse cx={248} cy={286} rx={24} ry={14} />
      <Path d="M146 196 C 140 160, 146 132, 156 122 C 172 130, 192 148, 204 170 Z" />
      <Path d="M232 168 C 244 144, 264 128, 282 124 C 288 138, 286 166, 274 196 Z" />
      <Ellipse cx={212} cy={222} rx={74} ry={62} />
    </>
  );
}

/** Body, head, ears, cheeks and mouth (eyes are separate layers). */
export function BodyShape() {
  return (
    <>
      <G fill="#F2B9CE" stroke="#F2B9CE" strokeWidth={10} strokeLinejoin="round">
        <Silhouette />
      </G>
      <G fill="#FFFFFF">
        <Silhouette />
      </G>
      <Ellipse cx={318} cy={214} rx={34} ry={20} fill="#FBDCE7" />
      <Path d="M158 184 C 156 162, 158 148, 162 140 C 172 146, 182 156, 190 170 Z" fill="#F7B6CC" />
      <Path d="M246 172 C 254 156, 266 146, 276 142 C 278 152, 276 168, 268 186 Z" fill="#F7B6CC" />
      <Ellipse cx={164} cy={246} rx={17} ry={10} fill="#F06C9B" fillOpacity={0.4} />
      <Ellipse cx={262} cy={246} rx={17} ry={10} fill="#F06C9B" fillOpacity={0.4} />
      <Path
        d="M202 244 Q 207 252 212 244 Q 217 252 222 244"
        stroke="#5A3A48"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

export function EyesOpenShape() {
  return (
    <>
      <Ellipse cx={182} cy={224} rx={8} ry={10} fill="#4E3140" />
      <Ellipse cx={242} cy={224} rx={8} ry={10} fill="#4E3140" />
      <Circle cx={185} cy={220} r={3} fill="#FFFFFF" />
      <Circle cx={245} cy={220} r={3} fill="#FFFFFF" />
    </>
  );
}

export function EyesClosedShape() {
  return (
    <>
      <Path d="M168 222 Q 182 234 196 222" stroke="#5A3A48" strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d="M228 222 Q 242 234 256 222" stroke="#5A3A48" strokeWidth={7} fill="none" strokeLinecap="round" />
    </>
  );
}

export function HeartShape() {
  return (
    <Path
      d="M330 120 C 330 108, 346 104, 350 116 C 354 104, 370 108, 370 120 C 370 134, 350 144, 350 148 C 350 144, 330 134, 330 120 Z"
      fill="#E879A5"
    />
  );
}

export function Sparkle1Shape() {
  return (
    <Path d="M404 170 L 409 184 L 423 189 L 409 194 L 404 208 L 399 194 L 385 189 L 399 184 Z" fill="#FFFFFF" />
  );
}

export function Sparkle2Shape() {
  return (
    <Path d="M110 330 L 114 341 L 125 345 L 114 349 L 110 360 L 106 349 L 95 345 L 106 341 Z" fill="#FFFFFF" />
  );
}
