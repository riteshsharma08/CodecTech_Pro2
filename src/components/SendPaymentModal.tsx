import React, { useState, useMemo } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  User, 
  Check, 
  Sparkles,
  Sliders,
  DollarSign
} from 'lucide-react';
import { PeerContact, UserProfile, Transaction, FraudRule, SpendingCategory } from '../types/wallet.ts';
import { evaluateTransactionRisk, FraudEvaluationResult } from '../utils/fraudEngine.ts';

interface SendPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  peers: PeerContact[];
  user: UserProfile;
  availableBalance: number;
  recentTransactions: Transaction[];
  rules: FraudRule[];
  preselectedPeer?: PeerContact;
  onInitiateTransfer: (params: {
    recipient: PeerContact;
    amount: number;
    category: SpendingCategory;
    note: string;
    riskEvaluation: FraudEvaluationResult;
    deviceIp: string;
  }) => void;
}

export const SendPaymentModal: React.FC<SendPaymentModalProps> = ({
  isOpen,
  onClose,
  peers,
  user,
  availableBalance,
  recentTransactions,
  rules,
  preselectedPeer,
  onInitiateTransfer,
}) => {
  const [selectedPeer, setSelectedPeer] = useState<PeerContact | null>(preselectedPeer || peers[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [amountStr, setAmountStr] = useState('50.00');
  const [category, setCategory] = useState<SpendingCategory>('Peer Transfer');
  const [note, setNote] = useState('');
  
  // Interactive Fraud Simulator switches
  const [showSimLab, setShowSimLab] = useState(false);
  const [simProxyIp, setSimProxyIp] = useState(false);
  const [simNightHour, setSimNightHour] = useState(false);

  // Sync if preselectedPeer changes
  React.useEffect(() => {
    if (preselectedPeer) {
      setSelectedPeer(preselectedPeer);
    }
  }, [preselectedPeer]);

  const amount = parseFloat(amountStr) || 0;

  // Real-time evaluation of risk
  const riskEval = useMemo(() => {
    if (!selectedPeer || amount <= 0) {
      return {
        riskScore: 5,
        riskLevel: 'low' as const,
        riskFlags: [],
        requires2FA: false,
        isHeldForReview: false,
        recommendedAction: 'approve' as const,
        reasoning: 'Ready for transfer',
      };
    }

    return evaluateTransactionRisk(
      amount,
      selectedPeer,
      availableBalance,
      recentTransactions,
      rules,
      user.twoFactorThreshold,
      {
        customHour: simNightHour ? 3 : undefined,
        deviceIp: simProxyIp ? '185.220.101.5 (Proxy / Tor Node)' : '192.168.1.104 (Trusted)',
        isForeignIp: simProxyIp,
      }
    );
  }, [amount, selectedPeer, availableBalance, recentTransactions, rules, user.twoFactorThreshold, simNightHour, simProxyIp]);

  const filteredPeers = useMemo(() => {
    if (!searchQuery.trim()) return peers;
    const q = searchQuery.toLowerCase();
    return peers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [peers, searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeer) {
      alert('Please select a recipient');
      return;
    }
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amount > availableBalance) {
      alert('Insufficient available wallet balance');
      return;
    }

    onInitiateTransfer({
      recipient: selectedPeer,
      amount,
      category,
      note: note.trim() || 'P2P Transfer',
      riskEvaluation: riskEval,
      deviceIp: simProxyIp ? '185.220.101.5 (Proxy / Tor Node)' : '192.168.1.104 (Trusted)',
    });
  };

  const categories: SpendingCategory[] = [
    'Peer Transfer',
    'Food & Dining',
    'Tech & Subscriptions',
    'Shopping & Retail',
    'Travel & Transit',
    'Bills & Utilities',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Send Peer Payment</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Zero-fee instant transfer with real-time fraud defense & 2FA protection.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Recipient Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Recipient
              </label>
              {selectedPeer && (
                <span className="text-[11px] font-mono text-emerald-400">
                  {selectedPeer.tag}
                </span>
              )}
            </div>

            {/* Quick Horizontal Peer List */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
              {peers.map((peer) => {
                const isSelected = selectedPeer?.id === peer.id;
                const isFlagged = peer.riskRating === 'flagged';
                return (
                  <button
                    type="button"
                    key={peer.id}
                    onClick={() => setSelectedPeer(peer)}
                    className={`flex items-center gap-2 p-2 rounded-xl border shrink-0 transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                        : isFlagged
                        ? 'bg-rose-950/20 border-rose-900/60 text-slate-300 hover:bg-rose-900/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {peer.avatarUrl ? (
                      <img
                        src={peer.avatarUrl}
                        alt={peer.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {peer.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                    )}
                    <div className="text-xs pr-1">
                      <div className="font-semibold truncate max-w-[85px]">{peer.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{peer.tag}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Recipient Search / Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by $tag, full name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {searchQuery && (
              <div className="mt-2 max-h-32 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 divide-y divide-slate-800">
                {filteredPeers.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">No payees found matching "{searchQuery}"</div>
                ) : (
                  filteredPeers.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        setSelectedPeer(p);
                        setSearchQuery('');
                      }}
                      className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-white">
                          {p.name[0]}
                        </div>
                        <span className="text-xs font-semibold text-slate-200">{p.name}</span>
                        <span className="text-xs font-mono text-emerald-400">{p.tag}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 capitalize">{p.riskRating} risk</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Amount Field & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Transfer Amount (USD)
              </label>
              <span className="text-xs text-slate-400">
                Available: <span className="font-mono font-semibold text-white">${availableBalance.toFixed(2)}</span>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-2xl font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0.50"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-2xl font-extrabold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              {[25, 50, 100, 250, 500, 1500].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmountStr(val.toFixed(2))}
                  className="px-2.5 py-1 text-[11px] font-medium font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  ${val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr(availableBalance.toFixed(2))}
                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:underline"
              >
                Max
              </button>
            </div>
          </div>

          {/* Category & Memo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SpendingCategory)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Note / Memo
              </label>
              <input
                type="text"
                placeholder="e.g. Dinner, Project invoice..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* REAL-TIME FRAUD DETECTION & RISK RADAR CARD */}
          <div className={`p-4 rounded-xl border transition-all ${
            riskEval.riskLevel === 'critical' || riskEval.riskLevel === 'high'
              ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
              : riskEval.riskLevel === 'moderate'
              ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
              : 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {riskEval.riskLevel === 'low' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : riskEval.riskLevel === 'moderate' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  Fraud Risk Radar: {riskEval.riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800">
                Score: {riskEval.riskScore}/100
              </div>
            </div>

            <p className="text-xs opacity-90 mb-2">
              {riskEval.reasoning}
            </p>

            {riskEval.riskFlags.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                {riskEval.riskFlags.map((flag, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Simulation Controls Accordion (For testing fraud & velocity rules) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowSimLab(!showSimLab)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fraud Rule Test Controls (Simulator)</span>
              </span>
              <span className="text-[10px] text-emerald-400">{showSimLab ? 'Hide' : 'Expand'}</span>
            </button>

            {showSimLab && (
              <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-[11px] text-slate-400 mb-1">
                  Toggle variables to trigger fraud detection heuristics:
                </div>
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-slate-300">Simulate Suspicious Tor/Proxy IP</span>
                  <input
                    type="checkbox"
                    checked={simProxyIp}
                    onChange={(e) => setSimProxyIp(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-slate-300">Simulate Off-Hours Transaction (03:00 AM)</span>
                  <input
                    type="checkbox"
                    checked={simNightHour}
                    onChange={(e) => setSimNightHour(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0 || amount > availableBalance}
              className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-[0.98] ${
                riskEval.isHeldForReview
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                  : riskEval.requires2FA
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-400/20'
              }`}
            >
              {riskEval.isHeldForReview
                ? `Submit for Review ($${amount.toFixed(2)})`
                : riskEval.requires2FA
                ? `Verify via 2FA & Send $${amount.toFixed(2)}`
                : `Instant Send $${amount.toFixed(2)}`}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
