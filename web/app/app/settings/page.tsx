import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/account";
import { PageHeader } from "@/components/app/page-header";
import { ProductForm } from "@/components/forms/product-form";
import { DeleteAccountButton, DeleteProductButton, ProfileForm } from "@/components/forms/settings-forms";
import { LogoutIcon } from "@/components/icons";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { getActiveProduct } from "@/lib/data/products";
import { getProfile } from "@/lib/data/profile";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [product, profile] = await Promise.all([getActiveProduct(), getProfile()]);
  if (!product) redirect("/app");

  return (
    <>
      <PageHeader eyebrow={product.name} title="Settings" />
      <div className="flex max-w-3xl flex-col gap-6">
        <Card>
          <CardHeader title="Product" description="Name, description and the currency totals are calculated in." />
          <div className="p-5">
            <ProductForm product={product} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Your data" description="Costwatch data is yours. Download it any time as CSV." />
          <div className="flex flex-wrap gap-2 p-5">
            <a href="/app/export?type=costs" className={buttonClass("secondary")} download>
              Export costs
            </a>
            <a href="/app/export?type=revenue" className={buttonClass("secondary")} download>
              Export revenue
            </a>
          </div>
        </Card>

        <Card>
          <CardHeader title="Account" description={profile?.email ?? undefined} />
          <div className="flex flex-col gap-5 p-5">
            <ProfileForm name={profile?.name ?? null} />
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" className="-ml-2">
                <LogoutIcon size={16} />
                Sign out
              </Button>
            </form>
          </div>
        </Card>

        <Card className="border-loss">
          <CardHeader title="Danger zone" description="These actions are permanent." />
          <div className="flex flex-col divide-y divide-hairline">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">Delete {product.name}</p>
                <p className="text-sm text-muted">Removes this product with its costs and revenue.</p>
              </div>
              <DeleteProductButton id={product.id} name={product.name} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">Delete account</p>
                <p className="text-sm text-muted">Removes your account and all products.</p>
              </div>
              <DeleteAccountButton />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
