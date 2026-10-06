import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { OrganizationSchema } from "@/components/seo/structured-data";

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
const title = "Costwatch | Know what your product actually costs";
const description = "Track your product costs, revenue, renewals, and profit in one place. Open source cost management for software products and SaaS businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Costwatch",
  },
  description,
  applicationName: "Costwatch",
  keywords: [
    "cost tracking",
    "product costs",
    "SaaS costs",
    "revenue tracking",
    "profit margin calculator",
    "subscription management",
    "operating expenses",
    "cost management",
    "business expenses",
    "recurring costs",
    "monthly costs calculator",
    "software costs",
    "hosting costs tracker",
    "financial tracking",
    "profit and loss",
    "open source",
    "self-hosted",
  ],
  authors: [{ name: "Costwatch" }],
  creator: "Costwatch",
  publisher: "Costwatch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Costwatch",
    title,
    description,
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Costwatch - Know what your product actually costs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
    creator: "@costwatch",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when ready
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#f6f5f0",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrains.variable}`}>
      <head>
        <OrganizationSchema />
      </head>
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
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
