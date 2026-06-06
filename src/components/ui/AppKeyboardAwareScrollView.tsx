import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  TextInput,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type KeyboardAwareContextValue = {
  notifyInputFocus: (input: TextInput | null) => void;
};

type Props = ScrollViewProps & {
  children: ReactNode;
  keyboardVerticalOffset?: number;
  extraScrollHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

const KeyboardAwareContext = createContext<KeyboardAwareContextValue | null>(
  null
);

export function useKeyboardAwareInput() {
  return useContext(KeyboardAwareContext);
}

export default function AppKeyboardAwareScrollView({
  children,
  keyboardVerticalOffset = 0,
  extraScrollHeight = 26,
  containerStyle,
  contentContainerStyle,
  onScroll,
  keyboardShouldPersistTaps = "handled",
  keyboardDismissMode,
  ...props
}: Props) {
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<ScrollView | null>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const scrollYRef = useRef(0);
  const keyboardTopRef = useRef<number | null>(null);
  const adjustTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdjustTimer = useCallback(() => {
    if (adjustTimerRef.current) {
      clearTimeout(adjustTimerRef.current);
      adjustTimerRef.current = null;
    }
  }, []);

  const scrollFocusedInputIntoView = useCallback(
    (animated = true) => {
      const input = focusedInputRef.current;

      if (!input) return;

      input.measureInWindow((_x, inputY, _width, inputHeight) => {
        const windowHeight = Dimensions.get("window").height;
        const keyboardTop = keyboardTopRef.current ?? windowHeight;

        const safeTop = insets.top + 12;
        const visibleBottom = keyboardTop - extraScrollHeight;
        const inputBottom = inputY + inputHeight;

        let nextScrollY = scrollYRef.current;

        if (inputBottom > visibleBottom) {
          nextScrollY += inputBottom - visibleBottom;
        } else if (inputY < safeTop) {
          nextScrollY -= safeTop - inputY;
        } else {
          return;
        }

        scrollRef.current?.scrollTo({
          y: Math.max(0, nextScrollY),
          animated,
        });
      });
    },
    [extraScrollHeight, insets.top]
  );

  const scheduleInputAdjustment = useCallback(
    (delay = 90) => {
      clearAdjustTimer();

      adjustTimerRef.current = setTimeout(() => {
        scrollFocusedInputIntoView(true);
      }, delay);
    },
    [clearAdjustTimer, scrollFocusedInputIntoView]
  );

  const notifyInputFocus = useCallback(
    (input: TextInput | null) => {
      focusedInputRef.current = input;

      scheduleInputAdjustment(80);
      scheduleInputAdjustment(220);
    },
    [scheduleInputAdjustment]
  );

  const handleKeyboardShow = useCallback(
    (event: KeyboardEvent) => {
      keyboardTopRef.current = event.endCoordinates.screenY;
      scheduleInputAdjustment(80);
      scheduleInputAdjustment(220);
    },
    [scheduleInputAdjustment]
  );

  const handleKeyboardHide = useCallback(() => {
    keyboardTopRef.current = null;
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      clearAdjustTimer();
      showSub.remove();
      hideSub.remove();
    };
  }, [clearAdjustTimer, handleKeyboardHide, handleKeyboardShow]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollYRef.current = event.nativeEvent.contentOffset.y;
      onScroll?.(event);
    },
    [onScroll]
  );

  return (
    <KeyboardAwareContext.Provider value={{ notifyInputFocus }}>
      <KeyboardAvoidingView
        style={[styles.container, containerStyle]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          ref={scrollRef}
          {...props}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          keyboardDismissMode={
            keyboardDismissMode ?? Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + 28, 40),
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </KeyboardAwareContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});