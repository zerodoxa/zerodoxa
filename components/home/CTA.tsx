"use client";

import Button from "@/components/ui/Button";
import FadeIn from "@/components/animations/FadeIn";
import SectionLayout from "@/components/layout/SectionLayout";

export default function CTA() {
  return (
    <SectionLayout id="contact" className="relative overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[180px] sm:h-[420px] sm:w-[420px]" />

      <FadeIn>
        <div className="relative rounded-[24px] border border-gray-800 bg-gray-900/60 p-6 text-center backdrop-blur-xl sm:rounded-[32px] sm:p-8 lg:p-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Ready to Simplify
            <br />
            Every File?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-gray-400 sm:mt-6 sm:text-lg sm:leading-8">
            Join Zerodoxa and experience a modern ecosystem of powerful file
            tools built for speed, privacy and simplicity.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Button variant="primary" className="w-full sm:w-auto">
              Explore Tools
            </Button>

            <Button variant="secondary" className="w-full sm:w-auto">
              Contact Us
            </Button>
          </div>
        </div>
      </FadeIn>
    </SectionLayout>
  );
}