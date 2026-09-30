import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Download, 
  CreditCard, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  mode: 'deposit' | 'withdraw';
  onClose: () => void;
  availableBalance: number;
  onExecuteDeposit: (amount: number, method: string) => void;
  onExecuteWithdrawal: (amount: number, method: string, fee: number) => void;
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  isOpen,
  mode: initialMode,
  onClose,
  availableBalance,
  onExecuteDeposit,
  onExecuteWithdrawal,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialMode);
  
  // Deposit state
  const [depositAmount, setDepositAmount] = useState('250.00');
  const [depositMethod, setDepositMethod] = useState<'card' | 'ach' | 'apple_pay'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9812');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('392');

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState('100.00');
  const [bankAccount, setBankAccount] = useState('Chase Checking (•••• 8812)');
  const [speed, setSpeed] = useState<'instant' | 'standard'>('instant');

  // Gateway processing simulation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<string>('');

  if (!isOpen) return null;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    setIsProcessing(true);
    setGatewayStep('Initiating Payment Gateway Intent (POST /v1/payment_intents)...');

    setTimeout(() => {
      setGatewayStep('Authenticating 3-D Secure 2.0 with Card Network (Stripe/Visa)...');
      setTimeout(() => {
        setGatewayStep('Webhook Event Received: charge.succeeded. Balance credited!');
        setTimeout(() => {
          setIsProcessing(false);
          setGatewayStep('');
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore if blocked
          }
          onExecuteDeposit(
            amt, 
            depositMethod === 'card' ? 'Visa Debit (••9812)' : depositMethod === 'ach' ? 'Chase ACH (••8812)' : 'Apple Pay'
          );
          onClose();
        }, 600);
      }, 700);
    }, 600);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (amt > availableBalance) {
      alert('Withdrawal amount exceeds available wallet balance');
      return;
    }

    const fee = speed === 'instant' ? Math.max(0.25, amt * 0.015) : 0.00;

    setIsProcessing(true);
    setGatewayStep('Submitting Payout API request (POST /v1/payouts)...');

    setTimeout(() => {
      setGatewayStep(`Routing via ${speed === 'instant' ? 'Visa Direct Instant Rail' : 'Automated Clearing House (ACH)'}...`);
      setTimeout(() => {
        setIsProcessing(false);
        setGatewayStep('');
        onExecuteWithdrawal(amt, `${bankAccount} (${speed === 'instant' ? 'Instant' : 'ACH'})`, fee);
        onClose();
      }, 700);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl relative my-8">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switcher: Top-up vs Withdraw */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'deposit'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Funds (Payment Gateway)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'withdraw'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Bank Payout / Withdrawal</span>
          </button>
        </div>

        {/* DEPOSIT FORM */}
        {activeTab === 'deposit' ? (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            
            {/* Amount input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Deposit Amount (USD)
                </label>
                <span className="text-xs text-slate-500">Zero Gateway Fees</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-2xl font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  min="5"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-2xl font-extrabold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Amount presets */}
              <div className="flex items-center gap-1.5 mt-2">
                {[50, 100, 250, 500, 1000].map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setDepositAmount(v.toFixed(2))}
                    className="px-2.5 py-1 text-xs font-medium font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Gateway Method Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Payment Gateway Source
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDepositMethod('card')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    depositMethod === 'card'
                      ? 'bg-slate-800/90 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <div className="text-xs font-semibold">Debit / Credit</div>
                  <div className="text-[10px] text-slate-500">Instant</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMethod('ach')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    depositMethod === 'ach'
                      ? 'bg-slate-800/90 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-teal-400" />
                  <div className="text-xs font-semibold">Plaid ACH</div>
                  <div className="text-[10px] text-slate-500">Bank Transfer</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMethod('apple_pay')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    depositMethod === 'apple_pay'
                      ? 'bg-slate-800/90 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                  <div className="text-xs font-semibold">Apple Pay</div>
                  <div className="text-[10px] text-slate-500">1-Touch</div>
                </button>
              </div>
            </div>

            {/* Gateway Card Fields if Card Selected */}
            {depositMethod === 'card' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Payment Card Credentials</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    256-bit TLS Encrypted
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="CVV"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Plaid ACH selector if ACH selected */}
            {depositMethod === 'ach' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-300 mb-1">Linked Plaid Accounts:</div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-white">JPMorgan Chase Checking (•••• 8812)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase">Connected</span>
                </div>
              </div>
            )}

            {/* Gateway API Status Indicator during execution */}
            {isProcessing && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                <span className="font-mono">{gatewayStep}</span>
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Payment Gateway API...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Authorize Deposit of ${parseFloat(depositAmount || '0').toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* WITHDRAWAL FORM */
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            
            {/* Amount input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Withdrawal Amount (USD)
                </label>
                <span className="text-xs text-slate-400">
                  Available: <span className="font-mono font-semibold text-white">${availableBalance.toFixed(2)}</span>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-2xl font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-2xl font-extrabold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                {[50, 100, 250, 500, 1000].map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setWithdrawAmount(v.toFixed(2))}
                    className="px-2.5 py-1 text-xs font-medium font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    ${v}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:underline"
                >
                  All Funds
                </button>
              </div>
            </div>

            {/* Destination Bank Account */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Destination Bank Account
              </label>
              <select
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Chase Checking (•••• 8812)">JPMorgan Chase Checking (•••• 8812)</option>
                <option value="Bank of America Savings (•••• 3190)">Bank of America Savings (•••• 3190)</option>
                <option value="Wells Fargo Premier (•••• 4401)">Wells Fargo Premier (•••• 4401)</option>
              </select>
            </div>

            {/* Speed selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Transfer Speed
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSpeed('instant')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    speed === 'instant'
                      ? 'bg-slate-800/90 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Instant Transfer</span>
                    <span className="text-[10px] text-emerald-400 font-mono">1.5% Fee</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Arrival in 30 seconds via Visa Direct</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeed('standard')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    speed === 'standard'
                      ? 'bg-slate-800/90 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Standard ACH</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Free</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Arrival in 1-3 business days</div>
                </button>
              </div>
            </div>

            {/* Summary calculation */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Requested Amount:</span>
                <span className="font-mono text-white">${parseFloat(withdrawAmount || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing Fee:</span>
                <span className="font-mono text-white">
                  ${(speed === 'instant' ? Math.max(0.25, parseFloat(withdrawAmount || '0') * 0.015) : 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-800 font-bold text-white">
                <span>Net Bank Credit:</span>
                <span className="font-mono text-emerald-400">
                  ${Math.max(0, parseFloat(withdrawAmount || '0') - (speed === 'instant' ? Math.max(0.25, parseFloat(withdrawAmount || '0') * 0.015) : 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Gateway API Status Indicator during execution */}
            {isProcessing && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                <span className="font-mono">{gatewayStep}</span>
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || parseFloat(withdrawAmount || '0') > availableBalance}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Executing Bank Payout...</span>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Authorize Bank Payout</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
