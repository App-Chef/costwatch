import { expect, test, type Page } from "@playwright/test";

// Full user journey against a real Supabase instance with email
// confirmations disabled (the default for `supabase start`).
test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, "Supabase is not configured");

const PASSWORD = "correct-horse-battery";

async function signUp(page: Page, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

function uniqueEmail(tag: string) {
  return `e2e-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

test("sign up, track a product, and sign out", async ({ page }) => {
  const email = uniqueEmail("journey");
  await signUp(page, email);

  // Onboarding: create the first product.
  await expect(page.getByRole("heading", { name: "What are you building?" })).toBeVisible();
  await page.getByLabel("Product name").fill("Test Product");
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Test Product" })).toBeVisible();
  await expect(page.getByText("No costs yet.")).toBeVisible();

  // Add a monthly and a yearly cost.
  await page.getByRole("button", { name: "Add your first cost" }).click();
  let dialog = page.getByRole("dialog", { name: "Add a cost" });
  await dialog.getByLabel("Name").fill("Vercel Pro");
  await dialog.getByLabel("Amount").fill("20");
  await dialog.getByLabel("Next renewal").fill(inDays(4));
  await dialog.getByRole("button", { name: "Add cost" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Cost added." })).toBeVisible();

  await page.getByRole("button", { name: "Add cost" }).first().click();
  dialog = page.getByRole("dialog", { name: "Add a cost" });
  await dialog.getByLabel("Name").fill("Domain");
  await dialog.getByLabel("Amount").fill("120");
  await dialog.getByLabel("Billing").selectOption("yearly");
  await expect(dialog.getByText("per month (estimated)")).toContainText("$10");
  await dialog.getByLabel("Category").selectOption("domain");
  await dialog.getByRole("button", { name: "Add cost" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Cost added." }).first()).toBeVisible();

  // Monthly cost = 20 + 120/12.
  const kpis = page.getByRole("region", { name: "This month" });
  await expect(kpis.getByText("$30", { exact: true })).toBeVisible();
  await expect(kpis.getByText("No revenue recorded", { exact: true })).toBeVisible();

  // Add revenue.
  await page.getByRole("button", { name: "Add revenue" }).first().click();
  const rev = page.getByRole("dialog", { name: "Add revenue" });
  await rev.getByLabel("Amount").fill("130");
  await rev.getByLabel("Source").fill("Stripe");
  await rev.getByRole("button", { name: "Add revenue" }).click();
  await expect(kpis.getByText("$130", { exact: true })).toBeVisible();
  await expect(kpis.getByText("$100", { exact: true })).toBeVisible(); // profit
  await expect(kpis.getByText("76.9%")).toBeVisible(); // margin

  // Validation errors are human readable.
  await page.getByRole("link", { name: "Costs" }).first().click();
  await page.getByRole("button", { name: "Add cost" }).first().click();
  dialog = page.getByRole("dialog", { name: "Add a cost" });
  await dialog.getByLabel("Amount").fill("-5");
  await dialog.getByRole("button", { name: "Add cost" }).click();
  await expect(dialog.getByText("Name is required.")).toBeVisible();
  await expect(dialog.getByText(/Enter a positive amount/)).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();

  // Pause a cost: it leaves the monthly total.
  await page.getByRole("button", { name: "Actions for Vercel Pro" }).first().click();
  await page.getByRole("menuitem", { name: "Pause" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Cost paused." })).toBeVisible();
  await expect(page.getByRole("region", { name: "Cost summary" }).getByText("$10", { exact: true })).toBeVisible();

  // Renewals: the paused cost disappears; resume it and it's back.
  await page.getByRole("button", { name: "Actions for Vercel Pro" }).first().click();
  await page.getByRole("menuitem", { name: "Mark active" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Cost resumed." })).toBeVisible();
  await page.getByRole("link", { name: "Renewals" }).first().click();
  await page.getByRole("link", { name: "7 days" }).click();
  await expect(page.getByText("Vercel Pro")).toBeVisible();

  // Edit then delete revenue.
  await page.getByRole("link", { name: "Revenue" }).first().click();
  await page.getByRole("button", { name: /Actions for Stripe/ }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete entry" }).click();
  await expect(page.getByText("No revenue yet.")).toBeVisible();

  // Sign out.
  await page.goto("/app/settings");
  await page.getByRole("button", { name: "Sign out" }).last().click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);

  // Sign back in.
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Test Product" })).toBeVisible();
});

test("a second user cannot see the first user's products", async ({ browser }) => {
  const a = await browser.newContext();
  const pageA = await a.newPage();
  await signUp(pageA, uniqueEmail("a"));
  await pageA.getByLabel("Product name").fill("Secret Product");
  await pageA.getByRole("button", { name: "Create product" }).click();
  await expect(pageA.getByRole("heading", { level: 1, name: "Secret Product" })).toBeVisible();
  await a.close();

  const b = await browser.newContext();
  const pageB = await b.newPage();
  await signUp(pageB, uniqueEmail("b"));
  await expect(pageB.getByRole("heading", { name: "What are you building?" })).toBeVisible();
  await expect(pageB.getByText("Secret Product")).toHaveCount(0);
  await b.close();
});

test("wrong password shows a readable error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toContainText("don't match");
});

test("mobile navigation works @mobile", async ({ page }) => {
  await signUp(page, uniqueEmail("mobile"));
  await page.getByLabel("Product name").fill("Pocket App");
  await page.getByRole("button", { name: "Create product" }).click();
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Costs" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Costs" })).toBeVisible();
});

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
