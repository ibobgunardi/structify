/**
 * Normalize a value to a boolean
 */
export function normalizeBoolean(value: any): boolean | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    // Already a boolean
    if (typeof value === 'boolean') {
        return value;
    }

    // String conversion
    if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();

        // True values
        if (['true', 'yes', 'y', '1', 'on', 'enabled'].includes(lower)) {
            return true;
        }

        // False values
        if (['false', 'no', 'n', '0', 'off', 'disabled'].includes(lower)) {
            return false;
        }

        return null; // Ambiguous
    }

    // Number conversion
    if (typeof value === 'number') {
        if (value === 1) return true;
        if (value === 0) return false;
        return null;
    }

    return null;
}
