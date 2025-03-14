import { describe, it, expect } from 'vitest';
import { ChatParser } from './chat-parser.js';
import type { ChatMessage } from '../types/conversation.js';

describe('ChatParser', () => {
  const mockContent = `
Human: Let's build a calculator app
  
Thought for 2 seconds
I'll help you create a calculator app. Let's break this down into steps.

\`\`\`typescript
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
}
\`\`\`

<file_content path="src/calculator.ts">
export class Calculator implements Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}
</file_content>

[ERROR] TypeScript error: Property 'subtract' is missing.
`;

  it('should parse chat content correctly', async () => {
    const parser = new ChatParser({ useLLM: false });
    const result = await parser.parseContent(mockContent);

    // Check basic message count
    expect(result.messages.length).toBeGreaterThan(0);

    // Check summary
    expect(result.summary.totalMessages).toBeGreaterThan(0);
    expect(result.summary.errorsEncountered).toBe(1);
    expect(result.summary.thoughtTimeTotal).toBe(2);

    // Find code block message
    const codeMessage = result.messages.find((m: ChatMessage) => 
      m.type === 'code' && 
      m.metadata?.codeBlocks?.some((b) => b.language === 'typescript')
    );
    expect(codeMessage).toBeDefined();

    // Find file reference message
    const fileMessage = result.messages.find((m: ChatMessage) =>
      m.type === 'file' &&
      m.metadata?.fileReferences?.some((f) => f.path === 'src/calculator.ts')
    );
    expect(fileMessage).toBeDefined();

    // Find error message
    const errorMessage = result.messages.find((m: ChatMessage) =>
      m.type === 'error' &&
      m.metadata?.errors?.some((e) => e.includes('TypeScript error'))
    );
    expect(errorMessage).toBeDefined();
  });

  it('should handle empty content', async () => {
    const parser = new ChatParser({ useLLM: false });
    const result = await parser.parseContent('');

    expect(result.messages).toHaveLength(0);
    expect(result.summary.totalMessages).toBe(0);
  });

  it('should detect thought time correctly', async () => {
    const parser = new ChatParser({ useLLM: false });
    const result = await parser.parseContent('Thought for 5 seconds\nSome content');

    const message = result.messages.find((m: ChatMessage) => m.metadata?.thoughtSeconds === 5);
    expect(message).toBeDefined();
  });

  it('should parse multiple code blocks', async () => {
    const content = `
Here's some code:
\`\`\`typescript
const x = 1;
\`\`\`
And more code:
\`\`\`javascript
const y = 2;
\`\`\`
`;

    const parser = new ChatParser({ useLLM: false });
    const result = await parser.parseContent(content);

    expect(result.summary.codeBlocksByLanguage).toEqual({
      typescript: 1,
      javascript: 1
    });
  });
});