import { AuthBrandingPanel } from "@/components/layouts/AuthBrandingPanel";
import { AuthHeader } from "@/components/layouts/AuthHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-950 lg:grid lg:grid-cols-2">
      {/* Left Column: Branding (hidden on mobile) */}
      <AuthBrandingPanel />

      {/* Right Column: Form Area (full screen on mobile) */}
      <div className="relative flex flex-col">
        {/* The new header is placed here, positioned relative to this container */}
        <AuthHeader />

        {/* This main area now takes up the remaining space and centers the form card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 pt-24 lg:pt-12">
          {children}
        </main>
      </div>
    </div>
  );
}
