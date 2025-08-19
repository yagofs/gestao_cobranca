import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={cn("font-bold text-primary flex items-center gap-2", sizeClasses[size], className)}>
      <span>Gestor de Cobrança</span>
    </div>
  );
};