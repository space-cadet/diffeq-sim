import OpenAI from 'openai';

export interface LLMProvider {
  createChatCompletion(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user'; content: string }>;
    temperature: number;
    max_tokens: number;
  }): Promise<{ choices: Array<{ message: { content: string } }> }>;
}

export class OpenAIChatProvider implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async createChatCompletion(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user'; content: string }>;
    temperature: number;
    max_tokens: number;
  }): Promise<{ choices: Array<{ message: { content: string } }> }> {
    const response = await this.client.chat.completions.create({
      ...params,
      messages: params.messages as any
    });
    
    return {
      choices: response.choices.map(choice => ({
        message: {
          content: choice.message.content || ''
        }
      }))
    };
  }
}