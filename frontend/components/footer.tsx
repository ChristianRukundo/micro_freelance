"use client";

import type React from "react";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart,
  Shield,
  Award,
  ExternalLink,
  Globe,
} from "lucide-react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Logo } from "./logo";

const SocialLinks = () => {
  const socialLinks = [
    {
      icon: FaFacebook,
      href: "#",
      label: "Facebook",
      color: "hover:text-blue-400",
    },
    {
      icon: FaTwitter,
      href: "#",
      label: "Twitter",
      color: "hover:text-sky-400",
    },
    {
      icon: FaInstagram,
      href: "#",
      label: "Instagram",
      color: "hover:text-pink-400",
    },
    {
      icon: FaLinkedin,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-600",
    },
    {
      icon: FaYoutube,
      href: "#",
      label: "YouTube",
      color: "hover:text-red-500",
    },
  ];
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex justify-center gap-4">
      {socialLinks.map((social, index) => (
        <motion.div
          key={social.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ y: -5, scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href={social.href}
            className={cn(
              "w-12 h-12 rounded-xl backdrop-blur-sm border flex items-center justify-center text-white/70 transition-all duration-300",
              isDark
                ? "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40"
                : "bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300 hover:border-gray-400",
              social.color,
              "hover:shadow-lg"
            )}
            aria-label={social.label}
          >
            <social.icon size={20} />
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export function Footer() {
  const footerRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Properties", href: "/villas" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Refund Policy", href: "/refund" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help" },
    { name: "Safety", href: "/safety" },
    { name: "Accessibility", href: "/accessibility" },
    { name: "Cancellation", href: "/cancellation" },
  ];

  return (
    <>
      <footer
        ref={footerRef}
        className={cn(
          "relative overflow-hidden",
          isDark
            ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white"
            : "bg-gray-100 text-gray-800"
        )}
      >
        {/* Decorative background gradients for dark mode */}
        {isDark && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent)]" />
          </>
        )}

        {/* Floating particles for dark mode */}
        {isDark && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 8 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10">
          {/* Removed NewsletterSection and Trusted By Thousands section */}

          <Separator className={cn(isDark ? "bg-white/10" : "bg-gray-300")} />

          {/* Main Footer Links & Contact */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
              {/* Company Info */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Logo size="lg" className="mb-6" />

                <p
                  className={cn(
                    "mb-6 leading-relaxed max-w-md",
                    isDark ? "text-white/80" : "text-gray-600"
                  )}
                >
                  Discover Rwanda&apos;s most exceptional luxury properties. We
                  curate unforgettable experiences in the land of a thousand
                  hills, where every stay becomes a cherished memory.
                </p>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <motion.div
                    className={cn(
                      "flex items-center transition-colors",
                      isDark
                        ? "text-white/70 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                    whileHover={{ x: 5 }}
                  >
                    <MapPin className="h-5 w-5 mr-3 text-blue-400" />
                    <span>Kigali, Rwanda</span>
                  </motion.div>
                  <motion.div
                    className={cn(
                      "flex items-center transition-colors",
                      isDark
                        ? "text-white/70 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                    whileHover={{ x: 5 }}
                  >
                    <Phone className="h-5 w-5 mr-3 text-green-400" />
                    <span>+250 788 123 456</span>
                  </motion.div>
                  <motion.div
                    className={cn(
                      "flex items-center transition-colors",
                      isDark
                        ? "text-white/70 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                    whileHover={{ x: 5 }}
                  >
                    <Mail className="h-5 w-5 mr-3 text-purple-400" />
                    <span>hello@turaheza.com</span>
                  </motion.div>
                </div>

                <SocialLinks />
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h4
                  className={cn(
                    "font-semibold mb-6 text-lg",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "transition-all duration-300 flex items-center group",
                          isDark
                            ? "text-white/70 hover:text-white"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Support Links */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h4
                  className={cn(
                    "font-semibold mb-6 text-lg",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Support
                </h4>
                <ul className="space-y-3">
                  {supportLinks.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "transition-all duration-300 flex items-center group",
                          isDark
                            ? "text-white/70 hover:text-white"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Legal Links & Badges */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h4
                  className={cn(
                    "font-semibold mb-6 text-lg",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Legal
                </h4>
                <ul className="space-y-3">
                  {legalLinks.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "transition-all duration-300 flex items-center group",
                          isDark
                            ? "text-white/70 hover:text-white"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        <ExternalLink className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {/* Security & Awards Badges */}
                <div className="mt-8 space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "flex items-center transition-colors",
                      isDark
                        ? "text-white/70 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <Shield className="h-5 w-5 mr-2 text-green-400" />
                    <span className="text-sm">SSL Secured</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "flex items-center transition-colors",
                      isDark
                        ? "text-white/70 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <Award className="h-5 w-5 mr-2 text-yellow-400" />
                    <span className="text-sm">Award Winning</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          <Separator className={cn(isDark ? "bg-white/10" : "bg-gray-300")} />

          {/* Copyright and Bottom Links */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              className="flex flex-col md:flex-row justify-between items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div
                className={cn(
                  "flex items-center text-sm",
                  isDark ? "text-white/70" : "text-gray-600"
                )}
              >
                <span>© 2024 Tura Heza. Made with</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mx-1"
                >
                  <Heart className="h-4 w-4 text-red-400 fill-current" />
                </motion.div>
                <span>in Rwanda</span>
              </div>

              <div
                className={cn(
                  "flex items-center gap-6 text-sm",
                  isDark ? "text-white/70" : "text-gray-600"
                )}
              >
                <Link
                  href="/sitemap"
                  className={cn(
                    "transition-colors",
                    isDark ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Sitemap
                </Link>
                <Link
                  href="/accessibility"
                  className={cn(
                    "transition-colors",
                    isDark ? "hover:text-white" : "hover:text-gray-900"
                  )}
                >
                  Accessibility
                </Link>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  <span>English (US)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </>
  );
}
