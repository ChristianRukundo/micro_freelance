import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const logoVariants = cva(
  "flex items-center gap-3 font-semibold tracking-wider transition-colors",
  {
    variants: {
      size: {
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-3",
        xl: "gap-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const imageVariants = cva("transition-all", {
  variants: {
    size: {
      sm: "h-8 w-8",
      md: "h-9 w-9",
      lg: "h-10 w-10",
      xl: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const textVariants = cva(
  "text-foreground hover:text-primary transition-colors",
  {
    variants: {
      size: {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
        xl: "text-3xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

interface LogoProps extends VariantProps<typeof logoVariants> {
  className?: string;

  textHidden?: boolean;

  href?: string;
}

export function Logo({
  className,
  size,
  textHidden = false,
  href = "/",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(logoVariants({ size }), className)}
      aria-label="Tura Heza Home"
    >
      <Image
        src="/logo.png"
        alt="Tura Heza Logo"
        width={512}
        height={512}
        priority
        className={cn(imageVariants({ size }))}
      />
      {!textHidden && (
        <span className={cn(textVariants({ size }))}>TURA HEZA</span>
      )}
    </Link>
  );
}
