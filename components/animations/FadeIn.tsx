"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
};

export default function FadeIn({
  children,
  delay = 0,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.01 }
          : {
              duration: 0.7,
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