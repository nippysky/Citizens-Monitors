import { Theme } from "@/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconProps = {
  size?: number;
  color?: string;
};

export function EmailIcon({
  size = 22,
  color = Theme.colors.textSoft,
}: IconProps) {
  return <MaterialCommunityIcons name="email-outline" size={size} color={color} />;
}

export function LockIcon({
  size = 22,
  color = Theme.colors.textSoft,
}: IconProps) {
  return <MaterialCommunityIcons name="lock-outline" size={size} color={color} />;
}

export function PersonIcon({
  size = 22,
  color = Theme.colors.textSoft,
}: IconProps) {
  return <MaterialCommunityIcons name="account-outline" size={size} color={color} />;
}