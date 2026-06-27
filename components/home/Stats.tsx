"use client";

import Card from "@/components/ui/Card";
import SlideUp from "@/components/animations/SlideUp";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import SectionLayout from "@/components/layout/SectionLayout";

import { stats } from "../data/stats";

export default function Stats() {
  return (
    <SectionLayout id="stats" className="relative overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px] sm:h-[350px] sm:w-[350px]" />

      <div className="relative z-10 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <SlideUp
                key={stat.subtitle}
                delay={index * 0.15}
              >
                <Card className="group flex min-h-[240px] flex-col items-center justify-center text-center sm:min-h-[260px] hover:shadow-[0_20px_60px_rgba(6,182,212,0.12)]">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 sm:mb-6 sm:h-20 sm:w-20">
                    <Icon className="h-8 w-8 text-blue-400 sm:h-10 sm:w-10" />
                  </div>

                  {stat.title === "25+" && (
                    <AnimatedCounter
                      value={25}
                      suffix="+"
                    />
                  )}

                  {stat.title === "100%" && (
                    <AnimatedCounter
                      value={100}
                      suffix="%"
                    />
                  )}

                  {stat.title === "24/7" && (
                    <h3 className="text-4xl font-extrabold text-white sm:text-5xl">24/7</h3>
                  )}

                  {stat.title === "Global" && (
                    <h3 className="text-4xl font-extrabold text-white sm:text-5xl">Global</h3>
                  )}

                  <p className="mt-3 text-sm text-gray-400 sm:mt-4 sm:text-base">
                    {stat.subtitle}
                  </p>

                </Card>
              </SlideUp>
            );
          })}
        </div>
    </SectionLayout>
  );
}