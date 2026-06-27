import clsx from "clsx";
import { ReactNode } from "react";

import Container from "@/components/ui/Container";

type SectionLayoutProps = {
  children: ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  withContainer?: boolean;
};

export default function SectionLayout({
  children,
  id,
  className,
  containerClassName,
  withContainer = true,
}: SectionLayoutProps) {
  return (
    <section
      id={id}
      className={clsx(
        "relative overflow-hidden bg-[#030712] py-20 sm:py-24 lg:py-28",
        className
      )}
    >
      {withContainer ? (
        <Container className={containerClassName}>{children}</Container>
      ) : (
        children
      )}
    </section>
  );
}
