import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";
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
  description:
    "Generate and manage media files for Emulation Station Desktop Edition",
  keywords: [
    "emulation",
    "esde",
    "emulation station desktop edition",
    "media",
    "manager",
  ],
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
          <main className="mx-auto min-h-screen max-w-7xl px-6 py-4">
            {children}
          </main>
          <footer className="border-t py-6">
            <div className="text-muted-foreground mx-auto flex items-center justify-center px-4 text-sm">
              <GamepadIcon className="gradient-icon mr-2 h-4 w-4" />
              <p>
                ES-DE Media Manager &copy; {new Date().getFullYear()} - made
                with ❤️ by{" "}
                <a
                  href="https://ashref.tn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Ashref
                </a>
              </p>
            </div>
          </footer>
          <Toaster 
            position="bottom-center"
            expand={true}
            richColors
            closeButton
            duration={4000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
