import { IAIProvider, AIMessage, AIGenerateOptions, AIGenerateResult } from './ai.interface';
import OpenAI from 'openai';
import { config } from '../config';

function buildOpenAITools(tools: AIGenerateOptions['tools']): OpenAI.Chat.ChatCompletionTool[] | undefined {
  if (!tools || tools.length === 0) return undefined;
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

export class OpenAIProvider implements IAIProvider {
  public name = 'gpt-4o-mini';
  private client: OpenAI | null = null;

  constructor() {
    if (config.ai.openaiApiKey) {
      this.client = new OpenAI({ apiKey: config.ai.openaiApiKey });
    }
  }

  public async generate(messages: AIMessage[], options: AIGenerateOptions): Promise<AIGenerateResult> {
    if (!this.client || !config.ai.openaiApiKey) {
      throw new Error('OpenAI API key is not configured in OPENAI_API_KEY environment variable');
    }

    const startTime = Date.now();

    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map((m) => {
      if (m.role === 'tool') {
        return { role: 'tool', tool_call_id: m.toolCallId || '', content: m.content };
      }
      return { role: m.role as 'system' | 'user' | 'assistant', content: m.content };
    });

    const openAITools = buildOpenAITools(options.tools);

    const completion = await this.client.chat.completions.create({
      model: this.name,
      messages: formattedMessages,
      temperature: options.temperature ?? 0.5,
      max_tokens: options.maxTokens ?? 2048,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      ...(openAITools ? { tools: openAITools, tool_choice: 'auto' } : {}),
    });

    const latencyMs = Date.now() - startTime;
    const choice = completion.choices[0];

    // ── Handle tool calls ──
    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      const tc = choice.message.tool_calls[0];
      let args: any = {};
      try { args = JSON.parse(tc.function.arguments || '{}'); } catch {}

      const promptTokens = completion.usage?.prompt_tokens ?? 0;
      const completionTokens = completion.usage?.completion_tokens ?? 0;
      return {
        content: `Invoking tool: ${tc.function.name}`,
        toolCalls: [{
          id: tc.id,
          name: tc.function.name,
          args,
        }],
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          estimatedCost: (promptTokens * 0.00000015) + (completionTokens * 0.0000006),
        },
        latencyMs,
        model: this.name,
      };
    }

    // ── Normal text response ──
    const responseText = choice?.message?.content ?? '';

    let parsedJson: any = null;
    if (options.responseFormat === 'json') {
      try {
        parsedJson = JSON.parse(responseText);
      } catch {
        const m = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (m) { try { parsedJson = JSON.parse(m[1]); } catch {} }
      }
    }

    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;

    return {
      content: responseText,
      parsedJson,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost: (promptTokens * 0.00000015) + (completionTokens * 0.0000006),
      },
      latencyMs,
      model: this.name,
    };
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    if (!this.client || !config.ai.openaiApiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }
}
