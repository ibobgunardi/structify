import { StructifyConfig } from './types';
import { createConfigError } from './errors/StructifyError';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<StructifyConfig> = {
    defaultModel: 'nvidia/nemotron-nano-12b-v2-vl:free',
    maxInputSize: 50000,
    maxSchemaDepth: 5,
    maxFieldCount: 100,
    timeout: 30000,
    maxRetries: 3,
};

/**
 * Global configuration state
 */
let globalConfig: StructifyConfig | null = null;

/**
 * Initialize the Structify library with configuration
 */
export function init(config: StructifyConfig): void {
    if (!config.openRouterApiKey) {
        throw createConfigError(
            'OpenRouter API key is required. Provide it via config.openRouterApiKey or OPENROUTER_API_KEY environment variable.',
            { receivedConfig: config }
        );
    }

    globalConfig = {
        ...DEFAULT_CONFIG,
        ...config,
    } as StructifyConfig;
}

/**
 * Get current configuration
 * Auto-initialize from environment if not already configured
 */
export function getConfig(): StructifyConfig {
    // Auto-initialize from environment if not configured
    if (!globalConfig) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (apiKey) {
            const envConfig: StructifyConfig = {
                openRouterApiKey: apiKey,
            };

            // Optionally use OPENROUTER_MODEL env var
            if (process.env.OPENROUTER_MODEL) {
                envConfig.defaultModel = process.env.OPENROUTER_MODEL;
            }

            init(envConfig);
        } else {
            throw createConfigError(
                'Structify is not initialized. Call init() with your configuration or set OPENROUTER_API_KEY environment variable.',
                { hint: 'init({ openRouterApiKey: "your-key" })' }
            );
        }
    }

    return globalConfig!;
}

/**
 * Reset configuration (useful for testing)
 */
export function resetConfig(): void {
    globalConfig = null;
}
