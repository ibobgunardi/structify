import { Schema, SchemaFieldType } from '../types';
import { createInvalidSchemaError } from '../errors/StructifyError';
import { getConfig } from '../config';
import { DEFAULT_LIMITS } from '../utils/limits';

const SUPPORTED_TYPES: SchemaFieldType[] = ['string', 'number', 'boolean', 'date', 'array', 'object'];

/**
 * Validate that a schema is structurally correct
 */
export function validateSchema(schema: Schema, currentDepth = 0): void {
    const config = getConfig();
    const maxDepth = config.maxSchemaDepth || DEFAULT_LIMITS.MAX_SCHEMA_DEPTH;
    const maxFields = config.maxFieldCount || DEFAULT_LIMITS.MAX_FIELD_COUNT;

    // Check depth limit
    if (currentDepth > maxDepth) {
        throw createInvalidSchemaError(
            `Schema depth exceeds maximum of ${maxDepth} levels`,
            { maxDepth, currentDepth }
        );
    }

    const keys = Object.keys(schema);

    // Check field count
    if (keys.length > maxFields) {
        throw createInvalidSchemaError(
            `Schema has too many fields (max: ${maxFields}, found: ${keys.length})`,
            { maxFields, fieldCount: keys.length }
        );
    }

    // Validate each field
    for (const key of keys) {
        const value = schema[key];

        // Handle array type
        if (Array.isArray(value)) {
            if (value.length !== 1) {
                throw createInvalidSchemaError(
                    `Array field "${key}" must have exactly one element defining the item type`,
                    { key, arrayLength: value.length }
                );
            }
            // Recursively validate array item schema if it's a nested object
            if (typeof value[0] === 'object' && value[0] !== null) {
                validateSchema(value[0] as Schema, currentDepth + 1);
            } else if (typeof value[0] === 'string') {
                // Validate primitive type
                if (!SUPPORTED_TYPES.includes(value[0] as SchemaFieldType)) {
                    throw createInvalidSchemaError(
                        `Unsupported array item type: "${value[0]}" for field "${key}". Supported types: ${SUPPORTED_TYPES.join(', ')}`,
                        { key, type: value[0], supportedTypes: SUPPORTED_TYPES }
                    );
                }
            }
            continue;
        }

        // Handle nested object
        if (typeof value === 'object' && value !== null) {
            validateSchema(value as Schema, currentDepth + 1);
            continue;
        }

        // Handle primitive types
        if (typeof value === 'string') {
            if (!SUPPORTED_TYPES.includes(value as SchemaFieldType)) {
                throw createInvalidSchemaError(
                    `Unsupported field type: "${value}" for field "${key}". Supported types: ${SUPPORTED_TYPES.join(', ')}`,
                    { key, type: value, supportedTypes: SUPPORTED_TYPES }
                );
            }
            continue;
        }

        // Invalid type
        throw createInvalidSchemaError(
            `Invalid schema definition for field "${key}". Expected a type string, nested object, or array.`,
            { key, receivedValue: value }
        );
    }
}

/**
 * Count total fields in a schema (including nested)
 */
export function countSchemaFields(schema: Schema): number {
    let count = 0;

    for (const key of Object.keys(schema)) {
        const value = schema[key];
        count++;

        if (Array.isArray(value) && typeof value[0] === 'object') {
            count += countSchemaFields(value[0] as Schema);
        } else if (typeof value === 'object' && value !== null && typeof value !== 'string') {
            count += countSchemaFields(value as Schema);
        }
    }

    return count;
}
