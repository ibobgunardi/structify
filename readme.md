# Structify

[![npm version](https://img.shields.io/npm/v/structify.svg)](https://www.npmjs.com/package/structify)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**AI-powered data extraction library** — Normalize messy text into structured, predictable JSON.

## What is Structify?

Structify is a **production-ready developer library** that helps you turn unreliable, messy text into clean, structured data using AI. Think of it as a semantic normalization layer for your applications.

**This is NOT**:
- ❌ A prompt playground
- ❌ A raw AI wrapper  
- ❌ An OCR engine

**This IS**:
- ✅ A developer utility
- ✅ A semantic normalization layer
- ✅ Infrastructure-grade tooling
- ✅ Schema-first data extraction

## Installation

```bash
npm install structify
```

## Quick Start

```typescript
import { extract, init } from 'structify';

// Initialize with your OpenRouter API key
init({
  openRouterApiKey: process.env.OPENROUTER_API_KEY
});

// Messy input (OCR, legacy API, logs, etc.)
const messyInput = `
Inv No: 88921
Total Rp. 1.250.000
Date 03/12/24
PT Maju Jaya
`;

// Define what you want
const result = await extract(messyInput, {
  invoice_number: 'string',
  invoice_date: 'date',
  total_amount: 'number',
  vendor_name: 'string'
});

console.log(result);
/* Output:
{
  "invoice_number": "88921",
  "invoice_date": "2024-12-03",
  "total_amount": 1250000,
  "vendor_name": "PT Maju Jaya"
}
*/
```

## Core Features

### 🎯 Schema-First
Define the structure you want. Structify handles the rest.

### 🔒 Type-Safe
Full TypeScript support with strict type definitions.

### 🛡️ Production-Ready
- Input validation
- Retry logic with exponential backoff
- Comprehensive error handling
- Configurable limits

### 🌍 Smart Normalization
- Dates: Multiple formats → ISO-8601
- Numbers: Currency symbols, separators → Clean numeric values
- Booleans: "yes"/"no"/"1"/"0" → true/false
- Missing data → null (never makes up data)

### 🔧 Developer-Focused
- No prompt engineering required
- Deterministic behavior (temperature=0)
- Debug mode available
- Predictable errors

## API Reference

### `extract(text, schema, options?)`

Extract structured data from text.

**Parameters:**
- `text` (string): The messy input text
- `schema` (Schema): Expected output structure
- `options` (ExtractOptions, optional):
  - `model?: string` - Override AI model
  - `timeout?: number` - Request timeout (ms)
  - `maxRetries?: number` - Retry attempts
  - `debug?: boolean` - Enable debug logging

**Returns:** `Promise<T>` - Normalized data matching schema

### `init(config)`

Initialize the library with configuration.

**Parameters:**
- `config` (StructifyConfig):
  - `openRouterApiKey: string` - **Required**. Your OpenRouter API key
  - `defaultModel?: string` - Default: `nvidia/nemotron-nano-12b-v2-vl:free` (free, reliable)
  - `maxInputSize?: number` - Default: 50000 characters
  - `maxSchemaDepth?: number` - Default: 5 levels
  - `maxFieldCount?: number` - Default: 100 fields
  - `timeout?: number` - Default: 30000ms
  - `maxRetries?: number` - Default: 3 attempts

### `generateMessyText(options)`

Generate messy text for testing and demos.

**Parameters:**
- `options` (MessyTextOptions):
  - `domain: 'invoice' | 'receipt' | 'shipping' | 'log'`
  - `language?: 'en' | 'id'` - Default: 'en'
  - `chaosLevel?: 'low' | 'medium' | 'high'` - Default: 'medium'

**Returns:** `string` - Generated messy text

## Supported Schema Types

| Type | Description | Example Output |
|------|-------------|----------------|
| `string` | Text value | `"PT Maju Jaya"` |
| `number` | Numeric value | `1250000` |
| `boolean` | True/false | `true` |
| `date` | ISO-8601 date | `"2024-12-03"` |
| `array` | Array of items | `[{...}, {...}]` |
| `object` | Nested object | `{ key: value }` |

### Nested Schema Example

```typescript
const result = await extract(orderText, {
  order_id: 'string',
  customer: {
    name: 'string',
    email: 'string'
  },
  items: [
    {
      name: 'string',
      price: 'number'
    }
  ],
  total: 'number'
});
```

## Error Handling

All errors are typed with specific error codes:

```typescript
import { StructifyError, ErrorCode } from 'structify';

try {
  await extract(text, schema);
} catch (error) {
  if (error instanceof StructifyError) {
    switch (error.code) {
      case ErrorCode.INVALID_SCHEMA:
        // Schema validation failed
        break;
      case ErrorCode.INVALID_INPUT:
        // Input text invalid or too large
        break;
      case ErrorCode.AI_ERROR:
        // OpenRouter request failed
        break;
      case ErrorCode.PARSE_ERROR:
        // JSON parsing failed
        break;
      case ErrorCode.CONFIG_ERROR:
        // Missing or invalid configuration
        break;
    }
  }
}
```

## Configuration

### Environment Variables

```bash
# Required
OPENROUTER_API_KEY=your_key_here

# Optional - specify model (default: nvidia/nemotron-nano-12b-v2-vl:free)
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Get your API key at [OpenRouter](https://openrouter.ai/keys)

**Available Models:**
- `nvidia/nemotron-nano-12b-v2-vl:free` (default, free, reliable)
- `openai/gpt-4o-mini` (paid, more accurate)
- `anthropic/claude-3-haiku` (paid)
- `google/gemini-2.0-flash-exp:free` (free alternative)
- `meta-llama/llama-3.2-3b-instruct:free` (free alternative)
- See more at [OpenRouter Models](https://openrouter.ai/models)

### Programmatic Configuration

```typescript
init({
  openRouterApiKey: 'your_key',
  defaultModel: 'openai/gpt-4o-mini', // Override free model
  maxRetries: 5,
  timeout: 60000
});
```

## Use Cases

- 📄 **Invoice/Receipt Processing**: Extract structured data from scanned documents
- 🔍 **OCR Normalization**: Clean up OCR output into structured format
- 📊 **Legacy API Response Cleaning**: Normalize inconsistent API responses
- 📝 **Log Parsing**: Extract structured data from application logs
- 🌐 **Multi-format Data Integration**: Unify data from various sources

## Limitations

> [!IMPORTANT]
> **AI-Based**: Results depend on AI model performance. Always validate critical data.

- Maximum input size: 50,000 characters (configurable)
- Maximum schema depth: 5 levels (configurable)
- Maximum field count: 100 fields (configurable)
- Requires OpenRouter API key
- Not 100% accurate - validate critical extractions

## Examples

See the [`examples/`](examples/) directory for more:
- [basic.ts](examples/basic.ts) - Invoice and receipt extraction
- [advanced.ts](examples/advanced.ts) - Error handling, custom config

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Type check
npm run typecheck

# Development mode (watch)
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Bobi Gunardi

## Author

**Bobi Gunardi**
- GitHub: [@ibobgunardi](https://github.com/ibobgunardi)
- npm: [gorgom123](https://www.npmjs.com/~gorgom123)

## Positioning

Structify is designed to feel like **Zod + AI** — a serious, infrastructure-grade developer tool for semantic data normalization. It's perfect for:

- Backend services processing unstructured input
- Frontend applications handling messy API responses
- Serverless functions normalizing data
- ETL pipelines cleaning data sources

---

**Built for developers who need predictable, structured data from unpredictable sources.**