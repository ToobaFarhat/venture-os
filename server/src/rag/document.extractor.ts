import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { parse as parseCsv } from 'csv-parse/sync';

export interface ExtractedDocumentData {
  text: string;
  metadata?: Record<string, any>;
}

export class DocumentExtractor {
  public static async extract(filePath: string, fileType: 'pdf' | 'docx' | 'txt' | 'csv'): Promise<ExtractedDocumentData> {
    const fileBuffer = fs.readFileSync(filePath);

    switch (fileType) {
      case 'pdf': {
        const data = await pdf(fileBuffer);
        return {
          text: data.text || '',
          metadata: {
            numPages: data.numpages,
            info: data.info,
          },
        };
      }

      case 'docx': {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return {
          text: result.value || '',
          metadata: {
            messages: result.messages,
          },
        };
      }

      case 'csv': {
        const content = fileBuffer.toString('utf-8');
        const records = parseCsv(content, { columns: true, skip_empty_lines: true });
        const text = records
          .map((row: Record<string, any>, idx: number) => {
            const entries = Object.entries(row)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' | ');
            return `[Row ${idx + 1}] ${entries}`;
          })
          .join('\n');
        return {
          text,
          metadata: { rowCount: records.length },
        };
      }

      case 'txt':
      default: {
        const text = fileBuffer.toString('utf-8');
        return { text };
      }
    }
  }
}
