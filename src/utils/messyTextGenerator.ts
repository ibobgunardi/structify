import { MessyTextOptions } from '../types';

/**
 * Generate messy text for testing and demos
 */
export function generateMessyText(options: MessyTextOptions): string {
    const { domain, language = 'en', chaosLevel = 'medium' } = options;

    const generators: Record<string, () => string> = {
        invoice: () => generateInvoice(language, chaosLevel),
        receipt: () => generateReceipt(language, chaosLevel),
        shipping: () => generateShipping(language, chaosLevel),
        log: () => generateLog(language, chaosLevel),
    };

    const generator = generators[domain];
    if (!generator) {
        throw new Error(`Unknown domain: ${domain}. Supported: invoice, receipt, shipping, log`);
    }

    return generator();
}

/**
 * Generate messy invoice text
 */
function generateInvoice(lang: string, chaos: string): string {
    const templates = {
        en: {
            low: `Invoice #INV-{invoiceNo}
Date: {date}
Total: ${randomNumber(100, 5000)}
Company: {company}`,
            medium: `Inv No: {invoiceNo}
Total ${randomCurrency()} {amount}
Date {date}
{company}`,
            high: `inv # {invoiceNo}    
Tot4l {currency}. {amount}
Dqte {date}
{company} lnc.`,
        },
        id: {
            low: `Faktur #INV-{invoiceNo}
Tanggal: {date}
Total: Rp {amount}
Perusahaan: {company}`,
            medium: `No Inv: {invoiceNo}
Total Rp. {amount}
Tgl {date}
{company}`,
            high: `lnv No: {invoiceNo}
Tot4l Rp. {amount}
Tg1 {date}
PT {company}`,
        },
    };

    const template = templates[lang as 'en' | 'id']?.[chaos as 'low' | 'medium' | 'high'] || templates.en.medium;

    return template
        .replace('{invoiceNo}', randomInvoiceNumber())
        .replace('{date}', randomDate(chaos))
        .replace('{amount}', randomAmount(chaos))
        .replace('{currency}', randomCurrency())
        .replace('{company}', randomCompany(lang));
}

/**
 * Generate messy receipt text
 */
function generateReceipt(_lang: string, chaos: string): string {
    const items = [
        { name: 'Coffee', price: 4.50 },
        { name: 'Sandwich', price: 8.00 },
        { name: 'Water', price: 2.00 },
    ];

    let receipt = '';
    items.forEach((item) => {
        const price = chaos === 'high' ? item.price.toString().replace('.', ',') : item.price.toFixed(2);
        receipt += `${item.name} - $${price}\n`;
    });

    const total = items.reduce((sum, item) => sum + item.price, 0);
    receipt += `\nTotal: $${total.toFixed(2)}`;
    receipt += `\nDate: ${randomDate(chaos)}`;

    if (chaos === 'high') {
        receipt = receipt.replace(/\./g, '').replace(/o/g, '0');
    }

    return receipt;
}

/**
 * Generate messy shipping info
 */
function generateShipping(_lang: string, chaos: string): string {
    const template = `Tracking: {tracking}
Status: {status}
Estimated: {date}
Destination: {destination}`;

    return template
        .replace('{tracking}', randomTracking())
        .replace('{status}', chaos === 'high' ? 'ln Transit' : 'In Transit')
        .replace('{date}', randomDate(chaos))
        .replace('{destination}', 'New York, NY');
}

/**
 * Generate messy log text
 */
function generateLog(_lang: string, chaos: string): string {
    const levels = ['INFO', 'WARN', 'ERROR'];
    const level = levels[Math.floor(Math.random() * levels.length)];

    return `[${randomDate(chaos)}] ${level}: User login ${chaos === 'high' ? 'fa1led' : 'failed'} - IP: ${randomIP()}`;
}

/**
 * Helper functions
 */
function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomInvoiceNumber(): string {
    return String(randomNumber(10000, 99999));
}

function randomDate(chaos: string): string {
    const day = randomNumber(1, 28);
    const month = randomNumber(1, 12);
    const year = randomNumber(2023, 2024);

    if (chaos === 'low') {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else if (chaos === 'medium') {
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
    } else {
        return `${day}/${month}/${String(year).slice(-2)}`;
    }
}

function randomAmount(chaos: string): string {
    const amount = randomNumber(1000, 9999);

    if (chaos === 'high') {
        // Indonesian format with OCR errors
        return String(amount).replace(/(\d)(\d{3})/, '$1.$2');
    } else if (chaos === 'medium') {
        return String(amount).replace(/(\d)(\d{3})/, '$1.$2');
    }
    return String(amount);
}

function randomCurrency(): string {
    const currencies = ['$', 'Rp', '€', '£'];
    return currencies[Math.floor(Math.random() * currencies.length)];
}

function randomCompany(lang: string): string {
    const companies = lang === 'id'
        ? ['Maju Jaya', 'Sejahtera Abadi', 'Karya Mandiri']
        : ['TechCorp', 'Global Dynamics', 'Innovation Inc'];
    return companies[Math.floor(Math.random() * companies.length)];
}

function randomTracking(): string {
    return `TRK${randomNumber(100000, 999999)}`;
}

function randomIP(): string {
    return `${randomNumber(1, 255)}.${randomNumber(1, 255)}.${randomNumber(1, 255)}.${randomNumber(1, 255)}`;
}
