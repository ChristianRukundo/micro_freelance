"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/user-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CommandDialog } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Logo } from "./logo";

const navItems = [
  { name: "Villas", href: "/villas" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activePath = navItems.find((item) => pathname === item.href)?.href;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-lg"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 relative">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium tracking-wider transition-colors relative",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.name}
              {activePath === item.href && (
                <motion.span
                  layoutId="active-nav-link"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions & Mobile Menu Trigger */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              <div className="h-9 w-24 bg-muted/50 animate-pulse rounded-md" />
            ) : user ? (
              <UserNav user={user} onLogout={logout} />
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-shadow"
                >
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={isMobileMenuOpen ? "x" : "menu"}
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                  </motion.div>
                </AnimatePresence>
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[80vw] bg-background/95 backdrop-blur-lg"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center py-4 border-b">
                  <Link
                    href="/"
                    className="font-bold text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    TURA HEZA
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "text-lg font-medium",
                        pathname === item.href
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <Separator className="my-8" />
                <div className="flex flex-col gap-4">
                  {isLoading ? (
                    <div className="h-10 w-full bg-muted/50 animate-pulse rounded-md" />
                  ) : user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-medium"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/favorites"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-medium"
                      >
                        Favorites
                      </Link>
                      {user.role === "AGENT" && (
                        <Link
                          href="/agent"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-lg font-medium"
                        >
                          Dashboard
                        </Link>
                      )}
                      <Button onClick={logout} variant="outline">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/auth/login">Login</Link>
                      </Button>
                      <Button
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/auth/register">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Input
          placeholder="Type a command or search..."
          className="border-0 focus-visible:ring-0"
        />
      </CommandDialog>
    </motion.header>
  );
}
