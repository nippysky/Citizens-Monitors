// ─── src/components/pulse/PulsePostButton.tsx ────────────────────────────────
import { Entypo } from "@expo/vector-icons";

import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { Theme } from "@/theme";

type Props = {
  onPress: () => void;
  collapsed?: boolean;
};

export default function PulsePostButton({ onPress, collapsed = false }: Props) {
  return (
    <FloatingActionButton
      onPress={onPress}
      collapsed={collapsed}
      label="Post"
      expandedWidth={114}
      icon={<Entypo name="chat" size={20} color={Theme.colors.white} />}
      accessibilityLabel="Share a Pulse post"
    />
  );
}
