"use client";

import SectionTitle from "@/components/ui/SectionTitle";
import SlideUp from "@/components/animations/SlideUp";
import SectionLayout from "@/components/layout/SectionLayout";

import EcosystemCard from "./EcosystemCard";

import { ecosystems } from "../data/ecosystem";

export default function Ecosystem() {
  return (
    <SectionLayout id="ecosystem" className="relative overflow-hidden">
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-500/10 blur-[120px]" />

      <SlideUp>
        <SectionTitle
          badge="Zerodoxa Ecosystem"
          title="One Platform. Every File Tool."
          subtitle="Everything you need to manage PDFs, images, videos, OCR, AI and files in one modern ecosystem."
        />
      </SlideUp>

      <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ecosystems.map((item, index) => (
          <SlideUp key={item.title} delay={index * 0.12}>
            <div className="transition-transform duration-500 ease-out hover:-translate-y-1">
              <EcosystemCard {...item} />
            </div>
          </SlideUp>
        ))}
      </div>
    </SectionLayout>
  );
}