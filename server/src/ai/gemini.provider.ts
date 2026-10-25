import { IAIProvider, AIMessage, AIGenerateOptions, AIGenerateResult } from './ai.interface';
import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config';

// Maps JSON Schema type strings to Gemini SDK Type enum values
function toGeminiType(jsonType?: string): string {
  switch ((jsonType || 'string').toLowerCase()) {
    case 'number':  return Type.NUMBER;
    case 'integer': return Type.INTEGER;
    case 'boolean': return Type.BOOLEAN;
    case 'array':   return Type.ARRAY;
    case 'object':  return Type.OBJECT;
    default:        return Type.STRING;
  }
}

// Convert our tool definitions (OpenAI-style JSON Schema) to Gemini FunctionDeclarations
function buildFunctionDeclarations(tools: AIGenerateOptions['tools']) {
  if (!tools || tools.length === 0) return undefined;
  return [{
    functionDeclarations: tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: {
        type: Type.OBJECT,
        properties: Object.fromEntries(
          Object.entries(t.parameters.properties).map(([key, val]: [string, any]) => [
            key,
            {
              type: toGeminiType(val.type),
              description: val.description || '',
              ...(val.enum ? { enum: val.enum } : {}),
            },
          ])
        ),
        required: t.parameters.required || [],
      },
    })),
  }];
}

export class GeminiAIProvider implements IAIProvider {
  public name: string;
  private ai: GoogleGenAI | null = null;

  constructor() {
    this.name = config.ai.geminiModel || 'gemini-3.5-flash';
    if (config.ai.geminiApiKey) {
      this.ai = new GoogleGenAI({ apiKey: config.ai.geminiApiKey });
    }
  }

  public async generate(messages: AIMessage[], options: AIGenerateOptions): Promise<AIGenerateResult> {
    if (!this.ai || !config.ai.geminiApiKey) {
      throw new Error('Gemini API key is not configured in GEMINI_API_KEY environment variable');
    }

    const startTime = Date.now();

    // ── 1. Extract system instruction (Gemini requires it in config, not in contents) ──
    const systemMsg = messages.find((m) => m.role === 'system');
    const chatMessages = messages.filter((m) => m.role !== 'system');

    // ── 2. Map roles: assistant → 'model', everything else → 'user' ──
    //    Gemini enforces strict user/model alternation. Merge consecutive same-role turns.
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const m of chatMessages) {
      const geminiRole: 'user' | 'model' = m.role === 'assistant' ? 'model' : 'user';
      const last = contents[contents.length - 1];
      if (last && last.role === geminiRole) {
        // Merge into existing turn to avoid same-role adjacency error
        last.parts.push({ text: m.content });
      } else {
        contents.push({ role: geminiRole, parts: [{ text: m.content }] });
      }
    }

    // Gemini requires the first turn to be from the user
    if (contents.length === 0 || contents[0].role !== 'user') {
      contents.unshift({ role: 'user', parts: [{ text: '(begin)' }] });
    }

    // ── 3. Build config ──
    const apiConfig: Record<string, any> = {
      temperature: options.temperature ?? 0.5,
      maxOutputTokens: options.maxTokens ?? 2048,
    };

    if (systemMsg?.content) {
      apiConfig.systemInstruction = systemMsg.content;
    }

    if (options.responseFormat === 'json') {
      apiConfig.responseMimeType = 'application/json';
    }

    const functionDeclarations = buildFunctionDeclarations(options.tools);
    if (functionDeclarations) {
      apiConfig.tools = functionDeclarations;
    }

    // ── 4. Call Gemini ──
    const response = await this.ai.models.generateContent({
      model: this.name,
      contents,
      config: apiConfig,
    });

    const latencyMs = Date.now() - startTime;

    // ── 5. Check for function call in response ──
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const fcPart = parts.find((p: any) => p.functionCall);

    if (fcPart?.functionCall) {
      const fc = fcPart.functionCall;
      const fcName = fc.name ?? 'unknown_tool';
      const promptTokens = (response.usageMetadata?.promptTokenCount as number) ?? 100;
      const completionTokens = (response.usageMetadata?.candidatesTokenCount as number) ?? 10;
      return {
        content: `Invoking tool: ${fcName}`,
        toolCalls: [{
          id: `gemini_fc_${Date.now()}`,
          name: fcName,
          args: fc.args ?? {},
        }],
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          estimatedCost: (promptTokens * 0.00000035) + (completionTokens * 0.00000105),
        },
        latencyMs,
        model: this.name,
      };
    }

    // ── 6. Normal text response ──
    // gemini-flash-latest is a thinking model: parts may include thought parts (thoughtSignature).
    // Concatenate only the plain text parts (those without thoughtSignature).
    const allParts: any[] = response.candidates?.[0]?.content?.parts ?? [];
    const textParts = allParts.filter((p: any) => p.text !== undefined && !p.thoughtSignature);
    const responseText = textParts.length > 0
      ? textParts.map((p: any) => p.text).join('')
      : (response.text ?? '');

    let parsedJson: any = null;
    if (options.responseFormat === 'json') {
      try {
        parsedJson = JSON.parse(responseText);
      } catch {
        const m = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (m) { try { parsedJson = JSON.parse(m[1]); } catch {} }
      }
    }

    const promptTokens = (response.usageMetadata?.promptTokenCount as number)
      ?? Math.ceil(messages.map((m) => m.content).join(' ').length / 4);
    const completionTokens = (response.usageMetadata?.candidatesTokenCount as number)
      ?? Math.ceil(responseText.length / 4);

    return {
      content: responseText,
      parsedJson,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost: (promptTokens * 0.00000035) + (completionTokens * 0.00000105),
      },
      latencyMs,
      model: this.name,
    };
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    if (!this.ai || !config.ai.geminiApiKey) {
      throw new Error('Gemini API key is not configured');
    }
    const response: any = await this.ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });
    return response.embedding?.values ?? response.embeddings?.[0]?.values ?? [];
  }
}
