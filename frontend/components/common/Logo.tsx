import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /**
   * Additional classes for the container link element.
   */
  className?: string;
  /**
   * If true, displays the "MicroFreelance" text next to the logo image.
   * @default true
   */
  showText?: boolean;
  /**
   * The width of the logo image in pixels.
   * @default 32
   */
  width?: number;
  /**
   * The height of the logo image in pixels.
   * @default 32
   */
  height?: number;
}

/**
 * A reusable logo component for the MicroFreelance brand.
 * It links to the homepage and uses Next.js Image for optimization.
 */
export function Logo({
  className,
  showText = true,
  width = 100,
  height = 100,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center space-x-2 transition-opacity hover:opacity-80",
        className
      )}
      aria-label="MicroFreelance Homepage"
    >
      <Image
        src="/logo.png" // The path is relative to the `public` directory
        alt="MicroFreelance Logo"
        width={width}
        height={height}
        priority
      />
      {/* {showText && (
        <span className="text-xl font-bold gradient-text">MicroFreelance</span>
      )} */}
    </Link>
  );
}
