import OpenAI from 'openai';
import type { ChatMessage, MessageType } from '../types/conversation.js';
import type { LLMProvider } from './providers/openai-provider.js';

const SYSTEM_PROMPT = `You are a chat log analyzer that classifies messages into specific types. For each message, determine:
1. The message type (user, assistant, code, error, file, or system)
2. Any metadata like thought time, code language, or file paths
3. Extract any error messages or important context

Return ONLY a JSON object with these fields (no other text):
{
  "type": "message_type",
  "metadata": {
    "thoughtSeconds": number (if applicable),
    "codeLanguage": string (if code block),
    "filePaths": string[] (if file reference),
    "errors": string[] (if error message)
  }
}`;

export class LLMClassifier {
  private provider: LLMProvider;
  private debug: boolean;

  constructor(provider: LLMProvider, debug = false) {
    this.provider = provider;
    this.debug = debug;
  }

  async classifyMessage(content: string, lineNumber: number): Promise<Partial<ChatMessage>> {
    try {
      const completion = await this.provider.createChatCompletion({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: SYSTEM_PROMPT 
          },
          { 
            role: "user", 
            content: `Analyze this chat message and return ONLY the JSON object (no other text):\n${content}` 
          }
        ],
        temperature: 0,
        max_tokens: 500
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('Empty response from LLM');
      }

      // Improved JSON extraction logic
      try {
        // First try direct JSON parsing
        const result = JSON.parse(responseContent) as {
          type: MessageType;
          metadata: NonNullable<ChatMessage['metadata']>;
        };
        
        if (this.debug) {
          console.log('LLM Classification Result:', result);
        }

        return {
          type: result.type,
          content,
          lineNumber,
          metadata: result.metadata
        };
      } catch (jsonError) {
        // If direct parsing fails, try to extract JSON using regex
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        
        const result = JSON.parse(jsonMatch[0]) as {
          type: MessageType;
          metadata: NonNullable<ChatMessage['metadata']>;
        };
        
        if (this.debug) {
          console.log('LLM Classification Result (extracted):', result);
        }

        return {
          type: result.type,
          content,
          lineNumber,
          metadata: result.metadata
        };
      }
    } catch (error) {
      console.error('Error in LLM classification:', error);
      // Fallback to basic classification
      return {
        type: 'system',
        content,
        lineNumber,
        metadata: {
          errors: [`LLM classification failed: ${error instanceof Error ? error.message : String(error)}`]
        }
      };
    }
  }
}

// Mock classifier for testing or when LLM is not available
export class MockLLMClassifier {
  async classifyMessage(content: string, lineNumber: number): Promise<Partial<ChatMessage>> {
    // Simple rule-based classification
    if (content.startsWith('```')) {
      return {
        type: 'code',
        content,
        lineNumber,
        metadata: {
          codeBlocks: [{
            language: 'unknown',
            content: content.replace(/```/g, '').trim()
          }]
        }
      };
    }

    if (content.includes('Error:')) {
      return {
        type: 'error',
        content,
        lineNumber,
        metadata: {
          errors: [content]
        }
      };
    }

    // Default classification
    return {
      type: 'system',
      content,
      lineNumber
    };
  }
}