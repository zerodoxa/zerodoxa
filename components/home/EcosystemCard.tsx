"use client";

import Card from "@/components/ui/Card";

type Props = {
  title: string;
  description: string;
  icon: any;
  color: string;
};

export default function EcosystemCard({
  title,
  description,
  icon: Icon,
  color,
}: Props) {
  return (
    <Card className="group flex h-[360px] cursor-pointer flex-col">

      <div
        className={`mb-6 inline-flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br ${color} p-5 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}
      >
        <Icon className="h-8 w-8 text-white" />
      </div>

      <h3 className="text-2xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-4 flex-1 leading-7 text-gray-400">
        {description}
      </p>

      <button className="mt-6 font-semibold text-blue-400 transition-all duration-300 group-hover:translate-x-2">
        Explore →
      </button>

    </Card>
  );
}