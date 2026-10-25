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
        try {
          const data = await pdf(fileBuffer);
          if (data && data.text && data.text.trim().length > 0) {
            return {
              text: data.text.trim(),
              metadata: {
                numPages: data.numpages,
                info: data.info,
              },
            };
          }
        } catch (pdfErr: any) {
          console.warn('[DocumentExtractor] PDF parsing failed, trying text fallback:', pdfErr.message);
        }
        // Fallback: Check if fileBuffer is readable UTF-8 text
        const rawUtf8 = fileBuffer.toString('utf-8').replace(/\0/g, '').trim();
        if (rawUtf8 && rawUtf8.length > 20 && !rawUtf8.startsWith('%PDF')) {
          return { text: rawUtf8, metadata: { note: 'Extracted via text fallback' } };
        }
        return { text: '', metadata: { error: 'Failed to extract PDF text' } };
      }

      case 'docx': {
        try {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          if (result && result.value && result.value.trim().length > 0) {
            return {
              text: result.value.trim(),
              metadata: {
                messages: result.messages,
              },
            };
          }
        } catch (docxErr: any) {
          console.warn('[DocumentExtractor] Mammoth DOCX parsing failed, trying text fallback:', docxErr.message);
        }
        // Fallback: Check if user saved plain text with .docx extension
        const rawUtf8 = fileBuffer.toString('utf-8').replace(/\0/g, '').trim();
        if (rawUtf8 && rawUtf8.length > 20) {
          return {
            text: rawUtf8,
            metadata: { note: 'Extracted via text fallback' },
          };
        }
        return { text: '', metadata: { error: 'Failed to extract DOCX text' } };
      }

      case 'csv': {
        try {
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
            text: text.trim(),
            metadata: { rowCount: records.length },
          };
        } catch (csvErr: any) {
          console.warn('[DocumentExtractor] CSV parse failed, returning raw string:', csvErr.message);
          return { text: fileBuffer.toString('utf-8').trim() };
        }
      }

      case 'txt':
      default: {
        const text = fileBuffer.toString('utf-8').trim();
        return { text };
      }
    }
  }
}
