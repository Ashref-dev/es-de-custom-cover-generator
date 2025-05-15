import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/Navigation";
import { GamepadIcon } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | ES-DE Media Manager",
    default: "ES-DE Media Manager",
  },
  description: "Generate and manage media files for Emulation Station Desktop Edition",
  keywords: ["emulation", "esde", "emulation station desktop edition", "media", "manager"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <main className="min-h-screen py-4">
            {children}
          </main>
          <footer className="py-6 border-t">
            <div className="container mx-auto px-4 flex items-center justify-center text-sm text-muted-foreground">
              <GamepadIcon className="h-4 w-4 gradient-icon mr-2" />
              <p>ES-DE Media Manager &copy; {new Date().getFullYear()}</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
