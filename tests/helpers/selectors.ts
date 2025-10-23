export const SELECTORS = {
    TITLE: "h1",
    TABLE: "table",
    TABLE_ROWS: "tbody tr",
    TABLE_HEADERS: "th",
    THEAD: "thead",
    TBODY: "tbody",
    DEBUG_BUTTON: '[aria-label="Open debug tools"]',
    LOAD_SAMPLE_DATA_BUTTON: 'button:has-text("Load Sample Data")',
    CLEAR_DATA_BUTTON: 'button:has-text("Clear All Data")',
    EMPTY_STATE: '[data-testid="empty-state"]',
    EMPTY_STATE_TITLE: "text=No time entries yet",
    EMPTY_STATE_DESCRIPTION: "text=Start tracking your time",
} as const;

export const TIMEOUTS = {
    APP_READY: 10000,
    BUTTON_CLICK: 5000,
    TABLE_LOAD: 10000,
    OFFLINE_WAIT: 500,
} as const;

export const PATTERNS = {
    DATE: /\w{3} \d{1,2}/,
    DURATION: /\d+[hm](\s\d+m)?/,
    DURATION_STRICT: /^\d+[hm](\s\d+m)?$/,
} as const;

export const COLUMN_INDEX = {
    DATE: 0,
    DURATION: 1,
    DESCRIPTION: 2,
} as const;

export const HEADERS = ["Date", "Duration", "Description"] as const;
