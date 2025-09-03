"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  Heart,
  Globe,
  Shield,
  Award,
  Users,
  Star,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const GlassCard = ({ children, className, ...props }: any) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      className={cn(
        "backdrop-blur-xl rounded-2xl shadow-xl",
        isDark
          ? "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
          : "bg-black/5 border border-black/10 hover:bg-black/10 hover:border-black/20",
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const AnimatedCounter = ({
  value,
  suffix = "",
  duration = 2,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = value / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="font-bold">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubscribed(true);
    toast({
      title: "Successfully subscribed!",
      description:
        "Thank you for joining our newsletter. You'll receive updates about new properties and exclusive offers.",
    });
    setEmail("");

    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <GlassCard className="p-8 relative overflow-hidden">
        {}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />

        {}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${60 + Math.sin(i) * 20}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>
            <h3
              className={cn(
                "text-2xl font-bold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Stay in the Loop
            </h3>
            <p
              className={cn(
                "text-center",
                isDark ? "text-white/80" : "text-gray-600"
              )}
            >
              Get exclusive access to new properties, special offers, and
              insider travel tips from Rwanda.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "pr-12 h-12 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300",
                  isDark
                    ? "bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
                    : "bg-gray-200 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500"
                )}
                required
              />
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  type="submit"
                  size="icon"
                  className="bg-gradient-to-r cursor-poi from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg w-8 h-8"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-400"
                    >
                      ✓
                    </motion.div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
            <p
              className={cn(
                "text-xs text-center",
                isDark ? "text-white/60" : "text-gray-600"
              )}
            >
              By subscribing, you agree to our Privacy Policy and Terms of
              Service.
            </p>
          </form>
        </div>
      </GlassCard>
    </motion.div>
  );
};

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

const StatsSection = () => {
  const stats = [
    { value: 500, suffix: "+", label: "Properties", icon: Globe },
    { value: 10000, suffix: "+", label: "Happy Guests", icon: Users },
    { value: 2500, suffix: "+", label: "5-Star Reviews", icon: Star },
    { value: 15, suffix: "+", label: "Awards Won", icon: Award },
  ];
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
          className="text-center"
        >
          <GlassCard className="p-6">
            <motion.div
              className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <stat.icon className="h-6 w-6 text-white" />
            </motion.div>
            <div
              className={cn(
                "text-2xl font-bold mb-1",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <div
              className={cn(
                "text-sm",
                isDark ? "text-white/70" : "text-gray-600"
              )}
            >
              {stat.label}
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.button
      className={cn(
        "fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full shadow-lg",
        "hover:shadow-xl hover:scale-110 transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        isDark
          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
          : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
      )}
      onClick={scrollToTop}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
    >
      <ChevronUp className="h-6 w-6 mx-auto" />
    </motion.button>
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
        {}
        {isDark && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent)]" />
          </>
        )}

        {}
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
          {}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
            <NewsletterSection />
          </div>

          {}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge
                className={cn(
                  "mb-4 backdrop-blur-sm",
                  isDark
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-gray-200 text-gray-700 border-gray-300"
                )}
              >
                Our Impact
              </Badge>
              <h3
                className={cn(
                  "text-3xl font-bold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Trusted by Thousands
              </h3>
              <p className={cn(isDark ? "text-white/70" : "text-gray-600")}>
                Join our growing community of satisfied guests and property
                owners
              </p>
            </motion.div>
            <StatsSection />
          </div>

          <Separator className={cn(isDark ? "bg-white/10" : "bg-gray-300")} />

          {}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
              {}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Link href="/" className="inline-block mb-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "text-3xl font-bold bg-clip-text text-transparent",
                      isDark
                        ? "bg-gradient-to-r from-white via-blue-100 to-purple-200"
                        : "bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500"
                    )}
                  >
                    TURA HEZA
                  </motion.div>
                </Link>
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

                {}
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

              {}
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

              {}
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

              {}
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

                {}
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

          {}
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

      <BackToTop />
    </>
  );
}
