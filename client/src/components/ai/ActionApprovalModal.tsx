import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export interface ActionApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  loading?: boolean;
  actionTitle: string;
  actionType: string;
  details: Record<string, any>;
  summary: string;
}

export const ActionApprovalModal: React.FC<ActionApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  loading = false,
  actionTitle,
  actionType,
  details,
  summary,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve AI-Proposed Action"
      description="Review proposed operational modification before database execution"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Security Safeguard:</span> VentureOS prohibits silent AI mutations.
            This action requires your authorized approval before operational records are committed.
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">{actionTitle}</h4>
          <p className="text-xs text-slate-600 mb-3">{summary}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs font-mono space-y-1.5 max-h-48 overflow-y-auto">
          <div className="text-slate-500 uppercase font-semibold text-[10px] tracking-wider mb-1">
            Execution Payload ({actionType}):
          </div>
          {Object.entries(details).map(([key, val]) => (
            <div key={key} className="flex justify-between">
              <span className="text-slate-600">{key}:</span>
              <span className="text-slate-900 font-medium truncate max-w-[200px]">
                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Reject
          </Button>
          <Button
            variant="ai"
            size="sm"
            onClick={onApprove}
            loading={loading}
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            Authorize & Execute
          </Button>
        </div>
      </div>
    </Modal>
  );
};
