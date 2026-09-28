import { expect, test } from "@playwright/test";

test.describe("public site", () => {
  test("landing page explains the product @mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Costwatch | Know what your product actually costs");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Know what your product");
    await expect(page.getByRole("link", { name: "Start tracking" }).first()).toHaveAttribute("href", "/signup");
    await expect(page.getByRole("link", { name: "View GitHub" })).toBeVisible();
    await expect(page.getByText("Example data for illustration.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Know your numbers." })).toBeVisible();
  });

  test("docs page is reachable", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.getByRole("heading", { level: 1, name: "Self-hosting guide" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How the numbers work" })).toBeVisible();
  });

  test("protected routes redirect to sign in", async ({ page }) => {
    await page.goto("/app/costs");
    await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fcosts/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("robots and sitemap exist", async ({ request }) => {
    expect((await request.get("/robots.txt")).ok()).toBe(true);
    expect((await request.get("/sitemap.xml")).ok()).toBe(true);
  });
});
