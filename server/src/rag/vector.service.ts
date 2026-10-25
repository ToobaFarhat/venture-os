import mongoose from 'mongoose';
import fs from 'fs';
import { DocumentModel, DocumentChunk } from '../models';
import { DocumentExtractor } from './document.extractor';
import { TextChunker } from './chunker';
import { AIOrchestrator } from '../ai/ai.orchestrator';

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  score: number;
  metadata: {
    page?: number;
    section?: string;
  };
}

export interface RAGAnswerResult {
  answer: string;
  citations: Array<{
    documentTitle: string;
    page?: number;
    section?: string;
    snippet: string;
    similarityScore: number;
  }>;
  confidence: number;
}

export class VectorRAGService {
  private static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public static async processDocument(
    documentId: string,
    filePath: string,
    fileType: 'pdf' | 'docx' | 'txt' | 'csv',
    workspaceId: string
  ): Promise<void> {
    const orchestrator = AIOrchestrator.getInstance();
    const doc = await DocumentModel.findById(documentId);
    if (!doc) return;

    try {
      doc.status = 'processing';
      await doc.save();

      // 1. Text Extraction
      let cleanedText = '';
      if (filePath && fs.existsSync(filePath)) {
        const extracted = await DocumentExtractor.extract(filePath, fileType);
        cleanedText = (extracted.text || '').trim();
      }

      // If disk file was missing or empty, fallback to previously saved extractedText
      if (!cleanedText && doc.extractedText) {
        cleanedText = doc.extractedText.trim();
      }

      if (!cleanedText) {
        throw new Error('Document contains no extractable text content. Please ensure the file has readable text.');
      }

      doc.extractedText = cleanedText.slice(0, 150000);

      // 2. Chunking
      const chunks = TextChunker.chunkText(cleanedText);
      doc.chunksCount = chunks.length;

      // 3. Clear existing chunks for re-process safety
      await DocumentChunk.deleteMany({ documentId: doc._id });

      // 4. Generate embeddings and save chunks
      const chunkDocs = [];
      for (const chunk of chunks) {
        const embedding = await orchestrator.generateEmbedding(chunk.content);
        chunkDocs.push({
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
          documentId: doc._id,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          embedding,
          tokenCount: chunk.tokenCount,
          metadata: chunk.metadata,
        });
      }

      if (chunkDocs.length > 0) {
        await DocumentChunk.insertMany(chunkDocs);
      }

      // Mark document as ready immediately after chunks are indexed!
      doc.status = 'ready';
      doc.chunksCount = chunks.length;
      doc.errorMessage = undefined;
      await doc.save();

      // 5. Document Intelligence Analysis via AI Orchestrator (resilient try/catch)
      try {
        const analysisPrompt = `Analyze the following document text and return a JSON object with:
- "summary": concise 2-sentence summary
- "keyInfo": array of 3-5 key facts/metrics
- "requirements": array of business or technical requirements found
- "risks": array of operational or legal risks found
- "deadlines": array of objects with "description" and "date" (if any)

Document text preview:
${cleanedText.slice(0, 4000)}`;

        const aiAnalysis = await orchestrator.generate(
          [
            { role: 'system', content: 'You are an executive document intelligence analyst.' },
            { role: 'user', content: analysisPrompt },
          ],
          {
            workspaceId,
            module: 'document_intelligence',
            responseFormat: 'json',
          }
        );

        if (aiAnalysis.parsedJson) {
          doc.summary = aiAnalysis.parsedJson.summary || 'Document processed and indexed into knowledge base.';
          doc.keyInfo = aiAnalysis.parsedJson.keyInfo || [];
          doc.requirements = aiAnalysis.parsedJson.requirements || [];
          doc.risks = aiAnalysis.parsedJson.risks || [];
          doc.deadlines = aiAnalysis.parsedJson.deadlines || [];
        } else {
          doc.summary = cleanedText.slice(0, 200) + '...';
        }
      } catch (analysisErr: any) {
        console.warn('[VectorRAGService] AI analysis summary failed, using preview:', analysisErr?.message);
        doc.summary = cleanedText.slice(0, 250) + '...';
      }

      doc.status = 'ready';
      await doc.save();
    } catch (error: any) {
      console.error(`[VectorRAGService] Failed to process document ${documentId}:`, error);
      doc.status = 'failed';
      doc.errorMessage = error.message;
      await doc.save();
    }
  }

