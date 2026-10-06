import type { WebPage, Organization, SoftwareApplication, FAQPage, Question } from "schema-dts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function OrganizationSchema() {
  const organizationSchema: Organization = {
    "@type": "Organization",
    name: "Costwatch",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "Track your product costs, revenue, renewals, and profit in one place.",
    sameAs: [
      "https://github.com/App-Chef/costwatch",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          ...organizationSchema,
        }),
      }}
    />
  );
}

export function WebPageSchema({ title, description }: { title: string; description: string }) {
  const webPageSchema: WebPage = {
    "@type": "WebPage",
    name: title,
    description,
    url: siteUrl,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "Costwatch",
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          ...webPageSchema,
        }),
      }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const softwareSchema: SoftwareApplication = {
    "@type": "SoftwareApplication",
    name: "Costwatch",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    operatingSystem: "Web Browser",
    description: "Track your product costs, revenue, renewals, and profit in one place. Open source, self-hostable cost management for software products.",
    url: siteUrl,
    screenshot: `${siteUrl}/og-image.png`,
    featureList: [
      "Track recurring and one-time costs",
      "Monitor revenue and profit margins",
      "Track upcoming renewals",
      "Support multiple products and currencies",
      "Cost history tracking",
      "CSV export",
      "Row-level security",
    ],
    softwareVersion: "1.0",
    author: {
      "@type": "Organization",
      name: "Costwatch",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          ...softwareSchema,
        }),
      }}
    />
  );
}

export function FAQSchema() {
  const questions: Question[] = [
    {
      "@type": "Question",
      name: "What is Costwatch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Costwatch is an open-source application that helps you track all costs associated with running your software product, including hosting, databases, APIs, domains, and subscriptions. It calculates your monthly operating costs, tracks revenue, and shows your actual profit margin.",
      },
    },
    {
      "@type": "Question",
      name: "Is Costwatch free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Costwatch is completely free and open source under the MIT license. You can self-host it on your own infrastructure at no cost, or use a hosted version if available.",
      },
    },
    {
      "@type": "Question",
      name: "How does Costwatch calculate monthly costs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Costwatch converts all recurring costs to monthly equivalents: yearly costs are divided by 12, quarterly by 3, and custom intervals by their length. This gives you a clear picture of your actual monthly operating cost.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track multiple products?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Costwatch supports multiple products, each with its own currency. You can easily switch between products and track costs, revenue, and profit separately for each.",
      },
    },
    {
      "@type": "Question",
      name: "Is my financial data secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Costwatch uses Postgres Row Level Security (RLS) to protect every row of data. When self-hosted, your financial data never leaves infrastructure you control. All data is private by default.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to connect my bank or payment processor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, Costwatch doesn't connect to banks or payment processors. You manually enter costs and revenue, giving you full control over what data is tracked. This takes just seconds and keeps your data completely private.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between Costwatch and accounting software?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Costwatch is not accounting software. It doesn't handle invoicing, taxes, payroll, or bank connections. It's specifically designed to give software developers and product owners a clear view of their operating costs and profit margins.",
      },
    },
    {
      "@type": "Question",
      name: "Can I export my data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Costwatch provides CSV export for both costs and revenue data. You can also delete your account completely at any time.",
      },
    },
  ];

  const faqSchema: FAQPage = {
    "@type": "FAQPage",
    mainEntity: questions,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          ...faqSchema,
        }),
      }}
    />
  );
}
