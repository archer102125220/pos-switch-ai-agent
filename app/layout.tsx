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
  title: "POS Switch AI Agent",
  description: "Universal POS System for all business types",
};

// Font class names for use in locale layout
export const fontVariables = `${geistSans.variable} ${geistMono.variable} antialiased`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Just pass children through - [locale]/layout.tsx handles html/body
  return children;
}
