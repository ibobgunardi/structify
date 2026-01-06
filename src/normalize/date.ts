/**
 * Normalize a value to a date in ISO-8601 format
 */
export function normalizeDate(value: any): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    // Already a valid ISO string
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
        }
    }

    // Try to parse various date formats
    let parsedDate: Date | null = null;

    if (typeof value === 'string') {
        // DD/MM/YYYY or DD/MM/YY
        const ddmmyyyyMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (ddmmyyyyMatch) {
            let day = parseInt(ddmmyyyyMatch[1], 10);
            let month = parseInt(ddmmyyyyMatch[2], 10) - 1; // JS months are 0-indexed
            let year = parseInt(ddmmyyyyMatch[3], 10);

            // Handle 2-digit year
            if (year < 100) {
                year += year < 50 ? 2000 : 1900;
            }

            parsedDate = new Date(year, month, day);
        }
    }

    // Try parsing as timestamp
    if (!parsedDate && typeof value === 'number') {
        parsedDate = new Date(value);
    }

    // Fallback: try native Date parsing
    if (!parsedDate) {
        const attempted = new Date(value);
        if (!isNaN(attempted.getTime())) {
            parsedDate = attempted;
        }
    }

    // Validate and return
    if (parsedDate && !isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0]; // Return YYYY-MM-DD
    }

    return null;
}
