import OpenAI from 'openai';
import { AIOptions } from '../types';
import { createAIError } from '../errors/StructifyError';

/**
 * Call OpenRouter API using OpenAI SDK
 */
export async function callOpenRouter(
    apiKey: string,
    prompt: string,
    options: AIOptions
): Promise<string> {
    const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
            'HTTP-Referer': 'https://github.com/structify',
            'X-Title': 'Structify',
        },
    });

    try {
        const completion = await client.chat.completions.create({
            model: options.model,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: options.temperature,
            max_tokens: options.maxTokens,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw createAIError('OpenRouter returned empty response', {
                completion,
            });
        }

        return content;
    } catch (error: any) {
        // Handle OpenAI SDK errors
        if (error.status === 401) {
            throw createAIError('Invalid OpenRouter API key', {
                status: error.status,
                message: error.message,
            });
        }

        if (error.status === 429) {
            throw createAIError('OpenRouter rate limit exceeded', {
                status: error.status,
                message: error.message,
            });
        }

        if (error.status >= 500) {
            throw createAIError('OpenRouter server error', {
                status: error.status,
                message: error.message,
            });
        }

        // Re-throw StructifyError as-is
        if (error.name === 'StructifyError') {
            throw error;
        }

        // Generic AI error
        throw createAIError(`OpenRouter request failed: ${error.message}`, {
            originalError: error.message,
            stack: error.stack,
        });
    }
}

/**
 * Call OpenRouter with retry logic
 */
export async function callWithRetry(
    apiKey: string,
    prompt: string,
    options: AIOptions,
    maxRetries: number
): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await callOpenRouter(apiKey, prompt, options);
        } catch (error: any) {
            lastError = error;

            // Don't retry on auth errors
            if (error.code === 'AI_ERROR' && error.details?.status === 401) {
                throw error;
            }

            // Wait before retry (exponential backoff)
            if (attempt < maxRetries - 1) {
                const waitMs = Math.min(1000 * Math.pow(2, attempt), 10000);
                await new Promise((resolve) => setTimeout(resolve, waitMs));
            }
        }
    }

    throw createAIError(
        `OpenRouter request failed after ${maxRetries} attempts`,
        { lastError: lastError?.message }
    );
}
