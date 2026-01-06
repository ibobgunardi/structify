import { extract, init, StructifyError, ErrorCode } from '../src';

/**
 * Error handling example
 */
async function errorHandlingExample() {
    try {
        await extract('some text', {
            field: 'unsupported_type' as any, // Invalid type
        });
    } catch (error) {
        if (error instanceof StructifyError) {
            console.log('Error code:', error.code);
            console.log('Message:', error.message);
            console.log('Details:', error.details);
        }
    }
}

/**
 * Custom retry configuration
 */
async function customRetryExample() {
    init({
        openRouterApiKey: process.env.OPENROUTER_API_KEY!,
        maxRetries: 5, // Increase retry attempts
        timeout: 60000, // 60 seconds
    });

    const result = await extract(
        'Complex text here...',
        { field: 'string' },
        {
            maxRetries: 2, // Override global setting
            debug: true, // Enable debug logging
        }
    );

    console.log(result);
}

/**
 * Missing fields example
 */
async function missingFieldsExample() {
    const incompleteText = `
Invoice #123
Date: 2024-01-15
`;

    const result = await extract(incompleteText, {
        invoice_number: 'string',
        invoice_date: 'date',
        total_amount: 'number', // This is missing
        vendor_name: 'string', // This is also missing
    });

    console.log('Result with nulls:', result);
    /* Output:
    {
      "invoice_number": "123",
      "invoice_date": "2024-01-15",
      "total_amount": null,
      "vendor_name": null
    }
    */
}

/**
 * Custom model example
 */
async function customModelExample() {
    const result = await extract(
        'Extract this...',
        { field: 'string' },
        {
            model: 'anthropic/claude-3-haiku', // Use different model
        }
    );

    console.log(result);
}

async function main() {
    console.log('=== Error Handling ===\n');
    await errorHandlingExample();

    console.log('\n=== Missing Fields ===\n');
    await missingFieldsExample();
}

main().catch(console.error);
