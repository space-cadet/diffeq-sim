# Chat Parser

A sophisticated chat log parser that combines LLM-based semantic analysis with rule-based pattern matching to extract structured data from chat conversations.

## Features

- Hybrid parsing approach using both LLM and rule-based analysis
- Automatic message type classification
- Code block extraction with language detection
- File reference parsing
- Error message detection
- Thought time tracking
- Comprehensive conversation summaries
- TypeScript support
- CLI interface

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd chat-parser

# Install dependencies
pnpm install
```

## Usage

### CLI

The chat parser can be used from the command line:

```bash
# Basic usage
pnpm start input.md output.json

# Use LLM for enhanced classification (requires OpenAI API key)
OPENAI_API_KEY=your-key pnpm start input.md output.json --use-llm

# Enable debug logging
pnpm start input.md output.json --debug
```

### Options

- `--use-llm`: Enable LLM-based classification (requires OPENAI_API_KEY)
- `--debug`: Enable debug logging
- `--help`, `-h`: Show help message

### Environment Variables

- `OPENAI_API_KEY`: Required when using `--use-llm` option

## Output Format

The parser generates a JSON file with the following structure:

```typescript
{
  "messages": [
    {
      "type": "user" | "assistant" | "code" | "error" | "file" | "system",
      "content": string,
      "lineNumber": number,
      "metadata": {
        "thoughtSeconds"?: number,
        "codeBlocks"?: Array<{
          "language": string,
          "content": string
        }>,
        "fileReferences"?: Array<{
          "path": string,
          "content": string
        }>,
        "errors"?: string[]
      }
    }
  ],
  "summary": {
    "totalMessages": number,
    "messagesByType": Record<string, number>,
    "codeBlocksByLanguage": Record<string, number>,
    "filesReferenced": string[],
    "errorsEncountered": number,
    "thoughtTimeTotal": number
  }
}
```

## Development

```bash
# Run tests
pnpm test

# Watch mode for tests
pnpm test:watch

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

## Message Type Detection

The parser identifies several types of messages:

1. **User Messages**
   - Task descriptions
   - Questions
   - Feedback

2. **Assistant Messages**
   - Responses with thinking time
   - Tool usage
   - Explanations

3. **Code Blocks**
   - Detected by markdown code fence (```)
   - Language detection
   - Project context

4. **File References**
   - File paths
   - File contents
   - Error states

5. **Error Messages**
   - Compilation errors
   - Runtime errors
   - Tool execution failures

6. **System Messages**
   - Environment details
   - Status updates
   - Tool results

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT