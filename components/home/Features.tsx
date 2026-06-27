"use client";

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

import SlideUp from "@/components/animations/SlideUp";
import SectionLayout from "@/components/layout/SectionLayout";

import { features } from "../data/features";

export default function Features() {
  return (
    <SectionLayout id="features">
      <SlideUp>
        <SectionTitle
          badge="Why Zerodoxa?"
          title="Built for Speed, Security and Simplicity"
          subtitle="Everything you need to manage files efficiently with modern technology and a beautiful experience."
        />
      </SlideUp>

      <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <SlideUp key={feature.title} delay={index * 0.15}>
              <Card className="flex h-full flex-col hover:shadow-[0_20px_60px_rgba(37,99,235,0.16)]">
                <div className="mb-5 inline-flex rounded-2xl bg-blue-600/20 p-4 sm:mb-6">
                  <Icon className="h-7 w-7 text-blue-400 transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8" />
                </div>

                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-400 sm:mt-4">
                  {feature.description}
                </p>
              </Card>
            </SlideUp>
          );
        })}
      </div>
    </SectionLayout>
  );
}