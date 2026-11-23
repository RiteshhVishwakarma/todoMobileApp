/**
 * Animated intro shown once per app start, on top of the app.
 *
 * It starts from exactly the native splash frame (the empty tick box), so the hand-off is
 * seamless; then the cat jumps on, the tick draws itself, and it dives into the box to
 * reveal the app. The dive waits until saved data is ready, so the app never appears empty.
 *
 * Runs entirely on the UI thread (Reanimated); no extra dependencies. When the system
 * "Reduce motion" setting is on, Reanimated skips the motion and the intro just ends.
 */
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { useAppTheme } from '@/theme/ThemeContext';

import {
  BodyShape,
  BoxShape,
  EyesClosedShape,
  EyesOpenShape,
  HeartShape,
  Layer,
  MASCOT_CENTER,
  PIVOT,
  Sparkle1Shape,
  Sparkle2Shape,
  TailShape,
  tickProps,
} from './mascot';
import {
  boxDip,
  catPose,
  END,
  eyesClosed,
  heartPose,
  INTRO_END,
  keep,
  overlayOpacity,
  sparklePose,
  STAGE,
  stageScale,
  T,
  tailAngle,
  TICK_LENGTH,
  tickOffset,
  zoomScale,
} from './timeline';

/**
 * dp per design unit. Must match the native splash in app.json: the splash image is
 * 620 design units wide and shown at imageWidth 200.
 */
const UNIT = 200 / 620;
/** Never hold the app back for long, even if saved data is slow to load. */
const MAX_WAIT_MS = 4000;
/** Same as the native splash backgrounds in app.json. */
const BACKGROUND = { light: '#FCE4EC', dark: '#1B1418' };

const AnimatedPath = Animated.createAnimatedComponent(Path);
const TICK = tickProps();

type Props = {
  /** True once saved data is restored; the dive into the app waits for it. */
  ready: boolean;
  onFinish: () => void;
};

