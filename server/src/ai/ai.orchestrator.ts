import { IAIProvider, AIMessage, AIGenerateOptions, AIGenerateResult } from './ai.interface';
import { GeminiAIProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';
import { MockAIProvider } from './mock.provider';
import { AIUsage } from '../models';
import { config } from '../config';
import mongoose from 'mongoose';

export class AIOrchestrator {
  private static instance: AIOrchestrator;
  private provider: IAIProvider;
  private mockFallback: MockAIProvider;

  private constructor() {
    this.mockFallback = new MockAIProvider();

    if (config.ai.provider === 'gemini' && config.ai.geminiApiKey) {
      this.provider = new GeminiAIProvider();
    } else if (config.ai.provider === 'openai' && config.ai.openaiApiKey) {
      this.provider = new OpenAIProvider();
    } else {
      this.provider = this.mockFallback;
    }
    console.log(`[AI Orchestrator] Initialized with primary provider: ${this.provider.name}`);
  }

  public static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  public async generate(messages: AIMessage[], options: AIGenerateOptions): Promise<AIGenerateResult> {
    const startTime = Date.now();
    let result: AIGenerateResult;
    let providerUsed = this.provider.name;
    let status: 'success' | 'error' = 'success';
    let errorMessage: string | undefined;

    try {
      result = await this.provider.generate(messages, options);
    } catch (primaryError: any) {
      console.warn(`[AI Orchestrator] Primary provider (${this.provider.name}) failed for ${options.module}: ${primaryError.message}. Falling back to resilient mock engine.`);
      try {
        result = await this.mockFallback.generate(messages, options);
        providerUsed = `${this.mockFallback.name} (fallback)`;
      } catch (fallbackError: any) {
        status = 'error';
        errorMessage = fallbackError.message;
        throw fallbackError;
      }
    }

    // Record AI Usage asynchronously
    try {
      await AIUsage.create({
        workspaceId: new mongoose.Types.ObjectId(options.workspaceId),
        userId: options.userId ? new mongoose.Types.ObjectId(options.userId) : undefined,
        module: options.module,
        model: providerUsed,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        estimatedCost: result.usage.estimatedCost,
        latencyMs: result.latencyMs || (Date.now() - startTime),
        status,
        errorMessage,
      });
    } catch (usageLogErr) {
      console.error('[AI Orchestrator] Failed to log AI usage:', usageLogErr);
    }

    return result;
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await this.provider.generateEmbedding(text);
    } catch (err: any) {
      console.warn(`[AI Orchestrator] Embedding generation with ${this.provider.name} failed. Using mock fallback.`);
      return await this.mockFallback.generateEmbedding(text);
    }
  }
}
