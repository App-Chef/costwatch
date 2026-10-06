"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

const FAQ_ITEMS = [
  {
    question: "What is Costwatch?",
    answer:
      "Costwatch is an open-source application that helps you track all costs associated with running your software product, including hosting, databases, APIs, domains, and subscriptions. It calculates your monthly operating costs, tracks revenue, and shows your actual profit margin.",
  },
  {
    question: "Is Costwatch free?",
    answer:
      "Yes, Costwatch is completely free and open source under the MIT license. You can self-host it on your own infrastructure at no cost, or use a hosted version if available.",
  },
  {
    question: "How does Costwatch calculate monthly costs?",
    answer:
      "Costwatch converts all recurring costs to monthly equivalents: yearly costs are divided by 12, quarterly by 3, and custom intervals by their length. This gives you a clear picture of your actual monthly operating cost.",
  },
  {
    question: "Can I track multiple products?",
    answer:
      "Yes, Costwatch supports multiple products, each with its own currency. You can easily switch between products and track costs, revenue, and profit separately for each.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Yes, Costwatch uses Postgres Row Level Security (RLS) to protect every row of data. When self-hosted, your financial data never leaves infrastructure you control. All data is private by default.",
  },
  {
    question: "Do I need to connect my bank or payment processor?",
    answer:
      "No, Costwatch doesn't connect to banks or payment processors. You manually enter costs and revenue, giving you full control over what data is tracked. This takes just seconds and keeps your data completely private.",
  },
  {
    question: "What's the difference between Costwatch and accounting software?",
    answer:
      "Costwatch is not accounting software. It doesn't handle invoicing, taxes, payroll, or bank connections. It's specifically designed to give software developers and product owners a clear view of their operating costs and profit margins.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes, Costwatch provides CSV export for both costs and revenue data. You can also delete your account completely at any time.",
  },
  {
    question: "What tech stack does Costwatch use?",
    answer:
      "Costwatch is built with Next.js 16, TypeScript, Tailwind CSS 4, and Supabase (PostgreSQL, Auth, Row Level Security). There's no separate backend server—the Next.js app communicates directly with Supabase.",
  },
  {
    question: "How do I self-host Costwatch?",
    answer:
      "Clone the repository, start Supabase locally with Docker, configure your environment variables, and run npm install && npm run dev. Full instructions are available in the self-hosting documentation.",
  },
];

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-ink"
        aria-expanded={isOpen}
      >
        <span className="flex-1 font-semibold">{question}</span>
        <ChevronDownIcon
          className={`mt-1 shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          size={20}
          aria-hidden="true"
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-[15px] leading-relaxed text-ink-2">{answer}</p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-20 border-t border-line bg-card">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-accent-ink">FAQ</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">
            Everything you need to know about Costwatch.
          </p>
        </div>
        <div className="mt-12 rounded-md border border-line bg-paper">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          Still have questions?{" "}
          <a href="https://github.com/App-Chef/costwatch/discussions" className="font-semibold text-accent-ink hover:underline">
            Start a discussion on GitHub
          </a>
        </p>
      </div>
    </section>
  );
}
