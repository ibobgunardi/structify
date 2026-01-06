import { Schema } from '../types';

/**
 * Build the extraction prompt for the AI
 */
export function buildExtractionPrompt(text: string, schema: Schema): string {
    const systemPrompt = buildSystemPrompt();
    const schemaDescription = buildSchemaDescription(schema);
    const userPrompt = buildUserPrompt(text, schemaDescription);

    return `${systemPrompt}\n\n${userPrompt}`;
}

/**
 * Build system instructions
 */
function buildSystemPrompt(): string {
    return `You are a precise data extraction system. Your ONLY task is to extract structured data from the provided text according to the given schema.

CRITICAL RULES:
1. Output ONLY valid JSON - no explanations, no markdown, no code blocks
2. Follow the schema exactly - use the exact field names provided
3. For missing data: use null
4. For dates: use ISO-8601 format (YYYY-MM-DD)
5. For numbers: use numeric values without currency symbols or separators
6. For booleans: use true or false
7. Be intelligent about extraction - handle typos, formatting issues, and OCR errors
8. Never make up data - if you cannot find a value, use null
9. Never include any text before or after the JSON object
10. The JSON must be parseable by standard JSON parsers

Your response must be a single valid JSON object, nothing else.`;
}

/**
 * Build schema description for the AI
 */
function buildSchemaDescription(schema: Schema, indent = 0): string {
    const lines: string[] = [];
    const prefix = '  '.repeat(indent);

    for (const [key, value] of Object.entries(schema)) {
        if (typeof value === 'string') {
            // Primitive type
            lines.push(`${prefix}"${key}": <${value}>`);
        } else if (Array.isArray(value)) {
            // Array type
            const itemType = typeof value[0] === 'string' ? value[0] : 'object';
            if (itemType === 'object') {
                lines.push(`${prefix}"${key}": [array of objects with structure:`);
                lines.push(buildSchemaDescription(value[0] as Schema, indent + 1));
                lines.push(`${prefix}]`);
            } else {
                lines.push(`${prefix}"${key}": [array of <${itemType}>]`);
            }
        } else {
            // Nested object
            lines.push(`${prefix}"${key}": {`);
            lines.push(buildSchemaDescription(value as Schema, indent + 1));
            lines.push(`${prefix}}`);
        }
    }

    return lines.join('\n');
}

/**
 * Build user prompt with text and schema
 */
function buildUserPrompt(text: string, schemaDescription: string): string {
    return `Extract data from this text according to the schema below.

TEXT TO EXTRACT FROM:
"""
${text.trim()}
"""

EXPECTED SCHEMA:
{
${schemaDescription}
}

RESPONSE (valid JSON only):`;
}
