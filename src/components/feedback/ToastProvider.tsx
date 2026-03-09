import GlobalToast, { ToastType } from "@/components/feedback/GlobalToast";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type ShowToastArgs = {
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (args: ShowToastArgs) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");

  const showToast = useCallback(({ message, type }: ShowToastArgs) => {
    setMessage(message);
    setType(type);
    setVisible(false);

    requestAnimationFrame(() => {
      setVisible(true);
    });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <GlobalToast
        visible={visible}
        message={message}
        type={type}
        onHide={() => setVisible(false)}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }

  return context;
}