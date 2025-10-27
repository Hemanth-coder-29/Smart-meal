// smartmeal-app/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SkipLink } from "@/components/common/SkipLink";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Import your context providers
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import { ShoppingListProvider } from "@/contexts/ShoppingListContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
// If you implement ThemeContext, import it too

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// ... (metadata remains the same)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Wrap children with providers */}
        <ErrorBoundary level="root" context="RootLayout">
          <ProfileProvider>
            <FavoritesProvider>
              <MealPlanProvider>
                <ShoppingListProvider>
                  <SkipLink href="#main-content">Skip to main content</SkipLink>
                  {children}
                </ShoppingListProvider>
              </MealPlanProvider>
            </FavoritesProvider>
          </ProfileProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}