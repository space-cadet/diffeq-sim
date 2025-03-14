export type MessageType = 
  | 'user'
  | 'assistant'
  | 'code'
  | 'error'
  | 'file'
  | 'system';

export interface CodeBlock {
  language: string;
  content: string;
  project?: string;
}

export interface FileReference {
  path: string;
  content: string;
  error?: string;
}

export interface ChatMessage {
  type: MessageType;
  content: string;
  lineNumber: number;
  metadata?: {
    thoughtSeconds?: number;
    codeBlocks?: CodeBlock[];
    fileReferences?: FileReference[];
    errors?: string[];
  };
}

export interface ConversationSummary {
  totalMessages: number;
  messagesByType: Record<MessageType, number>;
  codeBlocksByLanguage: Record<string, number>;
  filesReferenced: string[];
  errorsEncountered: number;
  thoughtTimeTotal: number;
}

export interface ParsedConversation {
  messages: ChatMessage[];
  summary: ConversationSummary;
}

export interface ParserOptions {
  useLLM: boolean;
  apiKey?: string;
  debug?: boolean;
}