import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const navigation = [
  { href: "#systems", label: "Systems" },
  { href: "#visibility", label: "Visibility" },
  { href: "#rhythm", label: "Rhythm" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/10 bg-background/82 backdrop-blur-2xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Aligned Insights home">
          <Logo />
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 text-sm font-medium text-foreground/66 md:flex"
        >
          {navigation.map((item) => (
            <a
              className="transition hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="rounded-md border border-foreground/12 px-4 py-2 text-sm font-semibold transition hover:border-accent/70 hover:text-foreground"
          href="mailto:hello@alignedinsights.tech"
        >
          Connect
        </a>
      </div>
    </header>
  );
}
