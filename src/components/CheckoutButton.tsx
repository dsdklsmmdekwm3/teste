import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  animate?: boolean;
  pulseDuration?: string;
}

export const CheckoutButton = ({
  children,
  onClick,
  disabled,
  loading,
  className,
  animate,
  pulseDuration = "3.5s",
}: CheckoutButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "w-full h-12 rounded-full font-semibold",
        "flex items-center justify-center gap-2",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:opacity-90",
        animate && "animate-pulse-scale",
        className || "bg-foreground text-background"
      )}
      style={animate ? { animationDuration: pulseDuration } : undefined}
    >
      <Lock className="w-4 h-4" />
      {loading ? "Processando..." : children}
    </button>
  );
};
