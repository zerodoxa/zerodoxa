"use client";

import SlideUp from "@/components/animations/SlideUp";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

import { pdfTools } from "../data/tools";

export default function ToolGrid() {
  return (
    <section
      id="tools"
      className="relative overflow-hidden bg-[#030712] py-24"
    >
      <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <Container>
        <SlideUp>
          <SectionTitle
            badge="PDF Tools"
            title="A Complete PDF Care Kit"
            subtitle="Start with the everyday tools teams need most, then expand the module as PDFMedic grows."
          />
        </SlideUp>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pdfTools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <SlideUp
                key={tool.title}
                delay={index * 0.12}
              >
                <Card className="flex h-[340px] cursor-pointer flex-col">
                  <div
                    className={`mb-6 inline-flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color} p-5 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    {tool.title}
                  </h3>

                  <p className="mt-4 flex-1 leading-7 text-gray-400">
                    {tool.description}
                  </p>

                  <button className="mt-6 text-left font-semibold text-blue-400 transition-all duration-300 group-hover:translate-x-2">
                    Open Tool
                  </button>
                </Card>
              </SlideUp>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
