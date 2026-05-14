type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative grid size-9 place-items-center overflow-hidden rounded-md border border-foreground/10 bg-background">
        <div className="absolute inset-x-2 top-2 h-px bg-accent" />
        <div className="absolute bottom-2 left-2 top-2 w-px bg-foreground" />
        <div className="absolute bottom-2 right-2 top-2 w-px bg-foreground/40" />
        <div className="absolute bottom-2 left-2 right-2 h-px bg-foreground/70" />
        <div className="size-2 rounded-full bg-accent shadow-[0_0_24px_rgb(32_217_255_/_0.7)]" />
      </div>
      <span className="text-sm font-semibold tracking-[0.16em] uppercase">
        Aligned Insights
      </span>
    </div>
  );
}
