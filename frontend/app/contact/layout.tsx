import type React from "react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function VillaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
