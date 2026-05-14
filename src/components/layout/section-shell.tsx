import type { ReactNode } from "react";

type SectionShellProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
  children?: ReactNode;
  id?: string;
};

export function SectionShell({
  eyebrow,
  title,
  copy,
  children,
  id,
}: SectionShellProps) {
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-10 lg:py-32" id={id}>
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-accent uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-4xl leading-[0.96] font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h2>
          {copy ? (
            <p className="mt-6 text-lg leading-8 text-foreground/68">{copy}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
