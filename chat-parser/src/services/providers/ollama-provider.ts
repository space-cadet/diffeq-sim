import type { LLMProvider } from './openai-provider.js';

export class OllamaChatProvider implements LLMProvider {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async createChatCompletion(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user'; content: string }>;
    temperature: number;
    max_tokens: number;
  }) {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        options: {
          temperature: params.temperature,
          num_predict: params.max_tokens
        }
      })
    });

    const data = await response.json();
    return {
      choices: [{
        message: {
          content: data.message.content
        }
      }]
    };
  }
}