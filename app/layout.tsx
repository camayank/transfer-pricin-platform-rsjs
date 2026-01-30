import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DigiComply - Transfer Pricing Compliance Platform",
  description:
    "India's first dedicated Transfer Pricing SaaS platform for CA firms. Automate Form 3CEB, Safe Harbour analysis, benchmarking, and Master File generation.",
  keywords: [
    "transfer pricing",
    "form 3ceb",
    "safe harbour",
    "tax compliance",
    "CA firms",
    "benchmarking",
    "master file",
    "OECD BEPS",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
