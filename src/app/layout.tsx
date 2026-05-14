import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alignedinsights.tech"),
  title: {
    default: "Aligned Insights",
    template: "%s | Aligned Insights",
  },
  description:
    "Operational clarity, financial systems, simplified reporting, and connected workflows for leadership teams.",
  openGraph: {
    title: "Aligned Insights",
    description:
      "A premium operating layer for financial clarity, cleaner workflows, and leadership visibility.",
    url: "https://alignedinsights.tech",
    siteName: "Aligned Insights",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
