import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SkipLink } from "@/components/common/SkipLink";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Smart Meal - AI Recipe & Nutrition Planner",
  description: "Transform ingredients into delicious meals with intelligent recipe matching, nutrition tracking, and meal planning.",
  keywords: ["recipes", "meal planning", "nutrition", "cooking", "ingredients", "meal prep"],
  authors: [{ name: "Smart Meal" }],
  openGraph: {
    title: "Smart Meal - AI Recipe & Nutrition Planner",
    description: "Transform ingredients into delicious meals",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary level="root" context="RootLayout">
          <SkipLink href="#main-content">Skip to main content</SkipLink>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
