import { test, expect } from '@playwright/test';

test.describe('Time Tracker - Error Handling & Edge Cases E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T029: should handle localStorage quota exceeded gracefully', async ({ page }) => {
    await page.goto('/');

    // Mock localStorage to throw quota exceeded error
    await page.addInitScript(() => {
      const originalSetItem = window.localStorage.setItem;
      let callCount = 0;

      window.localStorage.setItem = function(key: string, value: string) {
        callCount++;
        if (callCount > 2) { // Allow a few calls, then simulate quota exceeded
          throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        }
        return originalSetItem.call(this, key, value);
      };
    });

    // Add first entry (should work)
    await page.getByLabel('Description').fill('First task');
    await page.getByLabel('Project').fill('Test Project');
    await page.locator('input[name="hh"]').fill('1');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('First task')).toBeVisible();

    // Add second entry (should work)
    await page.getByLabel('Description').fill('Second task');
    await page.getByLabel('Project').fill('Test Project 2');
    await page.locator('input[name="hh"]').fill('2');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Second task')).toBeVisible();

    // Add third entry (should fail due to quota)
    await page.getByLabel('Description').fill('Third task that will fail');
    await page.getByLabel('Project').fill('Failing Project');
    await page.locator('input[name="hh"]').fill('3');

    let errorAlertFired = false;
    page.on('dialog', async (dialog) => {
      if (dialog.message().includes('Failed to save time entry')) {
        errorAlertFired = true;
      }
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Save' }).click();

    // Should show error message
    await page.waitForTimeout(500);
    expect(errorAlertFired).toBe(true);

    // Third entry should not appear in list
    await expect(page.getByText('Third task that will fail')).not.toBeVisible();

    // First two entries should still be visible
    await expect(page.getByText('First task')).toBeVisible();
    await expect(page.getByText('Second task')).toBeVisible();
  });

  test('should handle corrupted localStorage data gracefully', async ({ page }) => {
    await page.goto('/');

    // Corrupt localStorage with invalid JSON
    await page.evaluate(() => {
      localStorage.setItem('time-tracker-data', '{invalid-json: "data"');
    });

    // Reload page - should not crash
    await page.reload();

    // Should show empty state instead of crashing
    await expect(page.getByText('No time entries yet')).toBeVisible();

    // Form should still be functional
    await page.getByLabel('Description').fill('Recovery after corruption');
    await page.getByLabel('Project').fill('Recovery Project');
    await page.locator('input[name="hh"]').fill('1');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    // Should successfully save new entry
    await expect(page.getByText('Recovery after corruption')).toBeVisible();
  });

  test('should handle extremely long input values', async ({ page }) => {
    await page.goto('/');

    // Test very long description
    const longDescription = 'A'.repeat(1000);
    const longProject = 'B'.repeat(500);

    await page.getByLabel('Description').fill(longDescription);
    await page.getByLabel('Project').fill(longProject);
    await page.locator('input[name="hh"]').fill('2');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    // Should handle long inputs gracefully
    const truncatedDescription = longDescription.substring(0, 50) + '...';

    // The entry should be saved (even if display is truncated)
    await page.waitForTimeout(500);
    const pageContent = await page.textContent('body');

    // Should contain at least part of the description
    expect(pageContent).toContain('AAAAAAA'); // Part of the long description
  });

  test('should handle special characters and Unicode in inputs', async ({ page }) => {
    await page.goto('/');

    // Test special characters and Unicode
    const specialDescription = '🚀 Special chars: <>&"\'`~!@#$%^&*()[]{}|\\';
    const unicodeProject = '项目-العربية-русский-日本語';

    await page.getByLabel('Description').fill(specialDescription);
    await page.getByLabel('Project').fill(unicodeProject);
    await page.locator('input[name="hh"]').fill('1');
    await page.locator('input[name="mm"]').fill('30');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    // Should handle special characters and Unicode properly
    await expect(page.getByText(specialDescription)).toBeVisible();
    await expect(page.getByText(unicodeProject)).toBeVisible();
    await expect(page.getByText('1h 30m')).toBeVisible();
  });

  test('should handle rapid form submissions', async ({ page }) => {
    await page.goto('/');

    // Fill form once
    await page.getByLabel('Description').fill('Rapid submission test');
    await page.getByLabel('Project').fill('Speed Test');
    await page.locator('input[name="hh"]').fill('1');

    let alertCount = 0;
    page.on('dialog', async (dialog) => {
      alertCount++;
      await dialog.accept();
    });

    const submitButton = page.getByRole('button', { name: 'Save' });

    // Rapidly click submit button multiple times
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();

    // Wait for processing
    await page.waitForTimeout(1000);

    // Should only save once despite multiple clicks
    const entries = page.getByText('Rapid submission test');
    await expect(entries).toHaveCount(1);

    // Should only show success alert once
    expect(alertCount).toBe(1);
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');

    // Add an entry
    await page.getByLabel('Description').fill('Navigation test');
    await page.getByLabel('Project').fill('Test Project');
    await page.locator('input[name="hh"]').fill('2');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Navigation test')).toBeVisible();

    // Navigate away (simulate by going to a non-existent route that redirects back)
    await page.goto('/non-existent-route');

    // Navigate back
    await page.goBack();

    // Data should still be there
    await expect(page.getByText('Navigation test')).toBeVisible();

    // Navigate forward
    await page.goForward();

    // Then back to main page
    await page.goto('/');

    // Data should persist
    await expect(page.getByText('Navigation test')).toBeVisible();
  });

  test('should handle date edge cases', async ({ page }) => {
    await page.goto('/');

    // Test leap year date
    const leapYearDate = '2024-02-29';

    await page.getByLabel('Date').fill(leapYearDate);
    await page.getByLabel('Description').fill('Leap year test');
    await page.getByLabel('Project').fill('Date Project');
    await page.locator('input[name="hh"]').fill('1');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    // Should accept valid leap year date
    await expect(page.getByText('Leap year test')).toBeVisible();

    // Test invalid leap year date
    await page.getByLabel('Date').fill('2023-02-29'); // 2023 is not a leap year
    await page.getByLabel('Description').fill('Invalid leap year');
    await page.getByLabel('Project').fill('Invalid Date Project');
    await page.locator('input[name="hh"]').fill('2');

    // Blur to trigger validation
    await page.getByLabel('Date').blur();

    // Should show validation error
    await expect(page.getByText(/not a valid date/i).or(page.getByText(/invalid/i))).toBeVisible();
  });

  test('should handle localStorage disabled/unavailable', async ({ page }) => {
    await page.goto('/');

    // Mock localStorage to be unavailable
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true
      });
    });

    await page.reload();

    // App should still render without crashing
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByText('No time entries yet')).toBeVisible();

    // Try to submit form
    await page.getByLabel('Description').fill('No storage test');
    await page.getByLabel('Project').fill('Storage Project');
    await page.locator('input[name="hh"]').fill('1');

    let errorAlertFired = false;
    page.on('dialog', async (dialog) => {
      if (dialog.message().includes('Failed to save')) {
        errorAlertFired = true;
      }
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Save' }).click();

    // Should handle gracefully and show error
    await page.waitForTimeout(500);
    expect(errorAlertFired).toBe(true);
  });

  test('should handle form submission during network interruption', async ({ page }) => {
    await page.goto('/');

    // Fill valid form
    await page.getByLabel('Description').fill('Network test');
    await page.getByLabel('Project').fill('Connection Project');
    await page.locator('input[name="hh"]').fill('1');

    // Simulate network interruption by going offline
    await page.context().setOffline(true);

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    // Should still work as localStorage is local
    await expect(page.getByText('Network test')).toBeVisible();

    // Restore network
    await page.context().setOffline(false);

    // Data should persist even after network restoration
    await page.reload();
    await expect(page.getByText('Network test')).toBeVisible();
  });

  test('should handle multiple browser tabs simultaneously', async ({ page, context }) => {
    await page.goto('/');

    // Add entry in first tab
    await page.getByLabel('Description').fill('Tab 1 task');
    await page.getByLabel('Project').fill('Multi-tab Project');
    await page.locator('input[name="hh"]').fill('1');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Tab 1 task')).toBeVisible();

    // Open second tab
    const tab2 = await context.newPage();
    await tab2.goto('/');

    // Should see the entry from first tab
    await expect(tab2.getByText('Tab 1 task')).toBeVisible();

    // Add entry in second tab
    await tab2.getByLabel('Description').fill('Tab 2 task');
    await tab2.getByLabel('Project').fill('Multi-tab Project 2');
    await tab2.locator('input[name="hh"]').fill('2');

    tab2.on('dialog', dialog => dialog.accept());
    await tab2.getByRole('button', { name: 'Save' }).click();

    await expect(tab2.getByText('Tab 2 task')).toBeVisible();

    // Check if first tab sees the new entry (depends on storage event handling)
    await page.reload(); // Manual refresh to see changes
    await expect(page.getByText('Tab 1 task')).toBeVisible();
    await expect(page.getByText('Tab 2 task')).toBeVisible();
  });
});
