import React, { useState, useEffect, useRef } from 'react';
import { Shield, KeyRound, Smartphone, AlertCircle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { getTotpCode, verifyTwoFactorCode } from '../utils/twoFactor.ts';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionContext?: {
    amount: number;
    recipientName: string;
    recipientTag: string;
    reason: string;
  };
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transactionContext,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [method, setMethod] = useState<'totp' | 'sms'>('totp');
  const [totpInfo, setTotpInfo] = useState(getTotpCode());
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update ticking TOTP countdown every 1 second
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTotpInfo(getTotpCode());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-focus first input when opened
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMessage('');
      setIsVerifying(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // If user pasted multi-digit string
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const next = [...digits];
      chars.forEach((c, i) => {
        if (i < 6) next[i] = c;
      });
      setDigits(next);
      const targetIndex = Math.min(chars.length, 5);
      inputRefs.current[targetIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = clean;
    setDigits(next);

    // Auto advance
    if (index < 5 && clean) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your security code');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    setTimeout(() => {
      const isValid = verifyTwoFactorCode(fullCode);
      if (isValid) {
        setIsVerifying(false);
        onSuccess();
      } else {
        setIsVerifying(false);
        setErrorMessage('Invalid 2FA code. Please use the current Authenticator token or test code 849201.');
      }
    }, 450);
  };

  const handleFillTotp = () => {
    const code = totpInfo.code;
    setDigits(code.split(''));
    setErrorMessage('');
    inputRefs.current[5]?.focus();
  };

  const handleFillDemoCode = () => {
    setDigits(['8', '4', '9', '2', '0', '1']);
    setErrorMessage('');
    inputRefs.current[5]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800/80 flex items-center justify-center text-amber-400 shadow-md shadow-amber-950/50">
            <Shield className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Two-Factor Authentication</h3>
            <p className="text-[11px] text-slate-400">High-Security Verification Protocol</p>
          </div>
        </div>

        {/* Transaction Context Badge */}
        {transactionContext && (
          <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400">Action:</span>
              <span className="font-semibold text-white">
                Send <span className="text-emerald-400 font-mono">${transactionContext.amount.toFixed(2)}</span> to {transactionContext.recipientName} ({transactionContext.recipientTag})
              </span>
            </div>
            <div className="text-[11px] text-amber-400 flex items-center gap-1.5 mt-1 pt-1 border-t border-slate-900">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{transactionContext.reason}</span>
            </div>
          </div>
        )}

        {/* 2FA Method Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setMethod('totp')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              method === 'totp'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Authenticator (TOTP)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod('sms');
              setSmsSent(true);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              method === 'sms'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS OTP Code</span>
          </button>
        </div>

        {/* 6 Digit Input Group */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 text-center mb-3">
            Enter 6-Digit Passcode
          </label>
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono text-white bg-slate-950 border border-slate-700/80 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
              />
            ))}
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real-time TOTP Helper Card (Enables frictionless testing) */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {method === 'totp' ? 'Live Authenticator App' : 'SMS Code Dispatched'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                {totpInfo.secondsRemaining}s
              </span>
            </div>

            <button
              type="button"
              onClick={handleFillTotp}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              <span>1-Click Fill ({totpInfo.code})</span>
            </button>
          </div>

          {/* Progress bar countdown */}
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-400 transition-all duration-1000 ease-linear"
              style={{ width: `${totpInfo.percentageRemaining}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Or test bypass:</span>
            <button
              type="button"
              onClick={handleFillDemoCode}
              className="font-mono text-slate-400 hover:text-white underline"
            >
              Demo Code (849201)
            </button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel Transfer
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex-1 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Token...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verify & Authorize</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
