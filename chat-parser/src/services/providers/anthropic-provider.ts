import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider } from './openai-provider.js';

export class AnthropicChatProvider implements LLMProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async createChatCompletion(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user'; content: string }>;
    temperature: number;
    max_tokens: number;
  }) {
    const response = await this.client.messages.create({
      model: params.model,
      messages: params.messages.map(m => ({
        role: m.role === 'system' ? 'assistant' : m.role,
        content: m.content
      })),
      temperature: params.temperature,
      max_tokens: params.max_tokens
    });

    // Extract text content safely from the response
    let textContent = '';
    if (response.content && response.content.length > 0) {
      const firstContent = response.content[0];
      if ('text' in firstContent) {
        textContent = firstContent.text;
      }
    }

    return {
      choices: [{
        message: {
          content: textContent
        }
      }]
    };
  }
}