export function AnimatedSplash({ ready, onFinish }: Props) {
  const { isDark } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);
  const [started, setStarted] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const outroStarted = useRef(false);
  const finish = useRef(onFinish);

  useEffect(() => {
    finish.current = onFinish;
  }, [onFinish]);

  // 1) Intro: everything up to the cat sitting on the box.
  useEffect(() => {
    if (!started) return;
    // (.get()/.set() instead of .value keeps this React-Compiler friendly.)
    time.set(
      withTiming(INTRO_END, { duration: INTRO_END * 1000, easing: Easing.linear }, (finished) => {
        if (finished) scheduleOnRN(setIntroDone, true);
      }),
    );
    const timer = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => clearTimeout(timer);
  }, [started, time]);

  // 2) Outro: dive into the box and fade, once the app's data is ready.
  useEffect(() => {
    if (!introDone || !(ready || timedOut) || outroStarted.current) return;
    outroStarted.current = true;
    const done = () => finish.current();
    time.set(
      withTiming(END, { duration: (END - INTRO_END) * 1000, easing: Easing.linear }, (finished) => {
        if (finished) scheduleOnRN(done);
      }),
    );
  }, [introDone, ready, timedOut, time]);

  // The first frame matches the native splash, so hide it as soon as we're on screen.
  const onLayout = () => {
    if (started) return;
    setStarted(true);
    SplashScreen.hideAsync().catch(() => {});
  };

  // ----------------------------------------------------------- geometry (dp)
  const viewBox = `${MASCOT_CENTER.x - width / 2 / UNIT} ${MASCOT_CENTER.y - height / 2 / UNIT} ${width / UNIT} ${height / UNIT}`;
  const at = (p: { x: number; y: number }, scale = 1): [number, number, number] => [
    width / 2 + (p.x - MASCOT_CENTER.x) * UNIT * scale,
    height / 2 + (p.y - MASCOT_CENTER.y) * UNIT * scale,
    0,
  ];
  const layer = { viewBox, width, height };

  // ------------------------------------------------------- animated styles
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity(time.get()) }));
  const zoomStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoomScale(time.get()) }] }));
  const stageStyle = useAnimatedStyle(() => ({ transform: [{ scale: stageScale(time.get()) }] }));

  const boxStyle = useAnimatedStyle(() => {
    const dip = boxDip(time.get());
    return { transform: [{ translateY: 10 * dip * UNIT }, { scaleY: 1 - 0.04 * dip }] };
  });
  const tickStyle = useAnimatedStyle(() => ({ opacity: keep(time.get()) }));
  const tickAnimatedProps = useAnimatedProps(() => ({ strokeDashoffset: tickOffset(time.get()) }));

  const catStyle = useAnimatedStyle(() => {
    const pose = catPose(time.get());
    return {
      opacity: pose.opacity,
      transform: [
        { translateX: pose.dx * UNIT },
        { translateY: pose.dy * UNIT },
        { rotate: `${pose.rotate}deg` },
        { scaleX: pose.scaleX },
        { scaleY: pose.scaleY },
      ],
    };
  });
  const tailStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tailAngle(time.get())}deg` }],
  }));
  const eyesOpenStyle = useAnimatedStyle(() => ({ opacity: eyesClosed(time.get()) ? 0 : 1 }));
  const eyesClosedStyle = useAnimatedStyle(() => ({ opacity: eyesClosed(time.get()) ? 1 : 0 }));

  const heartStyle = useAnimatedStyle(() => {
    const pose = heartPose(time.get());
    return {
      opacity: pose.opacity,
      transform: [{ translateY: pose.lift * UNIT }, { scale: pose.scale }],
    };
  });
  const sparkle1Style = useAnimatedStyle(() => {
    const pose = sparklePose(time.get(), T.sparkle1);
    return { opacity: pose.opacity, transform: [{ rotate: `${pose.rotate}deg` }, { scale: pose.scale }] };
  });
  const sparkle2Style = useAnimatedStyle(() => {
    const pose = sparklePose(time.get(), T.sparkle2);
    return { opacity: pose.opacity, transform: [{ rotate: `${pose.rotate}deg` }, { scale: pose.scale }] };
  });

  return (
    <Animated.View
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Momo is starting"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: isDark ? BACKGROUND.dark : BACKGROUND.light },
        overlayStyle,
      ]}>
      <View style={styles.clip} pointerEvents="none">
        <Animated.View
          style={[StyleSheet.absoluteFill, { transformOrigin: at(PIVOT.boxCenter, STAGE) }, zoomStyle]}>
          <Animated.View
            style={[StyleSheet.absoluteFill, { transformOrigin: [width / 2, height / 2, 0] }, stageStyle]}>
            {/* Tick box */}
            <Animated.View
              style={[StyleSheet.absoluteFill, { transformOrigin: at(PIVOT.boxBottom) }, boxStyle]}>
              <Layer {...layer}>
                <BoxShape />
              </Layer>
              <Animated.View style={[StyleSheet.absoluteFill, tickStyle]}>
                <Layer {...layer}>
                  <AnimatedPath
                    {...TICK}
                    strokeDasharray={[TICK_LENGTH, TICK_LENGTH]}
                    animatedProps={tickAnimatedProps}
                  />
                </Layer>
              </Animated.View>
            </Animated.View>

            {/* Cat */}
            <Animated.View
              style={[StyleSheet.absoluteFill, { transformOrigin: at(PIVOT.feet) }, catStyle]}>
              <Animated.View
                style={[StyleSheet.absoluteFill, { transformOrigin: at(PIVOT.tail) }, tailStyle]}>
                <Layer {...layer}>
                  <TailShape />
                </Layer>
              </Animated.View>
              <Layer {...layer}>
                <BodyShape />
              </Layer>
              <Animated.View style={[StyleSheet.absoluteFill, eyesOpenStyle]}>
                <Layer {...layer}>
                  <EyesOpenShape />
                </Layer>
              </Animated.View>
              <Animated.View style={[StyleSheet.absoluteFill, eyesClosedStyle]}>
                <Layer {...layer}>
                  <EyesClosedShape />
                </Layer>
              </Animated.View>
            </Animated.View>

            {/* Heart and sparkles */}
            <Animated.View
              style={[StyleSheet.absoluteFill, { transformOrigin: at(PIVOT.heart) }, heartStyle]}>
              <Layer {...layer}>
                <HeartShape />
              </Layer>
            </Animated.View>
            <Animated.View
              style={[StyleSheet.absoluteFill, { transformOrigin: at(PIVOT.sparkle1) }, sparkle1Style]}>
              <Layer {...layer}>
                <Sparkle1Shape />
              </Layer>
            </Animated.View>
            <Animated.View
              style={[StyleSheet.absoluteFill, { transformOrigin: at(PIVOT.sparkle2) }, sparkle2Style]}>
              <Layer {...layer}>
                <Sparkle2Shape />
              </Layer>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
});
