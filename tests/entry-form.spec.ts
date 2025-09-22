import { test, expect } from "@playwright/test";

test.describe("Entry Form", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:5173/");
    });

    test("shows required error message when submitting without description", async ({
        page,
    }) => {
        // Find and click the Save button without entering a description
        await page.getByRole("button", { name: "Save" }).click();

        // Check that the required error message is displayed
        await expect(page.getByText("Required")).toBeVisible();
    });

    test("shows minimum length error message when description is too short", async ({
        page,
    }) => {
        // Enter a description that's too short (less than 3 characters)
        await page.getByLabel("Description").fill("ab");

        // Click Save button
        await page.getByRole("button", { name: "Save" }).click();

        // Check that the minimum length error message is displayed
        await expect(
            page.getByText("At least 3 characters needed"),
        ).toBeVisible();
    });

    test("successfully submits with valid description", async ({ page }) => {
        // Enter a valid description
        await page.getByLabel("Description").fill("Valid task description");

        // Click Save button
        await page.getByRole("button", { name: "Save" }).click();

        // Since the form logs to console on successful submit, we can check that no error messages are visible
        await expect(page.getByText("Required")).not.toBeVisible();
        await expect(
            page.getByText("At least 3 characters needed"),
        ).not.toBeVisible();
    });

    test("resets form when reset button is clicked", async ({ page }) => {
        // Fill in the form
        await page.getByLabel("Description").fill("Test description");
        await page.getByLabel("Hours").fill("2");
        await page.getByLabel("Minutes").fill("30");

        // Click Reset button
        await page.getByRole("button", { name: "Reset" }).click();

        // Check that form fields are cleared
        await expect(page.getByLabel("Description")).toHaveValue("");
        await expect(page.getByLabel("Hours")).toHaveValue("0");
        await expect(page.getByLabel("Minutes")).toHaveValue("0");
    });
});
