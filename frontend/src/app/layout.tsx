import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InkMatch | Encuentra a tu Tatuador Ideal",
  description: "Marketplace premium de tatuadores. Explora portfolios, simula diseños y agenda tu turno en segundos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`} suppressHydrationWarning>
        <Suspense>
          <Navbar />
        </Suspense>
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}

