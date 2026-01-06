import { getConfig } from '../config';

/**
 * Default limits for safety
 */
export const DEFAULT_LIMITS = {
    MAX_INPUT_SIZE: 50000,
    MAX_SCHEMA_DEPTH: 5,
    MAX_FIELD_COUNT: 100,
    MAX_RETRIES: 3,
    DEFAULT_TIMEOUT: 30000,
} as const;

/**
 * Validate input text size
 */
export function validateInputSize(text: string): void {
    const config = getConfig();
    const maxSize = config.maxInputSize || DEFAULT_LIMITS.MAX_INPUT_SIZE;

    if (text.length > maxSize) {
        throw new Error(
            `Input text exceeds maximum size of ${maxSize} characters (received: ${text.length})`
        );
    }
}

/**
 * Get retry limit
 */
export function getRetryLimit(): number {
    const config = getConfig();
    return config.maxRetries || DEFAULT_LIMITS.MAX_RETRIES;
}

/**
 * Get timeout value
 */
export function getTimeout(overrideTimeout?: number): number {
    if (overrideTimeout !== undefined) {
        return overrideTimeout;
    }
    const config = getConfig();
    return config.timeout || DEFAULT_LIMITS.DEFAULT_TIMEOUT;
}
