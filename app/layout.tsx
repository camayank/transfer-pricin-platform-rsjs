import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('digicomply-theme');
                  if (theme === 'light' || theme === 'dark') {
                    document.documentElement.classList.add(theme);
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="dark">
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
