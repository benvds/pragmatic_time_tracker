/**
 * Time Entry Service Contract
 * Extends existing src/features/entry form structure
 */

export interface TimeEntry {
    id: string;
    date: string; // ISO date format (YYYY-MM-DD)
    description: string; // Required, min 3 chars (existing parseDescription)
    project: string; // Required, min 2 chars (existing parseProject)
    duration: number; // Total minutes worked (hh * 60 + mm)
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
}

// Form interface matching existing src/lib/form pattern
export interface TimeEntryFormData {
    date: string; // NEW: ISO date field to add
    description: string; // Existing form field
    project: string; // Existing form field
    hh: number; // Existing form field (0-24)
    mm: number; // Existing form field (0-59)
}

export interface CreateTimeEntryRequest {
    date: string;
    description: string; // Required (stricter than original spec)
    project: string; // Required (extends spec)
    duration: number; // Calculated from hh * 60 + mm
}

export interface UpdateTimeEntryRequest {
    description?: string;
    project?: string;
    duration?: number; // Recalculated from form hh/mm
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ServiceResponse<T> {
    data?: T;
    errors?: ValidationError[];
    success: boolean;
}

/**
 * Time Entry Service Interface
 * Local storage-based implementation for single-user time tracking
 */
export interface ITimeEntryService {
    /**
     * Create a new time entry for a specific date
     * @param request - Time entry details
     * @returns Service response with created entry or validation errors
     */
    create(
        request: CreateTimeEntryRequest,
    ): Promise<ServiceResponse<TimeEntry>>;

    /**
     * Get all time entries sorted by date (newest first)
     * @returns Service response with array of time entries
     */
    getAll(): Promise<ServiceResponse<TimeEntry[]>>;

    /**
     * Get time entry for a specific date
     * @param date - ISO date string (YYYY-MM-DD)
     * @returns Service response with time entry or null if not found
     */
    getByDate(date: string): Promise<ServiceResponse<TimeEntry | null>>;

    /**
     * Get time entries for a specific month
     * @param year - Full year (e.g., 2025)
     * @param month - Month number (1-12)
     * @returns Service response with filtered time entries
     */
    getForMonth(
        year: number,
        month: number,
    ): Promise<ServiceResponse<TimeEntry[]>>;

    /**
     * Update an existing time entry
     * @param id - Time entry ID
     * @param updates - Partial update data
     * @returns Service response with updated entry or validation errors
     */
    update(
        id: string,
        updates: UpdateTimeEntryRequest,
    ): Promise<ServiceResponse<TimeEntry>>;

    /**
     * Delete a time entry
     * @param id - Time entry ID
     * @returns Service response indicating success/failure
     */
    delete(id: string): Promise<ServiceResponse<boolean>>;

    /**
     * Check if a time entry exists for a given date
     * @param date - ISO date string (YYYY-MM-DD)
     * @returns Service response with boolean result
     */
    existsForDate(date: string): Promise<ServiceResponse<boolean>>;
}

/**
 * Validation Service Interface
 * Extends existing src/lib/form parsers pattern
 */
export interface IValidationService {
    /**
     * Validate time entry form data (extends existing parsers)
     * @param formData - Form data using TimeEntryFormData interface
     * @returns Array of validation errors (empty if valid)
     */
    validateTimeEntry(formData: TimeEntryFormData): ValidationError[];

    /**
     * Validate date value (NEW parser to add)
     * @param date - ISO date string to validate
     * @returns Validation error or null if valid
     */
    validateDate(date: string): ValidationError | null;

    /**
     * Validate hours value (uses existing parseHh)
     * @param hh - Hours to validate (0-24)
     * @returns Validation error or null if valid
     */
    validateHours(hh: number): ValidationError | null;

    /**
     * Validate minutes value (uses existing parseMm)
     * @param mm - Minutes to validate (0-59)
     * @returns Validation error or null if valid
     */
    validateMinutes(mm: number): ValidationError | null;

    /**
     * Validate description (uses existing parseDescription)
     * @param description - Description text (required, min 3 chars)
     * @returns Validation error or null if valid
     */
    validateDescription(description: string): ValidationError | null;

    /**
     * Validate project (uses existing parseProject)
     * @param project - Project name (required, min 2 chars)
     * @returns Validation error or null if valid
     */
    validateProject(project: string): ValidationError | null;
}

/**
 * Storage Service Interface
 * Abstracts localStorage operations for testability
 */
export interface IStorageService {
    /**
     * Get all time entries from storage
     * @returns Promise resolving to array of time entries
     */
    getTimeEntries(): Promise<TimeEntry[]>;

    /**
     * Save time entries to storage
     * @param entries - Array of time entries to save
     * @returns Promise resolving to success boolean
     */
    saveTimeEntries(entries: TimeEntry[]): Promise<boolean>;

    /**
     * Clear all time entries from storage
     * @returns Promise resolving to success boolean
     */
    clearTimeEntries(): Promise<boolean>;

    /**
     * Check if storage is available
     * @returns Promise resolving to availability boolean
     */
    isAvailable(): Promise<boolean>;
}
