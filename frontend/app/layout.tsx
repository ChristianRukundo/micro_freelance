import type React from "react";
import type { Metadata } from "next";
import "./global.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { AuthProviderWrapper } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Tura Heza | Find Your Dream Villa in Rwanda",
  description: "Discover and book luxury villas for your next vacation",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans`}>
        <AuthProviderWrapper>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex min-h-screen flex-col">
                <main className="flex-1">{children}</main>
                <Toaster />
              </div>
            </ThemeProvider>
          </Providers>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
