import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { NotificationProvider } from "@/contexts/NotificationContext";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "InkMatch | Encuentra a tu Tatuador Ideal",
  description: "Conecta con los mejores artistas del tatuaje.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable} min-h-screen bg-background text-foreground antialiased`} suppressHydrationWarning>
        <NotificationProvider>
          <Suspense>
            <Navbar />
          </Suspense>
          <main>
            {children}
          </main>
        </NotificationProvider>
      </body>
    </html>
  );
}
