import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import PublicShell from "./components/PublicShell";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CompareProvider } from "./context/CompareContext";
import { SettingsProvider } from "./context/SettingsContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Droguerie – Home Essentials",
  description: "Premium hardware, cleaning supplies, and professional tools for modern living.",
};

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationOverlay from "./components/NotificationOverlay";
import ScrollToTop from "./components/ScrollToTop";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <NotificationProvider>
            <SettingsProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <CartProvider>
                      <PublicShell>
                        {children}
                      </PublicShell>
                      <NotificationOverlay />
                      <ScrollToTop />
                    </CartProvider>
                  </CompareProvider>
                </WishlistProvider>
              </AuthProvider>
            </SettingsProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