  public static async similaritySearch(
    workspaceId: string,
    query: string,
    topK = 4,
    minSimilarity = 0.2
  ): Promise<RetrievedChunk[]> {
    const orchestrator = AIOrchestrator.getInstance();
    const queryEmbedding = await orchestrator.generateEmbedding(query);

    // Strictly workspace-isolated search!
    const chunks = await DocumentChunk.find({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    }).populate('documentId', 'title');

    const scoredChunks: RetrievedChunk[] = [];

    // Query terms for hybrid keyword matching
    const queryTerms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    for (const chunk of chunks) {
      // 1. Vector similarity
      let vectorScore = 0;
      if (
        chunk.embedding &&
        chunk.embedding.length > 0 &&
        queryEmbedding &&
        queryEmbedding.length === chunk.embedding.length
      ) {
        vectorScore = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      }

      // 2. Lexical keyword overlap score
      let lexicalScore = 0;
      if (queryTerms.length > 0) {
        const chunkLower = chunk.content.toLowerCase();
        let matches = 0;
        for (const term of queryTerms) {
          if (chunkLower.includes(term)) matches++;
        }
        lexicalScore = matches / queryTerms.length;
      }

      // 3. Hybrid combined score: best of vector or keyword
      const combinedScore = Math.max(vectorScore, lexicalScore * 0.95);

      if (combinedScore >= minSimilarity || lexicalScore >= 0.25) {
        const docTitle = (chunk.documentId as any)?.title || 'Workspace Document';
        scoredChunks.push({
          chunkId: chunk._id.toString(),
          documentId: (chunk.documentId as any)?._id?.toString() || chunk.documentId?.toString(),
          documentTitle: docTitle,
          content: chunk.content,
          score: Number(Math.max(combinedScore, lexicalScore).toFixed(4)),
          metadata: chunk.metadata || {},
        });
      }
    }

    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, topK);
  }

  public static async answerQuestion(workspaceId: string, question: string): Promise<RAGAnswerResult & { sources?: any[] }> {
    const orchestrator = AIOrchestrator.getInstance();
    const retrieved = await this.similaritySearch(workspaceId, question, 4, 0.15);

    if (retrieved.length === 0) {
      return {
        answer: 'I could not find any relevant information in your uploaded workspace documents to answer this question. Please make sure relevant PDFs, DOCX, or CSV files have been uploaded and processed.',
        citations: [],
        sources: [],
        confidence: 0,
      };
    }

    const contextSnippets = retrieved
      .map((r, idx) => `[Source ${idx + 1}: ${r.documentTitle}, ${r.metadata.section || 'General'} (Score: ${r.score})]\n${r.content}`)
      .join('\n\n---\n\n');

    const prompt = `You are the VentureOS Document RAG Intelligence engine.
Answer the user's question using ONLY the provided verified document context below.
If the provided context does not contain sufficient facts to answer the question with certainty, state clearly that the answer cannot be established from available uploaded documents. Never hallucinate unsupported claims.

VERIFIED DOCUMENT CONTEXT:
${contextSnippets}

QUESTION:
${question}

Instructions:
- Be clear, concise, and professional.
- Refer directly to the documents when stating facts.`;

    const aiRes = await orchestrator.generate(
      [
        { role: 'system', content: 'You are an accurate, grounded document intelligence assistant that strictly avoids hallucination.' },
        { role: 'user', content: prompt },
      ],
      {
        workspaceId,
        module: 'rag',
      }
    );

    const citations = retrieved.map((r) => ({
      documentTitle: r.documentTitle,
      page: r.metadata.page,
      section: r.metadata.section,
      snippet: r.content.slice(0, 160) + '...',
      text: r.content.slice(0, 160) + '...',
      similarityScore: r.score,
      similarity: r.score,
    }));

    return {
      answer: aiRes.content,
      citations,
      sources: citations,
      confidence: retrieved[0]?.score || 0.85,
    };
  }
}
