import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { INTRO_SLIDES } from "@/data/introSlides";
import { setHasSeenIntroSlides } from "@/lib/introStorage";
import { Theme } from "@/theme";

const SWIPE_THRESHOLD = 50;

export default function IntroScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isAnimating = useRef(false);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const slides = useMemo(() => INTRO_SLIDES, []);

  const safeBottom = Math.max(insets.bottom, 12);
  const footerHeight = 68 + safeBottom;

  const phoneWidth = Math.min(width * 0.86, 360);
  const phoneHeight = phoneWidth * (525 / 390);

  const phoneTop = 0;
  const greenTop = phoneTop + 20;

  const contentTop = phoneTop + phoneHeight + 18;

  const transitionTo = useCallback(
    (nextIndex: number) => {
      if (isAnimating.current) return;
      if (nextIndex < 0 || nextIndex >= slides.length) return;

      isAnimating.current = true;

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.968,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
        ]).start(() => {
          isAnimating.current = false;
        });
      });
    },
    [fadeAnim, scaleAnim, slides.length]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 10,
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 10,
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          transitionTo(activeIndexRef.current + 1);
        } else if (g.dx > SWIPE_THRESHOLD) {
          transitionTo(activeIndexRef.current - 1);
        }
      },
    })
  ).current;

  const currentSlide = slides[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === slides.length - 1;

  const handleContinue = useCallback(async () => {
    if (isLast) {
      await setHasSeenIntroSlides(true);
      router.replace("/(public)/welcome");
      return;
    }

    transitionTo(activeIndex + 1);
  }, [activeIndex, isLast, transitionTo]);

  const handleBack = useCallback(() => {
    transitionTo(activeIndex - 1);
  }, [activeIndex, transitionTo]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View
        style={[styles.page, { width, height }]}
        {...panResponder.panHandlers}
      >
        <View
          style={[styles.greenLayer, { top: greenTop, bottom: footerHeight - 8 }]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.07)", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          <View style={styles.greenTopSlant} />
          <View style={styles.greenBottomSlant} />
        </View>

        <Animated.View
          style={[
            styles.phoneWrap,
            {
              top: phoneTop,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
    <Image
  source={currentSlide.phoneImage}
  style={{ width: phoneWidth, height: phoneHeight }}
  resizeMode="contain"
  fadeDuration={0}
/>
        </Animated.View>

        <Animated.View
          style={[
            styles.copyBlock,
            {
              top: contentTop,
              left: 24,
              right: 24,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <AppText style={styles.title}>{currentSlide.title}</AppText>
          <AppText style={styles.description}>{currentSlide.description}</AppText>

          <View style={styles.paginationWrap}>
            {slides.map((slide, dotIndex) => {
              const isActive = dotIndex === activeIndex;

              return (
                <View
                  key={slide.id}
                  style={[
                    styles.dot,
                    isActive && styles.dotActive,
                    isActive && styles.dotActiveLong,
                  ]}
                />
              );
            })}
          </View>
        </Animated.View>

        <View
          style={[
            styles.footer,
            {
              minHeight: footerHeight,
              paddingBottom: Math.max(safeBottom, 16),
              paddingHorizontal: 24,
            },
          ]}
        >
          {!isFirst ? (
            <Pressable
              onPress={handleBack}
              hitSlop={10}
              style={styles.ctaButton}
            >
              <AppText style={styles.backArrow}>←</AppText>
              <AppText style={styles.backText}>BACK</AppText>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            onPress={handleContinue}
            hitSlop={10}
            style={styles.ctaButton}
          >
            <AppText style={styles.ctaText}>
              {isLast ? "GET STARTED" : "PROCEED"}
            </AppText>
            <AppText style={styles.ctaArrow}>→</AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F4DE",
  },

  page: {
    flex: 1,
    backgroundColor: "#F8F4DE",
    overflow: "hidden",
  },

  greenLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: "hidden",
    // Background set directly here — absoluteFillObject children no longer
    // auto-compute dimensions in the New Architecture (RN 0.86+).
    backgroundColor: Theme.colors.primary,
  },

  greenTopSlant: {
    position: "absolute",
    left: -80,
    right: -80,
    top: -110,
    height: 180,
    backgroundColor: "#F8F4DE",
    transform: [{ rotate: "-8deg" }],
    zIndex: 3,
  },

  greenBottomSlant: {
    position: "absolute",
    left: -200,
    right: -200,
    bottom: -92,
    height: 96,
    backgroundColor: "#F8F4DE",
    transform: [{ rotate: "-15deg" }],
    zIndex: 3,
  },

  phoneWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
  },

  phoneImage: {
    width: "86%",
    maxWidth: 360,
    aspectRatio: 390 / 525,
  },

  copyBlock: {
    position: "absolute",
    zIndex: 4,
  },

  title: {
    fontSize: 33,
    lineHeight: 38,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.heading.semibold,
    letterSpacing: -0.7,
  },

  description: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(255,255,255,0.88)",
  },

  paginationWrap: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  dotActive: {
    backgroundColor: Theme.colors.white,
  },

  dotActiveLong: {
    width: 24,
    borderRadius: 4,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F8F4DE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5,
    paddingTop: 10,
  },

  ctaButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  ctaText: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    letterSpacing: 0.4,
  },

  ctaArrow: {
    fontSize: 20,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    marginTop: -1,
  },

  backText: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    letterSpacing: 0.4,
  },

  backArrow: {
    fontSize: 20,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    marginTop: -1,
  },
});