/**
 * Normalize a value to a number
 */
export function normalizeNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    // Already a number
    if (typeof value === 'number') {
        return isNaN(value) ? null : value;
    }

    // String processing
    if (typeof value === 'string') {
        // Remove common formatting
        let cleaned = value
            .replace(/[^\d.,-]/g, '') // Remove currency symbols, letters, etc.
            .trim();

        // Handle Indonesian/European number format (1.250.000,50 -> 1250000.50)
        if (cleaned.includes('.') && cleaned.includes(',')) {
            // If both exist, assume dots are thousands separators
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else if (cleaned.includes(',')) {
            // Could be decimal separator (European) or thousands separator
            const parts = cleaned.split(',');
            if (parts.length === 2 && parts[1].length <= 2) {
                // Likely decimal: 1.250,50
                cleaned = cleaned.replace('.', '').replace(',', '.');
            } else {
                // Likely thousands: 1,250,000
                cleaned = cleaned.replace(/,/g, '');
            }
        }

        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
    }

    // Try to coerce to number
    const attempted = Number(value);
    return isNaN(attempted) ? null : attempted;
}
