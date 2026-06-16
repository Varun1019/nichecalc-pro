import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Financial Equity & Freelance Arbitrage Calculator - NicheCalc Pro",
  description: "Enterprise-grade financial tools: compute freelance quarterly tax margins, target exam scores, and compare rent-to-own property equity projections with sub-millisecond efficiency.",
  keywords: ["freelance tax calculator", "arbitrage calculator", "grade calculator", "rent to own calculator", "estimated taxes", "lease equity"],
  authors: [{ name: "NicheCalc Analytics Team" }],
  openGraph: {
    title: "Financial Equity & Freelance Arbitrage Calculator Suite",
    description: "Enterprise-grade calculations for freelance tax, course grading, and home lease-option equity comparisons.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full scroll-smooth`}>
      <body className="bg-slate-dark text-slate-100 flex flex-col min-h-screen antialiased">
        <ServiceWorkerRegister />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
