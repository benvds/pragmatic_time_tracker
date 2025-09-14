import { test, expect } from '@playwright/test';

test.describe('Time Tracker - Form Validation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T027: should prevent submission with empty required fields', async ({ page }) => {
    await page.goto('/');

    // Try to submit form without filling any fields
    await page.getByRole('button', { name: 'Save' }).click();

    // Should show validation errors
    await expect(page.getByText('Required')).toBeVisible();

    // No success alert should appear
    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    // Wait a moment to ensure no alert appears
    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);

    // No entries should be saved
    await expect(page.getByText('No time entries yet')).toBeVisible();
  });

  test('should validate description minimum length', async ({ page }) => {
    await page.goto('/');

    // Enter too short description
    const descriptionInput = page.getByLabel('Description');
    await descriptionInput.fill('ab'); // Only 2 characters
    await descriptionInput.blur(); // Trigger validation

    // Should show validation error
    await expect(page.getByText('At least 3 characters needed')).toBeVisible();

    // Fill other required fields
    await page.getByLabel('Project').fill('Valid Project');
    await page.locator('input[name="hh"]').fill('1');

    // Try to submit
    await page.getByRole('button', { name: 'Save' }).click();

    // Should not succeed
    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });

  test('should validate project minimum length', async ({ page }) => {
    await page.goto('/');

    // Fill valid description first
    await page.getByLabel('Description').fill('Valid description');

    // Enter too short project name
    const projectInput = page.getByLabel('Project');
    await projectInput.fill('a'); // Only 1 character
    await projectInput.blur();

    // Should show validation error
    await expect(page.getByText('At least 2 characters needed')).toBeVisible();

    // Fill hour field
    await page.locator('input[name="hh"]').fill('1');

    // Try to submit
    await page.getByRole('button', { name: 'Save' }).click();

    // Should not succeed
    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });

  test('should validate hour field boundaries', async ({ page }) => {
    await page.goto('/');

    // Fill valid required fields first
    await page.getByLabel('Description').fill('Valid description');
    await page.getByLabel('Project').fill('Valid project');

    // Test hours too high
    const hourInput = page.locator('input[name="hh"]');
    await hourInput.fill('25'); // Above max of 24
    await hourInput.blur();

    await expect(page.getByText('Should be a number between 0 and 24.')).toBeVisible();

    // Test negative hours
    await hourInput.fill('-1');
    await hourInput.blur();

    await expect(page.getByText('Should be a number between 0 and 24.')).toBeVisible();

    // Try to submit with invalid hours
    await page.getByRole('button', { name: 'Save' }).click();

    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });

  test('should validate minute field boundaries', async ({ page }) => {
    await page.goto('/');

    // Fill valid required fields
    await page.getByLabel('Description').fill('Valid description');
    await page.getByLabel('Project').fill('Valid project');
    await page.locator('input[name="hh"]').fill('2');

    // Test minutes too high
    const minuteInput = page.locator('input[name="mm"]');
    await minuteInput.fill('60'); // Above max of 59
    await minuteInput.blur();

    await expect(page.getByText('Should be a number between 0 and 59.')).toBeVisible();

    // Test negative minutes
    await minuteInput.fill('-5');
    await minuteInput.blur();

    await expect(page.getByText('Should be a number between 0 and 59.')).toBeVisible();

    // Try to submit
    await page.getByRole('button', { name: 'Save' }).click();

    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });

  test('should validate future dates are not allowed', async ({ page }) => {
    await page.goto('/');

    // Calculate future date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    // Fill form with future date
    const dateInput = page.getByLabel('Date');
    await dateInput.fill(tomorrowString);
    await dateInput.blur();

    await expect(page.getByText('Date cannot be in the future')).toBeVisible();

    // Fill other valid fields
    await page.getByLabel('Description').fill('Valid description');
    await page.getByLabel('Project').fill('Valid project');
    await page.locator('input[name="hh"]').fill('2');

    // Try to submit
    await page.getByRole('button', { name: 'Save' }).click();

    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });

  test('should clear validation errors when input becomes valid', async ({ page }) => {
    await page.goto('/');

    // Enter invalid description
    const descriptionInput = page.getByLabel('Description');
    await descriptionInput.fill('ab');
    await descriptionInput.blur();

    // Should show error
    await expect(page.getByText('At least 3 characters needed')).toBeVisible();

    // Fix the input
    await descriptionInput.fill('abc'); // Now valid
    await descriptionInput.blur();

    // Error should be cleared
    await expect(page.getByText('At least 3 characters needed')).not.toBeVisible();
  });

  test('should allow submission when all validations pass', async ({ page }) => {
    await page.goto('/');

    // Fill form with all valid data
    await page.getByLabel('Description').fill('Valid task description');
    await page.getByLabel('Project').fill('Valid Project');
    await page.locator('input[name="hh"]').fill('2');
    await page.locator('input[name="mm"]').fill('30');

    // Set up alert handler
    let alertMessage = '';
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // Submit form
    await page.getByRole('button', { name: 'Save' }).click();

    // Should show success alert
    await page.waitForTimeout(500);
    expect(alertMessage).toContain('Time entry saved successfully!');

    // Entry should appear in list
    await expect(page.getByText('Valid task description')).toBeVisible();
    await expect(page.getByText('Valid Project')).toBeVisible();
    await expect(page.getByText('2h 30m')).toBeVisible();
  });

  test('should validate invalid date formats gracefully', async ({ page }) => {
    await page.goto('/');

    // Try various invalid date formats
    const dateInput = page.getByLabel('Date');

    // Invalid format
    await dateInput.fill('2024-13-01'); // Invalid month
    await dateInput.blur();

    // Fill other fields
    await page.getByLabel('Description').fill('Valid description');
    await page.getByLabel('Project').fill('Valid project');
    await page.locator('input[name="hh"]').fill('1');

    // Try to submit
    await page.getByRole('button', { name: 'Save' }).click();

    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });

  test('should handle non-numeric input in duration fields', async ({ page }) => {
    await page.goto('/');

    // Fill valid text fields
    await page.getByLabel('Description').fill('Valid description');
    await page.getByLabel('Project').fill('Valid project');

    // Enter non-numeric values in duration fields
    const hourInput = page.locator('input[name="hh"]');
    const minuteInput = page.locator('input[name="mm"]');

    await hourInput.fill('abc');
    await hourInput.blur();

    await minuteInput.fill('xyz');
    await minuteInput.blur();

    // Should show validation errors for both
    await expect(page.getByText('Should be a number between 0 and 24.')).toBeVisible();
    await expect(page.getByText('Should be a number between 0 and 59.')).toBeVisible();

    // Try to submit
    await page.getByRole('button', { name: 'Save' }).click();

    let alertFired = false;
    page.on('dialog', () => {
      alertFired = true;
    });

    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });
});
