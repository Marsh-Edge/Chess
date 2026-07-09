import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/mode-toggle";
import { Toaster } from "sonner";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chess",
  description: "Professional chess platform",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`}
        </Script>
      </head>
      <body className={`${inter.className} min-h-dvh flex flex-col`}>
        <ThemeProvider>
          <TooltipProvider>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                  <Link href="/" className="font-bold text-lg tracking-tight">Chess</Link>
                  <nav className="hidden sm:flex items-center gap-4 text-sm">
                    <Link href="/play" className="text-muted-foreground hover:text-foreground transition-colors">Play</Link>
                    <Link href="/analysis" className="text-muted-foreground hover:text-foreground transition-colors">Analysis</Link>
                    <Link href="/openings" className="text-muted-foreground hover:text-foreground transition-colors">Openings</Link>
                    <Link href="/endgames" className="text-muted-foreground hover:text-foreground transition-colors">Endgames</Link>
                  </nav>
                </div>
                <ModeToggle />
              </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
