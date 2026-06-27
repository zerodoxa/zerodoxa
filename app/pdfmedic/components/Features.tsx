"use client";

import SlideUp from "@/components/animations/SlideUp";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

import { pdfFeatures } from "../data/tools";

export default function Features() {
  return (
    <section
      id="features"
      className="bg-[#030712] py-24"
    >
      <Container>
        <SlideUp>
          <SectionTitle
            badge="Built to Scale"
            title="The First Medic Product Module"
            subtitle="PDFMedic follows a route-local structure that ImageMedic, OCRMedic and VideoMedic can reuse."
          />
        </SlideUp>

        <div className="grid gap-8 md:grid-cols-3">
          {pdfFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <SlideUp
                key={feature.title}
                delay={index * 0.15}
              >
                <Card className="h-full">
                  <div className="mb-6 inline-flex rounded-2xl bg-blue-600/20 p-4">
                    <Icon className="h-8 w-8 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-4 leading-7 text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </SlideUp>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
