import { test, expect } from '@playwright/test';

test.describe('Time Tracker - Data Persistence E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('T028: should persist multiple entries across browser sessions', async ({ page, context }) => {
    await page.goto('/');

    // Add first entry
    await page.getByLabel('Date').fill('2024-01-15');
    await page.getByLabel('Description').fill('First persistent task');
    await page.getByLabel('Project').fill('Project Alpha');
    await page.locator('input[name="hh"]').fill('2');
    await page.locator('input[name="mm"]').fill('30');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for entry to appear
    await expect(page.getByText('First persistent task')).toBeVisible();

    // Add second entry
    await page.getByLabel('Date').fill('2024-01-16');
    await page.getByLabel('Description').fill('Second persistent task');
    await page.getByLabel('Project').fill('Project Beta');
    await page.locator('input[name="hh"]').fill('1');
    await page.locator('input[name="mm"]').fill('45');

    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for both entries to appear
    await expect(page.getByText('First persistent task')).toBeVisible();
    await expect(page.getByText('Second persistent task')).toBeVisible();

    // Close browser and create new context (simulates new session)
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Both entries should still be visible
    await expect(newPage.getByText('First persistent task')).toBeVisible();
    await expect(newPage.getByText('Second persistent task')).toBeVisible();
    await expect(newPage.getByText('Project Alpha')).toBeVisible();
    await expect(newPage.getByText('Project Beta')).toBeVisible();
    await expect(newPage.getByText('2h 30m')).toBeVisible();
    await expect(newPage.getByText('1h 45m')).toBeVisible();
  });

  test('should maintain data integrity after page refresh', async ({ page }) => {
    await page.goto('/');

    // Add entry with specific data
    const testDate = '2024-01-20';
    const testDescription = 'Integrity test task';
    const testProject = 'Data Project';
    const testHours = '3';
    const testMinutes = '15';

    await page.getByLabel('Date').fill(testDate);
    await page.getByLabel('Description').fill(testDescription);
    await page.getByLabel('Project').fill(testProject);
    await page.locator('input[name="hh"]').fill(testHours);
    await page.locator('input[name="mm"]').fill(testMinutes);

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify data is displayed correctly
    await expect(page.getByText(testDescription)).toBeVisible();
    await expect(page.getByText(testProject)).toBeVisible();
    await expect(page.getByText('3h 15m')).toBeVisible();

    // Refresh page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();

      // Data should still be intact
      await expect(page.getByText(testDescription)).toBeVisible();
      await expect(page.getByText(testProject)).toBeVisible();
      await expect(page.getByText('3h 15m')).toBeVisible();
    }
  });

  test('should handle localStorage capacity and corruption scenarios', async ({ page }) => {
    await page.goto('/');

    // Add multiple entries to test storage capacity
    const entries = [];
    for (let i = 1; i <= 10; i++) {
      const entry = {
        date: `2024-01-${i.toString().padStart(2, '0')}`,
        description: `Task ${i} - Testing storage capacity`,
        project: `Project ${String.fromCharCode(64 + i)}`, // A, B, C, etc.
        hours: (i % 5 + 1).toString(), // 1-5 hours
        minutes: (i * 5 % 60).toString() // Varying minutes
      };
      entries.push(entry);

      await page.getByLabel('Date').fill(entry.date);
      await page.getByLabel('Description').fill(entry.description);
      await page.getByLabel('Project').fill(entry.project);
      await page.locator('input[name="hh"]').fill(entry.hours);
      await page.locator('input[name="mm"]').fill(entry.minutes);

      page.on('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for entry to appear
      await expect(page.getByText(entry.description)).toBeVisible();
    }

    // Verify all entries are still visible after adding many
    for (const entry of entries) {
      await expect(page.getByText(entry.description)).toBeVisible();
      await expect(page.getByText(entry.project)).toBeVisible();
    }

    // Test data corruption scenario by manually corrupting localStorage
    await page.evaluate(() => {
      localStorage.setItem('time-tracker-data', 'corrupted-json-data');
    });

    // Refresh page - should handle corruption gracefully
    await page.reload();

    // Should show empty state instead of crashing
    await expect(page.getByText('No time entries yet')).toBeVisible();

    // Should still allow adding new entries after corruption
    await page.getByLabel('Description').fill('Recovery test');
    await page.getByLabel('Project').fill('Recovery Project');
    await page.locator('input[name="hh"]').fill('1');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Recovery test')).toBeVisible();
  });

  test('should update entries correctly when editing same date', async ({ page }) => {
    await page.goto('/');

    const testDate = '2024-01-25';

    // Add initial entry
    await page.getByLabel('Date').fill(testDate);
    await page.getByLabel('Description').fill('Original task');
    await page.getByLabel('Project').fill('Original Project');
    await page.locator('input[name="hh"]').fill('2');

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Original task')).toBeVisible();

    // Refresh to ensure data persisted
    await page.reload();
    await expect(page.getByText('Original task')).toBeVisible();

    // Update with same date
    await page.getByLabel('Date').fill(testDate);
    await page.getByLabel('Description').fill('Updated task');
    await page.getByLabel('Project').fill('Updated Project');
    await page.locator('input[name="hh"]').fill('3');
    await page.locator('input[name="mm"]').fill('30');

    await page.getByRole('button', { name: 'Save' }).click();

    // Original entry should be gone, updated entry should be visible
    await expect(page.getByText('Original task')).not.toBeVisible();
    await expect(page.getByText('Updated task')).toBeVisible();
    await expect(page.getByText('Updated Project')).toBeVisible();
    await expect(page.getByText('3h 30m')).toBeVisible();

    // Refresh and verify persistence of update
    await page.reload();
    await expect(page.getByText('Original task')).not.toBeVisible();
    await expect(page.getByText('Updated task')).toBeVisible();
    await expect(page.getByText('Updated Project')).toBeVisible();
  });

  test('should maintain correct entry order after browser restart', async ({ page, context }) => {
    await page.goto('/');

    // Add entries with specific dates to test ordering
    const entries = [
      { date: '2024-01-10', description: 'Oldest task', project: 'Project A' },
      { date: '2024-01-15', description: 'Middle task', project: 'Project B' },
      { date: '2024-01-20', description: 'Newest task', project: 'Project C' }
    ];

    // Add entries in random order
    for (const entry of [entries[1], entries[0], entries[2]]) {
      await page.getByLabel('Date').fill(entry.date);
      await page.getByLabel('Description').fill(entry.description);
      await page.getByLabel('Project').fill(entry.project);
      await page.locator('input[name="hh"]').fill('1');

      page.on('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.getByText(entry.description)).toBeVisible();
    }

    // Verify they appear in correct order (newest first)
    const pageText = await page.textContent('body');
    const newestIndex = pageText?.indexOf('Newest task') || -1;
    const middleIndex = pageText?.indexOf('Middle task') || -1;
    const oldestIndex = pageText?.indexOf('Oldest task') || -1;

    expect(newestIndex).toBeLessThan(middleIndex);
    expect(middleIndex).toBeLessThan(oldestIndex);

    // Close and reopen browser
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Verify order is maintained
    const newPageText = await newPage.textContent('body');
    const newNewestIndex = newPageText?.indexOf('Newest task') || -1;
    const newMiddleIndex = newPageText?.indexOf('Middle task') || -1;
    const newOldestIndex = newPageText?.indexOf('Oldest task') || -1;

    expect(newNewestIndex).toBeLessThan(newMiddleIndex);
    expect(newMiddleIndex).toBeLessThan(newOldestIndex);
  });

  test('should handle entry deletion and persist changes', async ({ page }) => {
    await page.goto('/');

    // Add multiple entries
    const entries = [
      'Task to keep 1',
      'Task to delete',
      'Task to keep 2'
    ];

    for (let i = 0; i < entries.length; i++) {
      await page.getByLabel('Date').fill(`2024-01-${(i + 10).toString()}`);
      await page.getByLabel('Description').fill(entries[i]);
      await page.getByLabel('Project').fill(`Project ${i + 1}`);
      await page.locator('input[name="hh"]').fill('1');

      page.on('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.getByText(entries[i])).toBeVisible();
    }

    // Delete the middle entry
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    const deleteButtonCount = await deleteButtons.count();
    expect(deleteButtonCount).toBe(3);

    // Click the second delete button (for 'Task to delete')
    await deleteButtons.nth(1).click();

    // Verify entry is removed
    await expect(page.getByText('Task to delete')).not.toBeVisible();
    await expect(page.getByText('Task to keep 1')).toBeVisible();
    await expect(page.getByText('Task to keep 2')).toBeVisible();

    // Refresh and verify deletion persisted
    await page.reload();
    await expect(page.getByText('Task to delete')).not.toBeVisible();
    await expect(page.getByText('Task to keep 1')).toBeVisible();
    await expect(page.getByText('Task to keep 2')).toBeVisible();

    // Should only have 2 delete buttons now
    const remainingDeleteButtons = page.getByRole('button', { name: 'Delete' });
    await expect(remainingDeleteButtons).toHaveCount(2);
  });
});
