import { test, expect } from '@playwright/test';

test.describe('Time Tracker - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T026: should complete full user flow - add, view, and delete time entry', async ({ page }) => {
    await page.goto('/');

    // Verify initial state
    await expect(page.getByText('No time entries yet')).toBeVisible();

    // Fill out the form
    await page.getByLabel('Description').fill('Complete project documentation');
    await page.getByLabel('Project').fill('Documentation Team');

    // Fill duration (2 hours 30 minutes)
    const hourInput = page.locator('input[name="hh"]');
    const minuteInput = page.locator('input[name="mm"]');
    await hourInput.fill('2');
    await minuteInput.fill('30');

    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();

    // Handle the alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('Time entry saved successfully!');
      await dialog.accept();
    });

    // Verify the entry appears in the list
    await expect(page.getByText('Complete project documentation')).toBeVisible();
    await expect(page.getByText('Documentation Team')).toBeVisible();
    await expect(page.getByText('2h 30m')).toBeVisible();

    // Verify "No entries" message is gone
    await expect(page.getByText('No time entries yet')).not.toBeVisible();

    // Verify form is reset (description and project should be empty)
    await expect(page.getByLabel('Description')).toHaveValue('');
    await expect(page.getByLabel('Project')).toHaveValue('');
    await expect(hourInput).toHaveValue('');
    await expect(minuteInput).toHaveValue('');

    // Date should be reset to today
    const today = new Date().toISOString().split('T')[0];
    await expect(page.getByLabel('Date')).toHaveValue(today);

    // Delete the entry
    await page.getByRole('button', { name: 'Delete' }).click();

    // Verify entry is removed and "No entries" message returns
    await expect(page.getByText('Complete project documentation')).not.toBeVisible();
    await expect(page.getByText('No time entries yet')).toBeVisible();
  });

  test('should handle multiple entries and display them in correct order (newest first)', async ({ page }) => {
    await page.goto('/');

    // Add first entry for January 10th
    await page.getByLabel('Date').fill('2024-01-10');
    await page.getByLabel('Description').fill('First task');
    await page.getByLabel('Project').fill('Project A');
    await page.locator('input[name="hh"]').fill('1');
    await page.getByRole('button', { name: 'Save' }).click();

    // Handle first alert
    page.on('dialog', dialog => dialog.accept());

    // Wait for first entry to appear
    await expect(page.getByText('First task')).toBeVisible();

    // Add second entry for January 15th (newer date)
    await page.getByLabel('Date').fill('2024-01-15');
    await page.getByLabel('Description').fill('Second task');
    await page.getByLabel('Project').fill('Project B');
    await page.locator('input[name="hh"]').fill('2');
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for both entries to appear
    await expect(page.getByText('First task')).toBeVisible();
    await expect(page.getByText('Second task')).toBeVisible();

    // Verify order: newer entries should appear first
    const entryCards = page.locator('[data-testid*="time-entry-card"], .time-entry-card, [class*="time-entry"], [class*="card"]').or(
      page.getByText('Second task').locator('..').or(
        page.getByText('First task').locator('..')
      )
    );

    // Alternative approach: check the text order in the page
    const pageText = await page.textContent('body');
    const secondTaskIndex = pageText?.indexOf('Second task') || -1;
    const firstTaskIndex = pageText?.indexOf('First task') || -1;

    expect(secondTaskIndex).toBeLessThan(firstTaskIndex);
  });

  test('should persist data across page refreshes', async ({ page }) => {
    await page.goto('/');

    // Add an entry
    await page.getByLabel('Description').fill('Persistent task');
    await page.getByLabel('Project').fill('Test Project');
    await page.locator('input[name="hh"]').fill('1');
    await page.getByRole('button', { name: 'Save' }).click();

    // Handle alert
    page.on('dialog', dialog => dialog.accept());

    // Verify entry is visible
    await expect(page.getByText('Persistent task')).toBeVisible();

    // Refresh the page
    await page.reload();

    // Entry should still be there
    await expect(page.getByText('Persistent task')).toBeVisible();
    await expect(page.getByText('Test Project')).toBeVisible();
    await expect(page.getByText('1h 0m')).toBeVisible();
  });

  test('should update existing entry when same date is used', async ({ page }) => {
    await page.goto('/');

    const testDate = '2024-01-15';

    // Add first entry
    await page.getByLabel('Date').fill(testDate);
    await page.getByLabel('Description').fill('Original task');
    await page.getByLabel('Project').fill('Project A');
    await page.locator('input[name="hh"]').fill('2');
    await page.getByRole('button', { name: 'Save' }).click();

    // Handle alert
    page.on('dialog', dialog => dialog.accept());

    // Verify first entry
    await expect(page.getByText('Original task')).toBeVisible();

    // Add second entry with same date (should update)
    await page.getByLabel('Date').fill(testDate);
    await page.getByLabel('Description').fill('Updated task');
    await page.getByLabel('Project').fill('Project B');
    await page.locator('input[name="hh"]').fill('3');
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify update: old entry should be gone, new entry should be visible
    await expect(page.getByText('Original task')).not.toBeVisible();
    await expect(page.getByText('Updated task')).toBeVisible();
    await expect(page.getByText('Project B')).toBeVisible();
    await expect(page.getByText('3h 0m')).toBeVisible();

    // Should still only have one entry total
    const entryElements = page.getByText(/\d+h \d+m/);
    await expect(entryElements).toHaveCount(1);
  });

  test('should handle form reset correctly', async ({ page }) => {
    await page.goto('/');

    // Fill out form
    await page.getByLabel('Date').fill('2024-01-15');
    await page.getByLabel('Description').fill('Test description');
    await page.getByLabel('Project').fill('Test project');
    await page.locator('input[name="hh"]').fill('2');
    await page.locator('input[name="mm"]').fill('30');

    // Click reset button
    await page.getByRole('button', { name: 'Reset' }).click();

    // All fields should be cleared except date should be today
    const today = new Date().toISOString().split('T')[0];
    await expect(page.getByLabel('Date')).toHaveValue(today);
    await expect(page.getByLabel('Description')).toHaveValue('');
    await expect(page.getByLabel('Project')).toHaveValue('');
    await expect(page.locator('input[name="hh"]')).toHaveValue('');
    await expect(page.locator('input[name="mm"]')).toHaveValue('');
  });
});
