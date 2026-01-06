import { extract, init, generateMessyText } from '../src';

/**
 * Basic invoice extraction example
 */
async function basicExample() {
    // Initialize (or use OPENROUTER_API_KEY env var)
    init({
        openRouterApiKey: process.env.OPENROUTER_API_KEY!,
    });

    // Messy invoice text (like from OCR or legacy system)
    const messyInput = `
Inv No: 88921
Total Rp. 1.250.000
Date 03/12/24
PT Maju Jaya
`;

    // Define expected output structure
    const result = await extract(messyInput, {
        invoice_number: 'string',
        invoice_date: 'date',
        total_amount: 'number',
        vendor_name: 'string',
    });

    console.log('Extracted data:', JSON.stringify(result, null, 2));
    /* Output:
    {
      "invoice_number": "88921",
      "invoice_date": "2024-12-03",
      "total_amount": 1250000,
      "vendor_name": "PT Maju Jaya"
    }
    */
}

/**
 * Receipt extraction example
 */
async function receiptExample() {
    const messy = generateMessyText({
        domain: 'receipt',
        language: 'en',
        chaosLevel: 'medium',
    });

    console.log('Input:', messy);

    const result = await extract(messy, {
        items: [
            {
                name: 'string',
                price: 'number',
            },
        ],
        total: 'number',
        date: 'date',
    });

    console.log('Extracted:', result);
}

/**
 * Nested object example
 */
async function nestedExample() {
    const orderText = `
Order #12345
Customer: John Doe
Email: john@example.com
Ship to: 123 Main St, NYC
Items:
- Widget A: $25
- Widget B: $40
Total: $65
`;

    const result = await extract(orderText, {
        order_id: 'string',
        customer: {
            name: 'string',
            email: 'string',
        },
        shipping_address: 'string',
        items: [
            {
                name: 'string',
                price: 'number',
            },
        ],
        total: 'number',
    });

    console.log('Extracted:', JSON.stringify(result, null, 2));
}

/**
 * Run examples
 */
async function main() {
    console.log('=== Basic Invoice Example ===\n');
    await basicExample();

    console.log('\n=== Receipt Example ===\n');
    await receiptExample();

    console.log('\n=== Nested Object Example ===\n');
    await nestedExample();
}

main().catch(console.error);
