import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  message?: string;
};

export default function FormFieldError({ message }: Props) {
  if (!message) return null;

  return (
    <AppText
      variant="caption"
      style={{
        color: Theme.colors.danger,
        marginTop: 2,
      }}
    >
      {message}
    </AppText>
  );
}