// File: components/layouts/AuthHeader.tsx
"use client";

import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { ShadcnThemeToggle } from "@/components/common/ShadcnThemeToggle";

export function AuthHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 lg:p-8 flex justify-between items-center z-10">
      <Link
        href="/"
        className="flex items-center space-x-3 group"
        aria-label="Back to Homepage"
      >
        <Logo className="h-8 w-8 text-neutral-800 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors" />
        <span className="text-h5 font-semibold text-neutral-800 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
          MicroFreelance
        </span>
      </Link>
      <ShadcnThemeToggle />
    </header>
  );
}
