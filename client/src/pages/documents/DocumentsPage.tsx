import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Search,
  BookOpen,
  FileCheck,
  AlertTriangle,
  Clock,
  Trash2,
  RefreshCw,
  Send,
  HelpCircle,
} from 'lucide-react';
import { DocumentService } from '../../services/api';
import { DocumentItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const DocumentsPage: React.FC = () => {
  const { activeWorkspace } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Selected document detail modal
  const [detailDoc, setDetailDoc] = useState<DocumentItem | null>(null);

  // RAG QA state
  const [question, setQuestion] = useState('');
  const [askingRAG, setAskingRAG] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await DocumentService.list();
      if (res.data.success) {
        setDocuments(res.data.data.documents || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeWorkspace]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (documentTitle) formData.append('title', documentTitle);

    try {
      const res = await DocumentService.upload(formData);
      if (res.data.success) {
        setUploadModalOpen(false);
        setSelectedFile(null);
        setDocumentTitle('');
        fetchDocuments();
      } else {
        setUploadError(res.data.error || 'Upload failed.');
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload and vectorize document.');
    } finally {
      setUploading(false);
    }
  };

  const handleAskRAG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAskingRAG(true);
    setRagResult(null);

    try {
      const res = await DocumentService.askRAG(question);
      if (res.data.success) {
        setRagResult(res.data.data);
      }
    } catch (err) {
      console.error('Failed to query RAG knowledge base:', err);
    } finally {
      setAskingRAG(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document and its vector embeddings?')) return;
    try {
      await DocumentService.delete(id);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600" />
            Knowledge Base & Document RAG
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload PDFs, DOCX, CSVs, or contracts to index vector embeddings for grounded AI citation and semantic retrieval
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setUploadModalOpen(true)} icon={<Upload className="w-3.5 h-3.5" />}>
            Upload Document
          </Button>
        </div>
      </div>

      {/* Interactive RAG Semantic Search & Q&A Portal */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 via-brand-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Semantic Vector Retrieval (RAG)
          </span>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">
          Query Your Grounded Document Knowledge Base
        </h2>
        <p className="text-xs text-slate-300 mb-4 max-w-2xl leading-relaxed">
          Ask complex questions regarding contracts, project scopes, compliance frameworks, or financial policies. Answers cite verified chunks with cosine similarity.
        </p>

        <form onSubmit={handleAskRAG} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. What are our data retention policies and SLA commitment terms?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-indigo-400"
            />
          </div>
          <Button variant="ai" type="submit" loading={askingRAG} icon={<Send className="w-3.5 h-3.5" />}>
            Ask Documents
          </Button>
        </form>

        {/* RAG Answer Display */}
        {ragResult && (
          <div className="mt-5 p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Grounded Answer
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {ragResult.answer}
              </p>
            </div>

            {/* Citations */}
            {ragResult.sources && ragResult.sources.length > 0 && (
              <div className="pt-3 border-t border-slate-700/80">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Retrieved Grounding Sources ({ragResult.sources.length}):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ragResult.sources.map((src: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-750 text-xs">
                      <div className="flex items-center justify-between text-indigo-300 font-bold text-[11px]">
                        <span className="truncate">{src.documentTitle || 'Document'}</span>
                        <span className="text-[10px] text-slate-400">
                          Match: {Math.round((src.similarity || 0.85) * 100)}%
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                        "{src.text || src.chunkContent}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Uploaded Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {documents.map((doc) => (
          <Card key={doc._id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center uppercase font-bold text-[10px]">
                    {doc.fileType}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                      {doc.title || doc.originalName}
                    </h3>
                    <div className="text-[10px] text-slate-400">
                      {Math.round(doc.fileSize / 1024)} KB • {doc.chunksCount || 0} vector chunks
                    </div>
                  </div>
                </div>

                <Badge variant={doc.status === 'ready' ? 'success' : doc.status === 'processing' ? 'warning' : 'info'} size="sm">
                  {doc.status}
                </Badge>
              </div>

              {doc.summary && (
                <p className="text-xs text-slate-600 line-clamp-3 mt-2 mb-3 leading-relaxed">
                  {doc.summary}
                </p>
              )}

              {/* Extracted Key Info Tags */}
              {doc.keyInfo && doc.keyInfo.length > 0 && (
                <div className="space-y-1 mb-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Key Takeaways:</div>
                  <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
                    {doc.keyInfo.slice(0, 2).map((k, i) => (
                      <li key={i} className="truncate">{k}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDetailDoc(doc)}>
                Inspect Extraction
              </Button>
              <button
                onClick={() => handleDelete(doc._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Document Detail Inspection Modal */}
      {detailDoc && (
        <Modal
          isOpen={!!detailDoc}
          onClose={() => setDetailDoc(null)}
          title={`Document Intelligence: ${detailDoc.title || detailDoc.originalName}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {detailDoc.summary && (
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-1">Executive Summary</div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {detailDoc.summary}
                </p>
              </div>
            )}

            {detailDoc.requirements && detailDoc.requirements.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-1">Extracted Requirements</div>
                <ul className="space-y-1">
                  {detailDoc.requirements.map((req, i) => (
                    <li key={i} className="text-xs text-slate-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                      &bull; {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailDoc.risks && detailDoc.risks.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase text-rose-500 mb-1">Identified Risks & Caveats</div>
                <ul className="space-y-1">
                  {detailDoc.risks.map((risk, i) => (
                    <li key={i} className="text-xs text-rose-900 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                      &bull; {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload & Vectorize Document"
        size="md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Document Display Title (Optional)
            </label>
            <input
              type="text"
              placeholder="Master Services Agreement 2026"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Document File (.pdf, .docx, .txt, .csv)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <input
                type="file"
                accept=".pdf,.docx,.txt,.csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required
              />
              <p className="text-[10px] text-slate-400 mt-2">
                Document will be split into semantic chunks and embedded for RAG vector search.
              </p>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={uploading}>
              Upload & Vectorize
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
