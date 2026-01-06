/**
 * Attempt to repair malformed JSON
 */
export function repairJSON(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Trim whitespace
    cleaned = cleaned.trim();

    // Try to extract JSON object/array if embedded in other text
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);

    if (objectMatch) {
        cleaned = objectMatch[0];
    } else if (arrayMatch) {
        cleaned = arrayMatch[0];
    }

    // Fix common issues
    cleaned = cleaned
        // Remove trailing commas before closing braces/brackets
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix single quotes to double quotes (simple approach)
        .replace(/'/g, '"')
        // Remove comments (simple single-line)
        .replace(/\/\/.*$/gm, '');

    return cleaned;
}

/**
 * Parse JSON with repair attempts
 */
export function parseWithRepair(text: string): any {
    // Try parsing directly first
    try {
        return JSON.parse(text);
    } catch (e) {
        // Attempt repair and retry
        const repaired = repairJSON(text);
        return JSON.parse(repaired); // Let this throw if still invalid
    }
}
