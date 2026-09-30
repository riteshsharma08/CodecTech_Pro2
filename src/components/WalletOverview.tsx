import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  ChevronRight,
  Send,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { WalletBalances, UserProfile, PeerContact, Transaction } from '../types/wallet.ts';

interface WalletOverviewProps {
  balances: WalletBalances;
  user: UserProfile;
  peers: PeerContact[];
  recentTransactions: Transaction[];
  onOpenSendModal: (preselectedPeer?: PeerContact) => void;
  onOpenDepositModal: () => void;
  onOpenWithdrawModal: () => void;
  onOpenRequestModal: () => void;
  onOpenQRModal: () => void;
  onViewAllTransactions: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onTransferToVault: (amount: number) => void;
  onWithdrawFromVault: (amount: number) => void;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  balances,
  user,
  peers,
  recentTransactions,
  onOpenSendModal,
  onOpenDepositModal,
  onOpenWithdrawModal,
  onOpenRequestModal,
  onOpenQRModal,
  onViewAllTransactions,
  onSelectTransaction,
  onTransferToVault,
  onWithdrawFromVault,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [cardRevealed, setCardRevealed] = useState(false);
  const [cardFrozen, setCardFrozen] = useState(false);
  const [vaultAmountInput, setVaultAmountInput] = useState('');
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultAction, setVaultAction] = useState<'deposit' | 'withdraw'>('deposit');

  // Currency conversions
  const getDisplayBalance = (amountUSD: number) => {
    if (selectedCurrency === 'USD') return amountUSD;
    if (selectedCurrency === 'EUR') return amountUSD * balances.exchangeRates.EUR;
    if (selectedCurrency === 'GBP') return amountUSD * balances.exchangeRates.GBP;
    return amountUSD;
  };

  const getCurrencySymbol = () => {
    if (selectedCurrency === 'USD') return '$';
    if (selectedCurrency === 'EUR') return '€';
    if (selectedCurrency === 'GBP') return '£';
    return '$';
  };

  const netCashFlow = balances.monthlyInflow - balances.monthlyOutflow;

  const handleVaultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(vaultAmountInput);
    if (isNaN(val) || val <= 0) return;
    if (vaultAction === 'deposit') {
      if (val > balances.availableUSD) {
        alert('Amount exceeds available wallet balance');
        return;
      }
      onTransferToVault(val);
    } else {
      if (val > balances.vaultReserveUSD) {
        alert('Amount exceeds vault reserve balance');
        return;
      }
      onWithdrawFromVault(val);
    }
    setVaultAmountInput('');
    setShowVaultModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hero Section: Balance Banner & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Balance Canvas (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header row: Account label and Currency switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary Checking Wallet
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                FDIC Insured via Partner Bank
              </span>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedCurrency === curr
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Large Main Balance Number */}
          <div className="mb-6">
            <div className="text-sm font-medium text-slate-400 mb-1">Available Liquid Balance</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono tabular-nums">
                {getCurrencySymbol()}
                {getDisplayBalance(balances.availableUSD).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-sm font-medium text-slate-400 uppercase">
                {selectedCurrency}
              </span>
            </div>

            {selectedCurrency !== 'USD' && (
              <div className="text-xs text-slate-500 mt-1 font-mono">
                Base USD Balance: ${balances.availableUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Live FX rate: 1 USD = {selectedCurrency === 'EUR' ? balances.exchangeRates.EUR : balances.exchangeRates.GBP} {selectedCurrency})
              </div>
            )}
          </div>

          {/* Quick Action Buttons Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
            <button
              onClick={() => onOpenSendModal()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Send Money</span>
            </button>

            <button
              onClick={onOpenRequestModal}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-medium text-sm border border-slate-700/60 transition-all active:scale-[0.98]"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>Request</span>
            </button>

            <button
              onClick={onOpenDepositModal}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-medium text-sm border border-slate-700/60 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>Top-Up (Gateway)</span>
            </button>

            <button
              onClick={onOpenWithdrawModal}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-medium text-sm border border-slate-700/60 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-slate-400 stroke-[2.5]" />
              <span>Bank Payout</span>
            </button>
          </div>

          {/* Sub-balance and Monthly Flow strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/60 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div>
                <span className="text-slate-400">Monthly Inflow</span>
                <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
                  +${balances.monthlyInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/50 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div>
                <span className="text-slate-400">Monthly Outflow</span>
                <div className="text-sm font-bold text-slate-200 font-mono tabular-nums mt-0.5">
                  -${balances.monthlyOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div>
                <span className="text-slate-400">Net Cash Position</span>
                <div className="text-sm font-bold text-white font-mono tabular-nums mt-0.5">
                  {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-950/50 flex items-center justify-center text-teal-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Virtual FinTech Debit Card & Vault (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Virtual Visa Platinum Card */}
          <div className={`relative rounded-2xl p-6 transition-all duration-300 shadow-xl overflow-hidden border ${
            cardFrozen 
              ? 'bg-slate-900 border-rose-900/60 grayscale' 
              : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 border-slate-700/60'
          }`}>
            {/* Card Holographic sheen */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
                  PaySphere Black
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCardRevealed(!cardRevealed)}
                  title={cardRevealed ? "Hide details" : "Reveal numbers"}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {cardRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setCardFrozen(!cardFrozen)}
                  title={cardFrozen ? "Unfreeze card" : "Freeze card"}
                  className={`p-1.5 rounded-lg transition-colors ${
                    cardFrozen ? 'bg-rose-900 text-rose-300' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {cardFrozen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Chip & Contactless */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-7 rounded bg-amber-400/90 border border-amber-300 shadow-inner flex items-center justify-center">
                <div className="w-8 h-5 border border-amber-600/40 rounded-sm" />
              </div>
              <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8.5 16.5a5 5 0 0 1 0-9" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 19a8.5 8.5 0 0 0 0-14" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15.5 21.5a12 12 0 0 0 0-19" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Card Number */}
            <div className="font-mono text-lg sm:text-xl tracking-widest text-white mb-4 select-all">
              {cardRevealed ? '4242 •••• •••• 9812' : '•••• •••• •••• 9812'}
            </div>

            {/* Cardholder & Expiry */}
            <div className="flex items-end justify-between text-xs">
              <div>
                <div className="text-[10px] uppercase text-slate-400 tracking-wider">Cardholder</div>
                <div className="font-semibold text-slate-200 tracking-wide">{user.name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 tracking-wider">Expires / CVV</div>
                <div className="font-mono text-slate-200">{cardRevealed ? '08/29 · 392' : '••/•• · •••'}</div>
              </div>
              <div className="font-bold text-base italic text-emerald-400">
                VISA
              </div>
            </div>

            {cardFrozen && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 bg-rose-950/90 border border-rose-800/80 px-3 py-1.5 rounded-lg shadow-lg">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Card Temporarily Frozen</span>
                </div>
              </div>
            )}
          </div>

          {/* Secure Savings Vault widget */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-800/40 flex items-center justify-center text-teal-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vault Reserve</h4>
                  <div className="text-xs text-slate-500">4.85% APY Yield Account</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setVaultAction('deposit');
                  setShowVaultModal(true);
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Manage
              </button>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                ${balances.vaultReserveUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-emerald-400 font-semibold">+ $20.25 accrued this month</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setVaultAction('deposit');
                  setShowVaultModal(true);
                }}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors text-center"
              >
                + Stash Funds
              </button>
              <button
                onClick={() => {
                  setVaultAction('withdraw');
                  setShowVaultModal(true);
                }}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors text-center"
              >
                Release to Wallet
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Peer Contacts Quick Send Ribbon */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Frequent & Trusted Payees</h3>
            <p className="text-xs text-slate-400">1-click instant P2P transfer with zero processing fees</p>
          </div>
          <button
            onClick={() => onOpenSendModal()}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>All Contacts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {peers.slice(0, 6).map((peer) => {
            const isFlagged = peer.riskRating === 'flagged';
            return (
              <button
                key={peer.id}
                onClick={() => onOpenSendModal(peer)}
                className={`group flex flex-col items-center p-3.5 rounded-xl border transition-all text-center relative ${
                  isFlagged
                    ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                {/* Avatar with fallback */}
                <div className="relative mb-2">
                  {peer.avatarUrl ? (
                    <img
                      src={peer.avatarUrl}
                      alt={peer.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm group-hover:scale-105 transition-transform">
                      {peer.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}

                  {peer.verified && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  {isFlagged && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate max-w-full">
                  {peer.name}
                </div>
                <div className="text-[11px] font-mono text-emerald-400/90 truncate max-w-full">
                  {peer.tag}
                </div>

                {isFlagged && (
                  <span className="mt-1 text-[9px] font-semibold text-rose-400 uppercase tracking-wider">
                    Flagged
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Ledger Activity Preview */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Ledger Activity</h3>
            <p className="text-xs text-slate-400">Cryptographically signed peer-to-peer transfers</p>
          </div>
          <button
            onClick={onViewAllTransactions}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Activity</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {recentTransactions.slice(0, 5).map((tx) => {
            const isOutflow = tx.type === 'send' || tx.type === 'withdraw';
            const isFlagged = tx.status === 'held_for_review';
            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isFlagged
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                        : isOutflow
                        ? 'bg-slate-800 text-slate-300 border border-slate-700/80'
                        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    }`}
                  >
                    {isFlagged ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isOutflow ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                        {tx.type === 'send' ? `Payment to ${tx.recipient.name}` :
                         tx.type === 'receive' ? `Payment from ${tx.sender.name}` :
                         tx.type === 'deposit' ? 'Wallet Top-Up' : 'Bank Payout'}
                      </span>
                      {tx.twoFactorVerified && (
                        <span className="text-[10px] text-emerald-400 font-medium">2FA ✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 truncate">
                      <span>{tx.category}</span>
                      <span>·</span>
                      <span className="font-mono text-[11px] text-slate-500">{new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span className="text-slate-500 truncate">{tx.note}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                  <div
                    className={`text-sm font-bold font-mono tabular-nums ${
                      isFlagged
                        ? 'text-rose-400'
                        : isOutflow
                        ? 'text-white'
                        : 'text-emerald-400'
                    }`}
                  >
                    {isOutflow ? '-' : '+'}${tx.amount.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {tx.status.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vault Management Modal */}
      {showVaultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {vaultAction === 'deposit' ? 'Move to Savings Vault' : 'Withdraw from Savings Vault'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Funds in the vault earn 4.85% APY and are protected with high-security lockouts. You can move them back to your liquid wallet at any time.
            </p>

            <form onSubmit={handleVaultSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={vaultAmountInput}
                    onChange={(e) => setVaultAmountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>
                    Available: ${vaultAction === 'deposit' ? balances.availableUSD.toFixed(2) : balances.vaultReserveUSD.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVaultAmountInput(String(vaultAction === 'deposit' ? balances.availableUSD : balances.vaultReserveUSD))}
                    className="text-emerald-400 font-semibold hover:underline"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVaultModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
