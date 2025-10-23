import { type Page, type Locator } from "@playwright/test";
import { SELECTORS } from "./selectors";

export async function getTableRows(page: Page): Promise<Locator> {
    return page.locator(SELECTORS.TABLE_ROWS);
}

export async function getCell(
    page: Page,
    rowIndex: number,
    columnIndex: number,
): Promise<Locator> {
    return page
        .locator(SELECTORS.TABLE_ROWS)
        .nth(rowIndex)
        .locator("td")
        .nth(columnIndex);
}

export async function getCellText(
    page: Page,
    rowIndex: number,
    columnIndex: number,
): Promise<string> {
    const cell = await getCell(page, rowIndex, columnIndex);
    return (await cell.textContent()) ?? "";
}
