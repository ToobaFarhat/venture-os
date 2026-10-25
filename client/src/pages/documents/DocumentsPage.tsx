import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Search,
  Trash2,
  RefreshCw,
  Send,
  Check,
  Copy,
  Layers,
  AlertCircle,
  Loader2,
  FileCode,
  ShieldAlert,
  CheckCircle2,
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
  const [refreshing, setRefreshing] = useState(false);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Selected document detail modal
  const [detailDoc, setDetailDoc] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'intelligence' | 'rawText' | 'chunks'>('intelligence');
  const [copiedText, setCopiedText] = useState(false);

  // Reprocess state
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);

  // RAG QA state
  const [question, setQuestion] = useState('');
  const [askingRAG, setAskingRAG] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);

  const fetchDocuments = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await DocumentService.list();
      if (res.data.success) {
        setDocuments(res.data.data.documents || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeWorkspace]);

  // Auto-poll if any document is in processing
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await DocumentService.list();
        if (res.data.success) {
          const docs = res.data.data.documents || res.data.data || [];
          setDocuments(docs);
          const stillProcessing = docs.some((d: any) => d.status === 'processing');
          if (!stillProcessing) {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Auto-poll error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [documents]);

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
        await fetchDocuments();
      } else {
        setUploadError(res.data.error || 'Upload failed.');
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload and vectorize document.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDetail = async (doc: DocumentItem) => {
    setDetailDoc(doc);
    setDetailTab('intelligence');
    setDetailLoading(true);
    try {
      const res = await DocumentService.getById(doc._id);
      if (res.data.success) {
        setDetailDoc(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch detailed document info:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReprocess = async (id: string) => {
    setReprocessingId(id);
    try {
      const res = await DocumentService.reprocess(id);
      if (res.data.success) {
        if (detailDoc && detailDoc._id === id) {
          setDetailDoc(res.data.data);
        }
        await fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to reprocess document:', err);
    } finally {
      setReprocessingId(null);
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
      if (detailDoc && detailDoc._id === id) {
        setDetailDoc(null);
      }
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const copyExtractedText = () => {
    if (!detailDoc?.extractedText) return;
    navigator.clipboard.writeText(detailDoc.extractedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
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

  const citationsList = ragResult?.sources || ragResult?.citations || [];

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDocuments(true)}
            loading={refreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
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
              placeholder="e.g. What is the SLA uptime guarantee and what credit is provided if uptime is 97%?"
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
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Grounded Answer
                </span>
                {ragResult.confidence > 0 && (
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Confidence: {Math.round(ragResult.confidence * 100)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed whitespace-pre-line">
                {ragResult.answer}
              </p>
            </div>

            {/* Citations / Grounding Sources */}
            {citationsList.length > 0 && (
              <div className="pt-3 border-t border-slate-700/80">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Retrieved Grounding Sources ({citationsList.length}):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {citationsList.map((src: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-750 text-xs">
                      <div className="flex items-center justify-between text-indigo-300 font-bold text-[11px]">
                        <span className="truncate max-w-[180px]">{src.documentTitle || 'Document'}</span>
                        <span className="text-[10px] text-emerald-300 font-mono">
                          Match: {Math.round((src.similarityScore || src.similarity || 0.85) * 100)}%
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                        "{src.snippet || src.text || src.chunkContent}"
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
        {documents.map((doc) => {
          const isIndexed = doc.status === 'ready';
          const isProcessing = doc.status === 'processing';
          const isFailed = doc.status === 'failed';

          return (
            <Card key={doc._id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center uppercase font-bold text-[10px]">
                      {doc.fileType}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 truncate max-w-[170px]" title={doc.title || doc.originalName}>
                        {doc.title || doc.originalName}
                      </h3>
                      <div className="text-[10px] text-slate-400">
                        {Math.round(doc.fileSize / 1024)} KB • {doc.chunksCount || 0} vector chunks
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={isIndexed ? 'success' : isProcessing ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {isProcessing && <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin inline" />}
                    {isIndexed ? 'Indexed' : doc.status}
                  </Badge>
                </div>

                {doc.summary && (
                  <p className="text-xs text-slate-600 line-clamp-3 mt-2 mb-3 leading-relaxed">
                    {doc.summary}
                  </p>
                )}

                {isFailed && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-700 mb-3 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{doc.errorMessage || 'Text extraction or vector embedding failed.'}</span>
                  </div>
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
                <Button variant="secondary" size="sm" onClick={() => handleOpenDetail(doc)}>
                  Inspect Extraction
                </Button>

                <div className="flex items-center gap-1">
                  {(isProcessing || isFailed || (doc.chunksCount === 0 && !isProcessing)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReprocess(doc._id)}
                      loading={reprocessingId === doc._id}
                      icon={<RefreshCw className="w-3 h-3" />}
                    >
                      Re-index
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Document Detail Inspection Modal */}
      {detailDoc && (
        <Modal
          isOpen={!!detailDoc}
          onClose={() => setDetailDoc(null)}
          title={`Document Intelligence: ${detailDoc.title || detailDoc.originalName}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {/* Top metadata strip */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  {detailDoc.fileType} Document
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">{Math.round((detailDoc.fileSize || 0) / 1024)} KB</span>
                <span className="text-slate-400">•</span>
                <span className="text-indigo-600 font-bold">{detailDoc.chunksCount || detailDoc.chunks?.length || 0} vector chunks</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={detailDoc.status === 'ready' ? 'success' : detailDoc.status === 'processing' ? 'warning' : 'danger'}
                  size="sm"
                >
                  {detailDoc.status === 'ready' ? 'Indexed & Ready' : detailDoc.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReprocess(detailDoc._id)}
                  loading={reprocessingId === detailDoc._id}
                  icon={<RefreshCw className="w-3 h-3" />}
                >
                  Re-process
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
              <button
                onClick={() => setDetailTab('intelligence')}
                className={`pb-2 transition-colors ${
                  detailTab === 'intelligence'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                AI Intelligence & Insights
              </button>
              <button
                onClick={() => setDetailTab('rawText')}
                className={`pb-2 transition-colors flex items-center gap-1 ${
                  detailTab === 'rawText'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Extracted Text ({detailDoc.extractedText ? detailDoc.extractedText.length.toLocaleString() : 0} chars)
              </button>
              <button
                onClick={() => setDetailTab('chunks')}
                className={`pb-2 transition-colors flex items-center gap-1 ${
                  detailTab === 'chunks'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Vector Chunks ({detailDoc.chunks?.length || detailDoc.chunksCount || 0})
              </button>
            </div>

            {detailLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                Loading detailed document analysis and chunks...
              </div>
            ) : (
              <>
                {/* TAB 1: AI INTELLIGENCE */}
                {detailTab === 'intelligence' && (
                  <div className="space-y-4">
                    {detailDoc.status === 'processing' && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                        <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Document is currently being vectorized and indexed...</div>
                          <div className="text-amber-700 mt-1">
                            Text extraction and chunk embedding generation are running. You can click "Re-process" above or refresh the page in a few moments.
                          </div>
                        </div>
                      </div>
                    )}

                    {detailDoc.status === 'failed' && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Indexing encountered an issue:</div>
                          <div className="text-rose-700 mt-1 font-mono text-[11px]">
                            {detailDoc.errorMessage || 'Unable to parse document text.'}
                          </div>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" onClick={() => handleReprocess(detailDoc._id)}>
                              Retry Document Processing
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-bold uppercase text-slate-400 mb-1">Executive Summary</div>
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                        {detailDoc.summary || (detailDoc.extractedText ? detailDoc.extractedText.slice(0, 300) + '...' : 'No summary available.')}
                      </p>
                    </div>

                    {detailDoc.keyInfo && detailDoc.keyInfo.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase text-slate-400 mb-1">Key Takeaways & Metrics</div>
                        <ul className="space-y-1">
                          {detailDoc.keyInfo.map((k: string, i: number) => (
                            <li key={i} className="text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{k}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {detailDoc.requirements && detailDoc.requirements.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase text-slate-400 mb-1">Extracted Requirements</div>
                        <ul className="space-y-1">
                          {detailDoc.requirements.map((req: string, i: number) => (
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
                          {detailDoc.risks.map((risk: string, i: number) => (
                            <li key={i} className="text-xs text-rose-900 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                              &bull; {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {detailDoc.deadlines && detailDoc.deadlines.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase text-amber-600 mb-1">Identified Deadlines</div>
                        <ul className="space-y-1">
                          {detailDoc.deadlines.map((dl: any, i: number) => (
                            <li key={i} className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-100 flex justify-between">
                              <span>&bull; {dl.description}</span>
                              {dl.date && <span className="font-semibold">{dl.date}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: EXTRACTED TEXT */}
                {detailTab === 'rawText' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Normalized text parsed by VentureOS document extractor
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyExtractedText}
                        icon={copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      >
                        {copiedText ? 'Copied' : 'Copy Text'}
                      </Button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed max-h-[380px] overflow-y-auto whitespace-pre-wrap">
                      {detailDoc.extractedText || 'No text extracted from document.'}
                    </pre>
                  </div>
                )}

                {/* TAB 3: VECTOR CHUNKS */}
                {detailTab === 'chunks' && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-500">
                      Sliding-window semantic chunks generated for vector similarity search
                    </div>

                    {detailDoc.chunks && detailDoc.chunks.length > 0 ? (
                      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {detailDoc.chunks.map((chunk: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-indigo-600 font-bold text-[11px]">
                              <span>Chunk #{chunk.chunkIndex + 1} ({chunk.metadata?.section || 'General'})</span>
                              <span className="text-slate-400 font-normal text-[10px]">
                                {chunk.tokenCount} tokens • {chunk.metadata?.wordCount || 0} words
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed text-[11px] bg-white p-2.5 rounded-lg border border-slate-150">
                              "{chunk.content}"
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                        No vector chunks generated yet. Click "Re-process" above to trigger chunking and vector indexing.
                      </div>
                    )}
                  </div>
                )}
              </>
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
