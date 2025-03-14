import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMProvider } from './openai-provider.js';

export class GeminiChatProvider implements LLMProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async createChatCompletion(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user'; content: string }>;
    temperature: number;
    max_tokens: number;
  }) {
    const model = this.client.getGenerativeModel({ model: params.model });
    // Extract system message if present
    const systemMessage = params.messages.find(m => m.role === 'system');
    const userMessages = params.messages.filter(m => m.role !== 'system');
    
    // Convert user messages to Gemini format
    const convertedMessages = userMessages.map(m => ({
      role: 'user',
      parts: [{ text: m.content }]
    }));
    
    // Set system message as a parameter if present
    const generationConfig = {
      temperature: params.temperature,
      maxOutputTokens: params.max_tokens,
      ...(systemMessage && { systemInstruction: systemMessage.content })
    };

    const result = await model.generateContent({
      contents: convertedMessages,
      generationConfig
    });

    return {
      choices: [{
        message: {
          content: result.response.text()
        }
      }]
    };
  }
}