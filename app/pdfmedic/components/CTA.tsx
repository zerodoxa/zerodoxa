"use client";

import FadeIn from "@/components/animations/FadeIn";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function CTA() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#030712] py-28"
    >
      <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[180px]" />

      <Container>
        <FadeIn>
          <div className="relative rounded-[32px] border border-gray-800 bg-gray-900/60 p-12 text-center backdrop-blur-xl">
            <h2 className="text-4xl font-extrabold text-white md:text-6xl">
              Ready to Launch
              <br />
              PDFMedic?
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-400">
              The module is structured for deeper PDF workflows, API
              integrations and future Medic product expansion.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="primary">Start Processing</Button>
              <Button variant="secondary">View Ecosystem</Button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
