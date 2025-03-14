import { readFileSync } from 'fs';
import type { ChatMessage, ParsedConversation, ParserOptions } from '../types/conversation.js';
import { LLMClassifier, MockLLMClassifier } from '../services/llm-classifier.js';
import { RuleValidator } from '../services/rule-validator.js';

interface LineWithNumber {
  content: string;
  lineNumber: number;
}

export class ChatParser {
  private llmClassifier: LLMClassifier | MockLLMClassifier;
  private ruleValidator: RuleValidator;
  private debug: boolean;

  constructor(options: ParserOptions) {
    this.debug = options.debug || false;
    this.ruleValidator = new RuleValidator();
    
    if (options.useLLM && options.apiKey) {
      // Import the provider configuration
      const { getConfiguredProvider } = require('../services/providers/config.js');
      const provider = getConfiguredProvider();
      this.llmClassifier = new LLMClassifier(provider, this.debug);
    } else {
      this.llmClassifier = new MockLLMClassifier();
      if (options.useLLM) {
        console.warn('LLM requested but no API key provided. Using mock classifier.');
      }
    }
  }

  async parseFile(filePath: string): Promise<ParsedConversation> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      return await this.parseContent(content);
    } catch (error) {
      throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async parseContent(content: string): Promise<ParsedConversation> {
    // Split content into lines and preserve line numbers
    const lines: LineWithNumber[] = content.split('\n').map((line, index) => ({
      content: line,
      lineNumber: index + 1
    }));

    // Initialize conversation data
    const messages: ChatMessage[] = [];
    let currentMessage: Partial<ChatMessage> = {};
    let currentLines: string[] = [];

    // Process lines and group them into messages
    for (const line of lines) {
      if (this.isMessageBoundary(line.content) && currentLines.length > 0) {
        // Process the accumulated message
        const message = await this.processMessage(currentLines.join('\n'), currentMessage.lineNumber || 0);
        messages.push(message);
        
        // Reset for next message
        currentMessage = {
          lineNumber: line.lineNumber
        };
        currentLines = [];
      }
      
      currentLines.push(line.content);
    }

    // Process the last message if exists
    if (currentLines.length > 0) {
      const message = await this.processMessage(
        currentLines.join('\n'), 
        currentMessage.lineNumber || lines[0].lineNumber
      );
      messages.push(message);
    }

    return {
      messages,
      summary: this.generateSummary(messages)
    };
  }

  private async processMessage(content: string, lineNumber: number): Promise<ChatMessage> {
    try {
      // First pass: LLM classification
      const llmResult = await this.llmClassifier.classifyMessage(content, lineNumber);
      
      // Second pass: Rule-based validation and enhancement
      const validatedMessage = this.ruleValidator.validate(llmResult);

      if (this.debug) {
        console.log(`Processed message at line ${lineNumber}:`, {
          type: validatedMessage.type,
          metadata: validatedMessage.metadata
        });
      }

      return validatedMessage;
    } catch (error) {
      console.error(`Error processing message at line ${lineNumber}:`, error);
      return {
        type: 'error',
        content,
        lineNumber,
        metadata: {
          errors: [`Processing failed: ${error instanceof Error ? error.message : String(error)}`]
        }
      };
    }
  }

  private isMessageBoundary(line: string): boolean {
    // Check for common message boundary patterns
    return (
      line.trim().length === 0 || // Empty lines
      line.startsWith('Human:') ||
      line.startsWith('Assistant:') ||
      line.startsWith('[') || // Tool results often start with [
      /<(task|thinking|file_content|tool_use)>/.test(line) // XML-style tags
    );
  }

  private generateSummary(messages: ChatMessage[]): ParsedConversation['summary'] {
    const summary = {
      totalMessages: messages.length,
      messagesByType: {} as Record<string, number>,
      codeBlocksByLanguage: {} as Record<string, number>,
      filesReferenced: [] as string[],
      errorsEncountered: 0,
      thoughtTimeTotal: 0
    };

    for (const message of messages) {
      // Count message types
      summary.messagesByType[message.type] = (summary.messagesByType[message.type] || 0) + 1;

      // Process metadata
      if (message.metadata) {
        // Count code blocks by language
        if (message.metadata.codeBlocks) {
          for (const block of message.metadata.codeBlocks) {
            summary.codeBlocksByLanguage[block.language] = 
              (summary.codeBlocksByLanguage[block.language] || 0) + 1;
          }
        }

        // Collect unique file references
        if (message.metadata.fileReferences) {
          for (const ref of message.metadata.fileReferences) {
            if (!summary.filesReferenced.includes(ref.path)) {
              summary.filesReferenced.push(ref.path);
            }
          }
        }

        // Count errors
        if (message.metadata.errors) {
          summary.errorsEncountered += message.metadata.errors.length;
        }

        // Sum up thought time
        if (message.metadata.thoughtSeconds) {
          summary.thoughtTimeTotal += message.metadata.thoughtSeconds;
        }
      }
    }

    return summary;
  }
}