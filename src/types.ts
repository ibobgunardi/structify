/**
 * Supported schema field types
 */
export type SchemaFieldType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

/**
 * Schema definition with recursive support
 */
export type Schema = {
    [key: string]: SchemaFieldType | Schema | Schema[];
};

/**
 * Configuration for the Structify library
 */
export interface StructifyConfig {
    /** OpenRouter API key */
    openRouterApiKey: string;
    /** Default AI model to use (default: openai/gpt-4o-mini) */
    defaultModel?: string;
    /** Maximum input text size in characters (default: 50000) */
    maxInputSize?: number;
    /** Maximum schema depth (default: 5) */
    maxSchemaDepth?: number;
    /** Maximum field count per schema (default: 100) */
    maxFieldCount?: number;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Maximum retry attempts (default: 3) */
    maxRetries?: number;
}

/**
 * Options for extract() function
 */
export interface ExtractOptions {
    /** Override default model */
    model?: string;
    /** Override timeout */
    timeout?: number;
    /** Override max retries */
    maxRetries?: number;
    /** Enable debug logging */
    debug?: boolean;
}

/**
 * AI client options
 */
export interface AIOptions {
    model: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
}

/**
 * Messy text generator options
 */
export interface MessyTextOptions {
    /** Domain for generated text (invoice, receipt, shipping, log) */
    domain: 'invoice' | 'receipt' | 'shipping' | 'log';
    /** Language (en, id) */
    language?: 'en' | 'id';
    /** Chaos level (low, medium, high) */
    chaosLevel?: 'low' | 'medium' | 'high';
}

/**
 * Error codes
 */
export enum ErrorCode {
    INVALID_SCHEMA = 'INVALID_SCHEMA',
    INVALID_INPUT = 'INVALID_INPUT',
    AI_ERROR = 'AI_ERROR',
    PARSE_ERROR = 'PARSE_ERROR',
    NORMALIZATION_ERROR = 'NORMALIZATION_ERROR',
    CONFIG_ERROR = 'CONFIG_ERROR',
}
