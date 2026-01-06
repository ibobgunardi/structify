import { ErrorCode } from '../types';

/**
 * Custom error class for Structify library
 */
export class StructifyError extends Error {
    constructor(
        public code: ErrorCode,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'StructifyError';

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StructifyError);
        }
    }

    /**
     * Get user-friendly error message with suggestions
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            details: this.details,
        };
    }
}

/**
 * Helper functions to create specific errors
 */
export const createInvalidSchemaError = (message: string, details?: any) =>
    new StructifyError(ErrorCode.INVALID_SCHEMA, message, details);

export const createInvalidInputError = (message: string, details?: any) =>
    new StructifyError(ErrorCode.INVALID_INPUT, message, details);

export const createAIError = (message: string, details?: any) =>
    new StructifyError(ErrorCode.AI_ERROR, message, details);

export const createParseError = (message: string, details?: any) =>
    new StructifyError(ErrorCode.PARSE_ERROR, message, details);

export const createNormalizationError = (message: string, details?: any) =>
    new StructifyError(ErrorCode.NORMALIZATION_ERROR, message, details);

export const createConfigError = (message: string, details?: any) =>
    new StructifyError(ErrorCode.CONFIG_ERROR, message, details);
