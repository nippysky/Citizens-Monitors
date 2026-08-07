import { Redirect } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import {
  useAnimatedValue,
  useAnimatedValues,
} from "@/hooks/useAnimatedValue";

import AuthBackground from "@/components/auth/AuthBackground";
import { useAuth } from "@/context/AuthContext";
import { getHasSeenIntroSlides } from "@/lib/introStorage";
import OnbaordCZIcon from "@/svgs/app/OnboardCZIcon";
import OnboardHands from "@/svgs/app/OnboardHands";
import { Theme } from "@/theme";

const BRANDING_DURATION = 2400;
const DOT_COLORS = ["#EA4335", "#4285F4", "#34A853", "#FBBC05", "#F29900"];

export default function IndexScreen() {
  const { isAuthenticated, isOnboardingComplete, sessionStatus } = useAuth();
  const [readyToRoute, setReadyToRoute] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);

  const logoOpacity = useAnimatedValue(0);
  const logoTranslateY = useAnimatedValue(18);
  const logoScale = useAnimatedValue(0.94);

  const dotsOpacity = useAnimatedValue(0);
  const dotsTranslateY = useAnimatedValue(12);

  const handsOpacity = useAnimatedValue(0);
  const handsTranslateY = useAnimatedValue(18);

  const dotScales = useAnimatedValues(DOT_COLORS.length, 0.92);
  const dotOpacities = useAnimatedValues(DOT_COLORS.length, 0.45);

  const loaderTranslateX = useAnimatedValue(-56);
  const loaderOpacity = useAnimatedValue(0);

  const logoExitScale = useAnimatedValue(1);
  const logoExitOpacity = useAnimatedValue(1);

  const routeNode = useMemo(() => {
    if (hasSeenIntro === null) {
      return null;
    }

    if (!hasSeenIntro) {
      return <Redirect href="/(public)/intro" />;
    }

    // Expired session with vaulted credentials — offer biometric re-entry
    // instead of dumping a known user back on the welcome screen.
    if (sessionStatus === "locked") {
      return <Redirect href="/(public)/unlock" />;
    }

    if (!isAuthenticated) {
      return <Redirect href="/(public)/welcome" />;
    }

    if (!isOnboardingComplete) {
      return <Redirect href="/(public)/onboarding" />;
    }

    return <Redirect href="/(app)/(tabs)/home" />;
  }, [hasSeenIntro, isAuthenticated, isOnboardingComplete, sessionStatus]);

  useEffect(() => {
    let mounted = true;

    getHasSeenIntroSlides().then((value) => {
      if (mounted) {
        setHasSeenIntro(value);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 420,
        delay: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(dotsTranslateY, {
        toValue: 0,
        duration: 420,
        delay: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(handsOpacity, {
        toValue: 0.18,
        duration: 520,
        delay: 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(handsTranslateY, {
        toValue: 0,
        duration: 520,
        delay: 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    const dotLoops = dotScales.map((scale, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1.22,
              duration: 280,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(dotOpacities[index], {
              toValue: 1,
              duration: 280,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0.92,
              duration: 320,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(dotOpacities[index], {
              toValue: 0.45,
              duration: 320,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      )
    );

    entrance.start();
    dotLoops.forEach((loop) => loop.start());

    const transitionTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(dotsOpacity, {
          toValue: 0.18,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(loaderTranslateX, {
          toValue: 56,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoExitScale, {
          toValue: 1.03,
          duration: 380,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoExitOpacity, {
          toValue: 0.92,
          duration: 380,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, BRANDING_DURATION - 900);

    const routeTimer = setTimeout(() => {
      setReadyToRoute(true);
    }, BRANDING_DURATION);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(routeTimer);
      dotLoops.forEach((loop) => loop.stop());
    };
  }, [
    dotOpacities,
    dotScales,
    dotsOpacity,
    dotsTranslateY,
    handsOpacity,
    handsTranslateY,
    loaderOpacity,
    loaderTranslateX,
    logoExitOpacity,
    logoExitScale,
    logoOpacity,
    logoScale,
    logoTranslateY,
  ]);

  if (readyToRoute && routeNode) {
    return routeNode;
  }

  return (
    <AuthBackground>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.centerBlock,
            {
              opacity: Animated.multiply(logoOpacity, logoExitOpacity),
              transform: [
                { translateY: logoTranslateY },
                { scale: Animated.multiply(logoScale, logoExitScale) },
              ],
            },
          ]}
        >
          <OnbaordCZIcon />
          <Animated.View
            style={[
              styles.dotsWrap,
              {
                opacity: dotsOpacity,
                transform: [{ translateY: dotsTranslateY }],
              },
            ]}
          >
            {DOT_COLORS.map((color, index) => (
              <Animated.View
                key={color + index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: color,
                    opacity: dotOpacities[index],
                    transform: [{ scale: dotScales[index] }],
                  },
                ]}
              />
            ))}

            <Animated.View
              pointerEvents="none"
              style={[
                styles.loaderTrack,
                {
                  opacity: loaderOpacity,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.loaderRunner,
                  {
                    transform: [{ translateX: loaderTranslateX }],
                  },
                ]}
              >
                <View style={[styles.loaderSegment, { backgroundColor: "#EA4335" }]} />
                <View style={[styles.loaderSegment, { backgroundColor: "#4285F4" }]} />
                <View style={[styles.loaderSegment, { backgroundColor: "#34A853" }]} />
                <View style={[styles.loaderSegment, { backgroundColor: "#FBBC05" }]} />
                <View style={[styles.loaderSegment, { backgroundColor: "#F29900" }]} />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.handsWrap,
            {
              opacity: handsOpacity,
              transform: [{ translateY: handsTranslateY }],
            },
          ]}
        >
          <OnboardHands />
        </Animated.View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  centerBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: -30,
  },

  tagline: {
    marginTop: 18,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },

  dotsWrap: {
    marginTop: 30,
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  loaderTrack: {
    position: "absolute",
    width: 120,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(17, 26, 50, 0.06)",
  },

  loaderRunner: {
    width: 120,
    height: 8,
    flexDirection: "row",
  },

  loaderSegment: {
    flex: 1,
    height: 8,
  },

  handsWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
});