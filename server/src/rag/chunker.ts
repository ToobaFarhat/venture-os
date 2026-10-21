export interface TextChunk {
  chunkIndex: number;
  content: string;
  tokenCount: number;
  metadata: {
    page?: number;
    section?: string;
    wordCount: number;
  };
}

export class TextChunker {
  /**
   * Splits text into overlapping sliding-window chunks
   * @param text full text content
   * @param chunkSize approximate words per chunk (default 250 words ~ 350 tokens)
   * @param overlap words overlap between chunks (default 40 words)
   */
  public static chunkText(text: string, chunkSize = 250, overlap = 40): TextChunk[] {
    const cleanedText = text.replace(/\r\n/g, '\n').trim();
    if (!cleanedText) return [];

    const words = cleanedText.split(/\s+/);
    if (words.length <= chunkSize) {
      return [
        {
          chunkIndex: 0,
          content: cleanedText,
          tokenCount: Math.ceil(words.length * 1.3),
          metadata: {
            wordCount: words.length,
            section: 'Full Document',
          },
        },
      ];
    }

    const chunks: TextChunk[] = [];
    let i = 0;
    let chunkIndex = 0;

    while (i < words.length) {
      const chunkWords = words.slice(i, i + chunkSize);
      const content = chunkWords.join(' ');

      chunks.push({
        chunkIndex,
        content,
        tokenCount: Math.ceil(chunkWords.length * 1.3),
        metadata: {
          wordCount: chunkWords.length,
          section: `Section ${chunkIndex + 1}`,
          page: Math.floor(i / 350) + 1,
        },
      });

      chunkIndex++;
      i += chunkSize - overlap;
    }

    return chunks;
  }
}
