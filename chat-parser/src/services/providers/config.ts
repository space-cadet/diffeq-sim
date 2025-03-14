import { OpenAIChatProvider } from './openai-provider.js';
import { AnthropicChatProvider } from './anthropic-provider.js';
import { GeminiChatProvider } from './gemini-provider.js';
import { OllamaChatProvider } from './ollama-provider.js';
import type { LLMProvider } from './openai-provider.js';

export function getConfiguredProvider(): LLMProvider {
  const providerType = process.env.LLM_PROVIDER || 'openai';
  
  switch(providerType.toLowerCase()) {
    case 'openai':
      return new OpenAIChatProvider(process.env.OPENAI_API_KEY!);
    case 'anthropic':
      return new AnthropicChatProvider(process.env.ANTHROPIC_API_KEY!);
    case 'gemini':
      return new GeminiChatProvider(process.env.GEMINI_API_KEY!);
    case 'ollama':
      return new OllamaChatProvider(process.env.OLLAMA_BASE_URL);
    default:
      throw new Error(`Unsupported LLM provider: ${providerType}`);
  }
}