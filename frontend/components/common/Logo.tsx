import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  width?: number;
  height?: number;
}

/**
 * A reusable VISUAL logo component. It does NOT contain a Link tag.
 * The parent component is responsible for wrapping it in a Link.
 */
export function Logo({
  className,
  showText = true,
  width = 100,
  height = 100,
}: LogoProps) {
  return (
    <div
      className={cn("flex items-center space-x-2", className)}
      aria-label="MicroFreelance Logo"
    >
      <Image
        src="/logo.png"
        alt="MicroFreelance Logo"
        width={width}
        height={height}
        priority
      />
      {/* The text part remains the same */}
    </div>
  );
}
