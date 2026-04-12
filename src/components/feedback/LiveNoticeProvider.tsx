// ─── src/components/feedback/LiveNoticeProvider.tsx ───────────────────────────
import GlobalLiveNotice from "@/components/feedback/GlobalLiveNotice";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ShowNoticeArgs = {
  message: string;
  actionLabel?: string;
  onPress?: () => void;
};

type LiveNoticeContextValue = {
  showNotice: (args: ShowNoticeArgs) => void;
  hideNotice: () => void;
};

const LiveNoticeContext = createContext<LiveNoticeContextValue | null>(null);

export function LiveNoticeProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [message, setMessage] = useState("");
  const [actionLabel, setActionLabel] = useState<string | undefined>();
  const [actionHandler, setActionHandler] = useState<(() => void) | undefined>();

  const showNotice = useCallback(
    ({ message, actionLabel, onPress }: ShowNoticeArgs) => {
      setMessage(message);
      setActionLabel(actionLabel);
      setActionHandler(() => onPress);
      setRendered(true);
      requestAnimationFrame(() => setVisible(true));
    },
    []
  );

  const hideNotice = useCallback(() => {
    setVisible(false);
  }, []);

  const value = useMemo(() => ({ showNotice, hideNotice }), [showNotice, hideNotice]);

  return (
    <LiveNoticeContext.Provider value={value}>
      {children}
      {rendered ? (
        <GlobalLiveNotice
          visible={visible}
          message={message}
          actionLabel={actionLabel}
          onPressAction={actionHandler}
          onHide={() => setRendered(false)}
        />
      ) : null}
    </LiveNoticeContext.Provider>
  );
}

export function useLiveNotice() {
  const ctx = useContext(LiveNoticeContext);
  if (!ctx) throw new Error("useLiveNotice must be used within LiveNoticeProvider");
  return ctx;
}