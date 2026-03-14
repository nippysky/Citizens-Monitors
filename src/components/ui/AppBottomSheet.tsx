import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { forwardRef, ReactNode, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  subtitleIcon?: React.ReactNode;
  children: ReactNode;
  snapPoints?: string[];
  onDismiss?: () => void;
};

const AppBottomSheet = forwardRef<BottomSheetModal, Props>(function AppBottomSheet(
  { title, subtitleIcon, children, snapPoints, onDismiss },
  ref
) {
  const insets = useSafeAreaInsets();
  const points = useMemo(() => snapPoints ?? ["82%"], [snapPoints]);

  const handleClose = () => {
    if (ref && typeof ref !== "function" && ref.current) {
      ref.current.dismiss();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={points}
      topInset={insets.top + 12}
      onDismiss={onDismiss}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.32}
          pressBehavior="close"
        />
      )}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.transparent}
    >
      <BottomSheetView style={styles.sheetWrap}>
        <LinearGradient
          colors={["#F8F4DE", "#FBFAF3", "#FEFEFC"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBg}
        />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppText variant="title" style={styles.title}>
              {title}
            </AppText>
            {subtitleIcon}
          </View>

          <Pressable onPress={handleClose} hitSlop={8} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <BottomSheetScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 20, 28) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default AppBottomSheet;

const styles = StyleSheet.create({
  transparent: {
    backgroundColor: "transparent",
  },

  handle: {
    backgroundColor: "rgba(17, 26, 50, 0.12)",
    width: 44,
  },

  sheetWrap: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    backgroundColor: "transparent",
  },

  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    minHeight: 76,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 18,
    lineHeight: 24,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#D9DEE8",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
});