import { type Metadata } from "next";
import { type ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS Switch AI Agent",
  description: "Universal POS System for all business types",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Just pass children through - [locale]/layout.tsx handles html/body/fonts
  return children;
}

