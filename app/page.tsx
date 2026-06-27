"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";

import AnimatedBackground from "@/components/ui/AnimatedBackground";

import Navbar from "@/components/layout/Navbar";
import ScrollProgress from "@/components/layout/ScrollProgress";

import Hero from "@/components/home/Hero";

const Features = dynamic(() => import("@/components/home/Features"), {
  loading: () => <div className="h-80 bg-[#030712]" />,
});
const Stats = dynamic(() => import("@/components/home/Stats"), {
  loading: () => <div className="h-80 bg-[#030712]" />,
});
const PopularTools = dynamic(() => import("@/components/home/PopularTools"), {
  loading: () => <div className="h-96 bg-[#030712]" />,
});
const Ecosystem = dynamic(() => import("@/components/home/Ecosystem"), {
  loading: () => <div className="h-96 bg-[#030712]" />,
});
const CTA = dynamic(() => import("@/components/home/CTA"), {
  loading: () => <div className="h-80 bg-[#030712]" />,
});
const Footer = dynamic(() => import("@/components/layout/Footer"), {
  loading: () => <div className="h-40 bg-black" />,
});

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.main
      id="main-content"
      className="relative overflow-hidden bg-[#030712] text-white"
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <ScrollProgress />

      <AnimatedBackground />

      <Navbar />

      <Hero />

      <Features />

      <Stats />

      <PopularTools />

      <Ecosystem />

      <CTA />

      <Footer />
    </motion.main>
  );
}