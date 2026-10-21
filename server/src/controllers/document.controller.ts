import { Response } from 'express';
import { DocumentModel, DocumentChunk } from '../models';
import { AuthenticatedRequest } from '../types';
import { VectorRAGService } from '../rag/vector.service';
import { AuditService } from '../services/audit.service';
import { toObjectId, paramToString } from '../utils';
import path from 'path';
import fs from 'fs';

export class DocumentController {
  public static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const docs = await DocumentModel.find({
        workspaceId: toObjectId(req.workspace!.workspaceId),
      })
        .populate('uploadedBy', 'name email avatarUrl')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: docs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to list documents' });
    }
  }

  public static async upload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'File is required' });
        return;
      }

      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const validTypes = ['pdf', 'docx', 'txt', 'csv'];

      if (!validTypes.includes(ext)) {
        res.status(400).json({
          success: false,
          error: `Unsupported file extension .${ext}. Only PDF, DOCX, TXT, and CSV are allowed.`,
        });
        return;
      }

      const doc = await DocumentModel.create({
        workspaceId: toObjectId(req.workspace!.workspaceId),
        title: req.body.title || file.originalname,
        originalName: file.originalname,
        fileType: ext as any,
        fileSize: file.size,
        storagePath: file.path,
        uploadedBy: toObjectId(req.user!.userId),
        status: 'processing',
      });

      // Process document text extraction and vector chunking
      VectorRAGService.processDocument(
        doc._id.toString(),
        file.path,
        ext as any,
        req.workspace!.workspaceId
      ).catch((err) => console.error('[DocumentController] Background processing error:', err));

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'document.upload',
        resource: 'Document',
        resourceId: doc._id.toString(),
        details: { fileName: file.originalname, fileSize: file.size },
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully. Background processing started.',
        data: doc,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to upload document' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const doc = await DocumentModel.findOne({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      }).populate('uploadedBy', 'name email avatarUrl');

      if (!doc) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
      }

      res.status(200).json({ success: true, data: doc });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to retrieve document' });
    }
  }

  public static async askRAG(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { question } = req.body;

      if (!question || !question.trim()) {
        res.status(400).json({ success: false, error: 'Question is required' });
        return;
      }

      const result = await VectorRAGService.answerQuestion(
        req.workspace!.workspaceId,
        question.trim()
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to query RAG document intelligence' });
    }
  }

  public static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const doc = await DocumentModel.findOneAndDelete({
        _id: toObjectId(req.params.id),
        workspaceId: toObjectId(req.workspace!.workspaceId),
      });

      if (!doc) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
      }

      // Delete vector chunks
      await DocumentChunk.deleteMany({ documentId: doc._id });

      // Clean up local disk file if exists
      if (fs.existsSync(doc.storagePath)) {
        try {
          fs.unlinkSync(doc.storagePath);
        } catch {}
      }

      await AuditService.record({
        workspaceId: req.workspace!.workspaceId,
        userId: req.user!.userId,
        action: 'document.delete',
        resource: 'Document',
        resourceId: paramToString(req.params.id),
      });

      res.status(200).json({ success: true, message: 'Document and vector embeddings deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete document' });
    }
  }
}
