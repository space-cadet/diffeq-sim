import type { ChatMessage, CodeBlock, FileReference } from '../types/conversation.js';

export class RuleValidator {
  private static CODE_BLOCK_REGEX = /```(\w+)?\s*([\s\S]*?)```/g;
  private static FILE_REF_REGEX = /<file_content path="([^"]+)">([\s\S]*?)<\/file_content>/g;
  private static THOUGHT_TIME_REGEX = /Thought for (\d+) seconds?/;
  private static ERROR_REGEX = /\[ERROR\]|\[Error\]|Error:|error:/i;
  private static TOOL_USE_REGEX = /<(\w+)>([\s\S]*?)<\/\1>/;

  validate(message: Partial<ChatMessage>): ChatMessage {
    const validatedMessage = { ...message } as ChatMessage;
    const content = message.content || '';

    // Extract thought time
    const thoughtMatch = content.match(RuleValidator.THOUGHT_TIME_REGEX);
    if (thoughtMatch) {
      validatedMessage.metadata = {
        ...validatedMessage.metadata,
        thoughtSeconds: parseInt(thoughtMatch[1], 10)
      };
    }

    // Extract code blocks
    const codeBlocks: CodeBlock[] = [];
    let codeMatch;
    const codeRegex = new RegExp(RuleValidator.CODE_BLOCK_REGEX);
    while ((codeMatch = codeRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: codeMatch[1] || 'plaintext',
        content: codeMatch[2].trim()
      });
    }
    if (codeBlocks.length > 0) {
      validatedMessage.metadata = {
        ...validatedMessage.metadata,
        codeBlocks
      };
      if (!validatedMessage.type || validatedMessage.type === 'system') {
        validatedMessage.type = 'code';
      }
    }

    // Extract file references
    const fileRefs: FileReference[] = [];
    let fileMatch;
    const fileRegex = new RegExp(RuleValidator.FILE_REF_REGEX);
    while ((fileMatch = fileRegex.exec(content)) !== null) {
      fileRefs.push({
        path: fileMatch[1],
        content: fileMatch[2].trim()
      });
    }
    if (fileRefs.length > 0) {
      validatedMessage.metadata = {
        ...validatedMessage.metadata,
        fileReferences: fileRefs
      };
      if (!validatedMessage.type || validatedMessage.type === 'system') {
        validatedMessage.type = 'file';
      }
    }

    // Detect errors
    if (RuleValidator.ERROR_REGEX.test(content)) {
      const errors = content
        .split('\n')
        .filter((line: string) => RuleValidator.ERROR_REGEX.test(line))
        .map((line: string) => line.trim());
      
      validatedMessage.metadata = {
        ...validatedMessage.metadata,
        errors
      };
      if (!validatedMessage.type || validatedMessage.type === 'system') {
        validatedMessage.type = 'error';
      }
    }

    // Validate and enhance type classification
    if (!validatedMessage.type) {
      validatedMessage.type = this.inferMessageType(content);
    }

    return validatedMessage;
  }

  private inferMessageType(content: string): 'user' | 'assistant' | 'system' {
    // Check for common user message patterns
    if (content.includes('<task>') || content.includes('</task>')) {
      return 'user';
    }

    // Check for common assistant patterns
    if (content.includes('<thinking>') || RuleValidator.TOOL_USE_REGEX.test(content)) {
      return 'assistant';
    }

    // Default to system if no clear indicators
    return 'system';
  }
}