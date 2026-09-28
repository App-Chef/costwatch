import { ProductForm } from "@/components/forms/product-form";
import { Card } from "@/components/ui/card";

export function Onboarding() {
  return (
    <div className="mx-auto max-w-xl py-6 sm:py-12">
      <p className="mb-2 text-sm font-semibold text-accent-ink">Welcome to Costwatch</p>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">What are you building?</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
        Start with one product. You&apos;ll add the services it depends on and the money it makes, and Costwatch will show you what
        it really costs to run.
      </p>
      <Card raised className="mt-8 p-5 sm:p-6">
        <ProductForm submitLabel="Create product" />
      </Card>
    </div>
  );
}
