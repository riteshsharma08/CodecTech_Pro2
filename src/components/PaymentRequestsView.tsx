import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { PaymentRequestItem, PeerContact, UserProfile } from '../types/wallet.ts';

interface PaymentRequestsViewProps {
  requests: PaymentRequestItem[];
  peers: PeerContact[];
  user: UserProfile;
  availableBalance: number;
  onPayRequest: (req: PaymentRequestItem) => void;
  onDeclineRequest: (reqId: string) => void;
  onCreateRequest: (item: Omit<PaymentRequestItem, 'id' | 'createdAt' | 'status'>) => void;
}

export const PaymentRequestsView: React.FC<PaymentRequestsViewProps> = ({
  requests,
  peers,
  user,
  availableBalance,
  onPayRequest,
  onDeclineRequest,
  onCreateRequest,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);

  // Single request state
  const [targetPeer, setTargetPeer] = useState<PeerContact>(peers[0] || null);
  const [reqAmount, setReqAmount] = useState('45.00');
  const [reqNote, setReqNote] = useState('');

  // Split bill state
  const [totalBill, setTotalBill] = useState('160.00');
  const [splitNote, setSplitNote] = useState('Dinner & Drinks');
  const [selectedSplitPeers, setSelectedSplitPeers] = useState<string[]>([peers[0]?.id, peers[1]?.id]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(reqAmount);
    if (isNaN(amt) || amt <= 0 || !targetPeer) return;

    onCreateRequest({
      requesterName: user.name,
      requesterTag: user.tag,
      requesterAvatar: '',
      payerName: targetPeer.name,
      payerTag: targetPeer.tag,
      amount: amt,
      note: reqNote.trim() || 'Payment request',
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    });

    setReqAmount('45.00');
    setReqNote('');
    setShowCreateModal(false);
  };

  const handleSplitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalBill);
    if (isNaN(total) || total <= 0 || selectedSplitPeers.length === 0) return;

    // Total participants = selected peers + current user
    const participantsCount = selectedSplitPeers.length + 1;
    const perPerson = Math.round((total / participantsCount) * 100) / 100;

    selectedSplitPeers.forEach((peerId) => {
      const p = peers.find((item) => item.id === peerId);
      if (p) {
        onCreateRequest({
          requesterName: user.name,
          requesterTag: user.tag,
          requesterAvatar: '',
          payerName: p.name,
          payerTag: p.tag,
          amount: perPerson,
          note: `${splitNote} (Split of $${total.toFixed(2)})`,
          expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        });
      }
    });

    setShowSplitModal(false);
  };

  const toggleSplitPeer = (id: string) => {
    if (selectedSplitPeers.includes(id)) {
      setSelectedSplitPeers(selectedSplitPeers.filter((p) => p !== id));
    } else {
      setSelectedSplitPeers([...selectedSplitPeers, id]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payment Requests & Bill Splits</h2>
          <p className="text-xs text-slate-400">
            Request funds from peers or divide group expenses with automated ledger tracking
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowSplitModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs transition-colors"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Split a Bill</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
        <h3 className="text-sm font-bold text-white tracking-tight mb-4">Pending Requests</h3>

        {requests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No pending payment requests.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const isPayerMe = req.payerTag === user.tag;
              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-sm text-slate-300 shrink-0">
                      {req.requesterName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{req.requesterName}</span>
                        <span className="text-[11px] font-mono text-emerald-400">{req.requesterTag}</span>
                        <span className="text-[10px] text-slate-500">requested from</span>
                        <span className="text-xs font-semibold text-slate-300">{req.payerName}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 italic">
                        "{req.note}"
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Expires {new Date(req.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-base font-extrabold font-mono text-white tabular-nums">
                        ${req.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-emerald-400">
                        {req.status}
                      </div>
                    </div>

                    {isPayerMe && req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDeclineRequest(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => onPayRequest(req)}
                          disabled={availableBalance < req.amount}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                        >
                          Pay Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE PAYMENT REQUEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Create Payment Request</h3>
            <p className="text-xs text-slate-400 mb-4">Send a polite request for funds to a peer.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Request From (Peer)
                </label>
                <select
                  value={targetPeer?.id}
                  onChange={(e) => {
                    const found = peers.find((p) => p.id === e.target.value);
                    if (found) setTargetPeer(found);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {peers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.tag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={reqAmount}
                    onChange={(e) => setReqAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Reason / Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lunch split, Concert ticket..."
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPLIT BILL MODAL */}
      {showSplitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Split an Expense</h3>
            <p className="text-xs text-slate-400 mb-4">Evenly divide a receipt among friends.</p>

            <form onSubmit={handleSplitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Total Bill Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={totalBill}
                    onChange={(e) => setTotalBill(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Expense Description
                </label>
                <input
                  type="text"
                  value={splitNote}
                  onChange={(e) => setSplitNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Select Friends to Split With (Including You):
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {peers.map((peer) => {
                    const checked = selectedSplitPeers.includes(peer.id);
                    return (
                      <label
                        key={peer.id}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                          checked ? 'bg-slate-950 border-emerald-500 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSplitPeer(peer.id)}
                            className="accent-emerald-500"
                          />
                          <span className="font-semibold">{peer.name}</span>
                          <span className="font-mono text-[10px] text-emerald-400">{peer.tag}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Calculated breakdown preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">
                  Each Person Owes ({selectedSplitPeers.length + 1} people):
                </span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  ${(parseFloat(totalBill || '0') / (selectedSplitPeers.length + 1)).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSplitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedSplitPeers.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors"
                >
                  Send {selectedSplitPeers.length} Requests
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
