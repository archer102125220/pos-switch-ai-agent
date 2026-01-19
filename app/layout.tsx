import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS Switch AI Agent",
  description: "Universal POS System for all business types",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Just pass children through - [locale]/layout.tsx handles html/body/fonts
  return children;
}

