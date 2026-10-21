export interface AIMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface AIGenerateOptions {
  workspaceId: string;
  userId?: string;
  module: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  tools?: AIToolDefinition[];
}

export interface AIGenerateResult {
  content: string;
  parsedJson?: any;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: any;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  latencyMs: number;
  model: string;
}

export interface IAIProvider {
  name: string;
  generate(messages: AIMessage[], options: AIGenerateOptions): Promise<AIGenerateResult>;
  generateEmbedding(text: string): Promise<number[]>;
}
