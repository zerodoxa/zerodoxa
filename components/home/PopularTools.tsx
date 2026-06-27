"use client";

import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import SlideUp from "@/components/animations/SlideUp";
import SectionLayout from "@/components/layout/SectionLayout";

import { tools } from "../data/tools";

export default function PopularTools() {
  return (
    <SectionLayout id="tools" className="relative overflow-hidden">
      <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <SlideUp>
          <SectionTitle
            badge="Popular Tools"
            title="Everything You Need in One Place"
            subtitle="Powerful online tools built for speed, simplicity and security."
          />
        </SlideUp>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <SlideUp key={tool.title} delay={index * 0.12}>
                <Card className="group flex h-full cursor-pointer flex-col hover:shadow-[0_20px_60px_rgba(59,130,246,0.16)]">
                  <div
                    className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color} p-4 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 sm:mb-6 sm:h-16 sm:w-16 sm:p-5`}
                  >
                    <Icon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                  </div>

                  <h3 className="text-xl font-bold text-white sm:text-2xl">
                    {tool.title}
                  </h3>

                  <p className="mt-3 flex-1 leading-7 text-gray-400 sm:mt-4">
                    {tool.description}
                  </p>

                  <button className="mt-5 font-semibold text-blue-400 transition-all duration-300 ease-out group-hover:translate-x-2 group-hover:text-cyan-300 sm:mt-6">
                    Open Tool →
                  </button>
                </Card>
              </SlideUp>
            );
          })}
        </div>
    </SectionLayout>
  );
}