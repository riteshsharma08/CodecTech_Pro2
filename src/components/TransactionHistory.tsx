import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Download, 
  Printer, 
  X, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Transaction, TransactionType, TransactionStatus, SpendingCategory } from '../types/wallet.ts';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onOpenSendModal: () => void;
  selectedTransaction: Transaction | null;
  onSelectTransaction: (tx: Transaction | null) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onOpenSendModal,
  selectedTransaction,
  onSelectTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SpendingCategory>('all');
  const [receiptCopied, setReceiptCopied] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      // Status
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      // Category
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSender = tx.sender.name.toLowerCase().includes(q) || tx.sender.tag.toLowerCase().includes(q);
        const matchesRecipient = tx.recipient.name.toLowerCase().includes(q) || tx.recipient.tag.toLowerCase().includes(q);
        const matchesRef = tx.referenceId.toLowerCase().includes(q);
        const matchesNote = tx.note.toLowerCase().includes(q);
        if (!matchesSender && !matchesRecipient && !matchesRef && !matchesNote) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, statusFilter, categoryFilter, search]);

  const stats = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    let totalRisk = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'receive' || tx.type === 'deposit') {
        inflow += tx.amount;
      } else {
        outflow += tx.amount;
      }
      totalRisk += tx.riskScore;
    });

    const avgRisk = transactions.length ? Math.round(totalRisk / transactions.length) : 0;
    return { inflow, outflow, avgRisk, count: transactions.length };
  }, [transactions]);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCopyRef = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setReceiptCopied(true);
    setTimeout(() => setReceiptCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Ledger & Transaction History</h2>
          <p className="text-xs text-slate-400">
            Real-time peer-to-peer settlement logs with integrated fraud audit scores
          </p>
        </div>

        <button
          onClick={onOpenSendModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 self-start sm:self-auto"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Total Entries</div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {stats.count}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Settled Inbound</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            +${stats.inflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Settled Outbound</div>
          <div className="text-xl font-bold font-mono text-slate-200 mt-1 tabular-nums">
            -${stats.outflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-semibold uppercase text-slate-400">Mean Risk Score</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            {stats.avgRisk}/100 <span className="text-xs font-normal text-slate-500">(Low)</span>
          </div>
        </div>
      </div>

      {/* Controls: Search & Segmented Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by recipient, reference ID, note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type segmented filter buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
            {(['all', 'send', 'receive', 'deposit', 'withdraw'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                  typeFilter === t
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'All Types' : t === 'send' ? 'Sent' : t === 'receive' ? 'Received' : t}
              </button>
            ))}
          </div>

          {/* Status dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 capitalize"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending_2fa">Pending 2FA</option>
              <option value="held_for_review">Held for Review</option>
            </select>
          </div>

        </div>
      </div>

      {/* Ledger Table Canvas */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Transaction / Entity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Security / 2FA</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions found matching your active filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isOutflow = tx.type === 'send' || tx.type === 'withdraw';
                  const isFlagged = tx.status === 'held_for_review';
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Entity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isFlagged
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                                : isOutflow
                                ? 'bg-slate-800 text-slate-300 border border-slate-700/60'
                                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            }`}
                          >
                            {isFlagged ? (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            ) : isOutflow ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                              {tx.type === 'send' ? tx.recipient.name :
                               tx.type === 'receive' ? tx.sender.name :
                               tx.type === 'deposit' ? 'Wallet Top-Up' : 'Bank Payout'}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500">
                              {tx.referenceId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-400">
                        {tx.category}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                        {new Date(tx.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <div className="text-[10px] text-slate-500">
                          {new Date(tx.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* 2FA Audit */}
                      <td className="py-3 px-4">
                        {tx.twoFactorVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            2FA Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">Standard</span>
                        )}
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-semibold text-xs px-2 py-0.5 rounded ${
                            tx.riskScore > 65
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                              : tx.riskScore > 25
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                              : 'bg-slate-950 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {tx.riskScore}/100
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right">
                        <div
                          className={`font-mono font-bold text-sm tabular-nums ${
                            isFlagged
                              ? 'text-rose-400'
                              : isOutflow
                              ? 'text-white'
                              : 'text-emerald-400'
                          }`}
                        >
                          {isOutflow ? '-' : '+'}${tx.amount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">{tx.currency}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block text-[11px] font-medium capitalize px-2 py-0.5 rounded ${
                            tx.status === 'completed'
                              ? 'text-emerald-400 bg-emerald-950/40'
                              : tx.status === 'held_for_review'
                              ? 'text-rose-400 bg-rose-950/60'
                              : 'text-amber-400 bg-amber-950/40'
                          }`}
                        >
                          {tx.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Receipt Drawer / Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Close */}
            <button
              onClick={() => onSelectTransaction(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-5 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Payment Receipt</h3>
              <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-slate-400 mt-1">
                <span>{selectedTransaction.referenceId}</span>
                <button
                  onClick={() => handleCopyRef(selectedTransaction.referenceId)}
                  className="text-emerald-400 hover:underline text-[11px]"
                >
                  {receiptCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Big Amount & Status */}
            <div className="text-center py-6 border-b border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums">
                {selectedTransaction.type === 'send' || selectedTransaction.type === 'withdraw' ? '-' : '+'}
                ${selectedTransaction.amount.toFixed(2)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                  selectedTransaction.status === 'completed'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                }`}>
                  {selectedTransaction.status.replace(/_/g, ' ')}
                </span>
                {selectedTransaction.twoFactorVerified && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                    2FA Verified
                  </span>
                )}
              </div>
            </div>

            {/* Transaction Metadata breakdown */}
            <div className="py-4 space-y-3 text-xs border-b border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Sender:</span>
                <span className="font-semibold text-white">
                  {selectedTransaction.sender.name} ({selectedTransaction.sender.tag})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-semibold text-white">
                  {selectedTransaction.recipient.name} ({selectedTransaction.recipient.tag})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-slate-200">{selectedTransaction.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Rail / Gateway:</span>
                <span className="text-slate-200">{selectedTransaction.gatewayProvider || 'Visa Direct Instant'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fee:</span>
                <span className="font-mono text-emerald-400">
                  {selectedTransaction.fee === 0 ? 'FREE ($0.00)' : `$${selectedTransaction.fee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-200">{new Date(selectedTransaction.timestamp).toUTCString()}</span>
              </div>
              {selectedTransaction.note && (
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Note:</span>
                  <span className="text-slate-200 italic">{selectedTransaction.note}</span>
                </div>
              )}
            </div>

            {/* Risk & Fraud Audit Details */}
            <div className="py-4 text-xs space-y-2 border-b border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-300">Fraud Engine Risk Assessment:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                  selectedTransaction.riskScore > 65
                    ? 'bg-rose-950 text-rose-300'
                    : selectedTransaction.riskScore > 25
                    ? 'bg-amber-950 text-amber-300'
                    : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {selectedTransaction.riskScore} / 100
                </span>
              </div>
              <div className="text-slate-400">
                Origin Network IP: <span className="font-mono text-slate-300">{selectedTransaction.deviceIp || '192.168.1.104'}</span>
              </div>
              {selectedTransaction.riskFlags.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-400">Triggered Heuristics:</div>
                  {selectedTransaction.riskFlags.map((flag, idx) => (
                    <div key={idx} className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-5">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/60 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTransaction(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
