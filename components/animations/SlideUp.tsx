"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type SlideUpProps = {
  children: ReactNode;
  delay?: number;
};

export default function SlideUp({
  children,
  delay = 0,
}: SlideUpProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 1, y: 0, scale: 1 }
          : {
              opacity: 0,
              y: 36,
              scale: 0.98,
            }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.01 }
          : {
              duration: 0.8,
              delay,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}