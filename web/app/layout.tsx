import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description = "Track your product costs, revenue, renewals, and profit in one place.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Costwatch | Know what your product actually costs",
    template: "%s | Costwatch",
  },
  description,
  applicationName: "Costwatch",
  openGraph: {
    type: "website",
    siteName: "Costwatch",
    title: "Costwatch | Know what your product actually costs",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Costwatch | Know what your product actually costs",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f0",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:border focus:border-ink focus:bg-card focus:px-4 focus:py-2 focus:font-semibold focus:shadow-hard"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
