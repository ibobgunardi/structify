import { Schema, ExtractOptions } from './types';
import { getConfig } from './config';
import { validateSchema } from './schema/validator';
import { validateInputSize, getRetryLimit, getTimeout } from './utils/limits';
import { buildExtractionPrompt } from './prompt/builder';
import { callWithRetry } from './ai/openrouter';
import { parseWithRepair } from './utils/jsonRepair';
import { normalizeDate } from './normalize/date';
import { normalizeNumber } from './normalize/number';
import { normalizeBoolean } from './normalize/boolean';
import { createInvalidInputError, createParseError } from './errors/StructifyError';

/**
 * Extract structured data from messy text using AI
 */
export async function extract<T = any>(
    text: string,
    schema: Schema,
    options: ExtractOptions = {}
): Promise<T> {
    // Validate input
    if (!text || typeof text !== 'string') {
        throw createInvalidInputError('Input text must be a non-empty string');
    }

    validateInputSize(text);
    validateSchema(schema);

    // Get configuration
    const config = getConfig();
    const model = options.model || config.defaultModel || 'openai/gpt-4o-mini';
    const maxRetries = options.maxRetries !== undefined ? options.maxRetries : getRetryLimit();
    const timeout = getTimeout(options.timeout);

    // Build prompt
    const prompt = buildExtractionPrompt(text, schema);

    if (options.debug) {
        console.log('[Structify Debug] Prompt:', prompt);
    }

    // Call AI
    const aiResponse = await callWithRetry(
        config.openRouterApiKey,
        prompt,
        {
            model,
            temperature: 0, // Deterministic
            maxTokens: 4000, // Should be enough for most schemas
            timeout,
        },
        maxRetries
    );

    if (options.debug) {
        console.log('[Structify Debug] AI Response:', aiResponse);
    }

    // Parse JSON
    let parsed: any;
    try {
        parsed = parseWithRepair(aiResponse);
    } catch (error: any) {
        throw createParseError(`Failed to parse AI response as JSON: ${error.message}`, {
            aiResponse: aiResponse.substring(0, 500),
            error: error.message,
        });
    }

    // Normalize values according to schema
    const normalized = normalizeValue(parsed, schema);

    return normalized as T;
}

/**
 * Recursively normalize values according to schema
 */
function normalizeValue(data: any, schema: Schema | Schema[] | string): any {
    // Handle primitive type normalization
    if (typeof schema === 'string') {
        if (data === null || data === undefined) {
            return null;
        }

        switch (schema) {
            case 'string':
                return data === null ? null : String(data);
            case 'number':
                return normalizeNumber(data);
            case 'boolean':
                return normalizeBoolean(data);
            case 'date':
                return normalizeDate(data);
            default:
                return data;
        }
    }

    // Handle array schema
    if (Array.isArray(schema)) {
        if (!Array.isArray(data)) {
            return null;
        }
        const itemSchema = schema[0];
        return data.map((item) => normalizeValue(item, itemSchema));
    }

    // Handle object schema
    if (typeof schema === 'object' && schema !== null) {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            return null;
        }

        const normalized: any = {};
        for (const [key, fieldSchema] of Object.entries(schema)) {
            const value = data[key];
            normalized[key] = normalizeValue(value, fieldSchema);
        }
        return normalized;
    }

    return data;
}
