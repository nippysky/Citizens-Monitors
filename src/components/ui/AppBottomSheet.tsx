import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
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
        />
      )}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.transparent}
    >
      <LinearGradient
        colors={["#F8F4DE", "#FBFAF3", "#FEFEFC"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.sheet}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppText variant="title" style={styles.title}>
              {title}
            </AppText>
            {subtitleIcon}
          </View>

          <Pressable onPress={onDismiss} hitSlop={8} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <BottomSheetScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 18 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </BottomSheetScrollView>
      </LinearGradient>
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
  sheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
});