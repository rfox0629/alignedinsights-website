import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin | Aligned Insights",
  robots: {
    follow: false,
    index: false,
  },
};

export const runtime = "nodejs";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
