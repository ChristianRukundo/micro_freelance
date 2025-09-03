"use client"

import { motion } from "framer-motion"

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const FadeIn = ({ children, delay = 0, ...props }: any) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.5, delay } },
    }}
    {...props}
  >
    {children}
  </motion.div>
)

export const SlideUp = ({ children, delay = 0, ...props }: any) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay } },
    }}
    {...props}
  >
    {children}
  </motion.div>
)

export const SlideIn = ({ children, direction = "left", delay = 0, ...props }: any) => {
  const variants = {
    hidden: {
      x: direction === "left" ? -20 : direction === "right" ? 20 : 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, delay },
    },
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={variants} {...props}>
      {children}
    </motion.div>
  )
}

export const StaggerChildren = ({ children, ...props }: any) => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} {...props}>
    {children}
  </motion.div>
)

export const StaggerItem = ({ children, ...props }: any) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    }}
    {...props}
  >
    {children}
  </motion.div>
)

export const ScaleIn = ({ children, delay = 0, ...props }: any) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { scale: 0.9, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { duration: 0.5, delay } },
    }}
    {...props}
  >
    {children}
  </motion.div>
)
