import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Scan, ArrowRight, User } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay.tsx';
import { UserProfile, PeerContact } from '../types/wallet.ts';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  peers: PeerContact[];
  onScanSuccess: (peer: PeerContact, amount?: number) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  user,
  peers,
  onScanSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan'>('my_qr');
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const paymentUrl = customAmount && parseFloat(customAmount) > 0
    ? `https://paysphere.me/pay/${user.tag}?amt=${parseFloat(customAmount).toFixed(2)}`
    : `https://paysphere.me/pay/${user.tag}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = (peer: PeerContact, amount: number) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onScanSuccess(peer, amount);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('my_qr')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'my_qr'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>My QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'scan'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-4 h-4 text-emerald-400" />
            <span>Scan to Pay</span>
          </button>
        </div>

        {activeTab === 'my_qr' ? (
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{user.name}</h3>
              <div className="font-mono text-emerald-400 text-xs font-semibold">{user.tag}</div>
            </div>

            {/* SVG QR Code */}
            <div className="flex justify-center my-2">
              <QRCodeDisplay value={paymentUrl} size={200} />
            </div>

            {/* Optional amount preset */}
            <div className="max-w-xs mx-auto text-left">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Preset Request Amount (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Copy Payment link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700/60 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Payment Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Pay Link ({user.tag})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* SCANNER SIMULATOR */
          <div className="space-y-4">
            <div className="relative w-full aspect-square max-w-[240px] mx-auto rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />

              {/* Animated laser line */}
              <div className="absolute inset-x-4 h-0.5 bg-emerald-400/80 shadow-md shadow-emerald-400 animate-bounce" />

              <Scan className="w-10 h-10 text-slate-600 mb-2" />
              <span className="text-[11px] text-slate-400 font-mono text-center px-4">
                {isScanning ? 'Decoding QR Signature...' : 'Align PaySphere QR Code inside camera viewfinder'}
              </span>
            </div>

            {/* Quick scan simulator buttons */}
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Simulate Instant Scan Test
              </div>
              <div className="space-y-2">
                {peers.slice(0, 3).map((peer, idx) => {
                  const testAmounts = [45, 80, 150];
                  const testAmt = testAmounts[idx] || 50;
                  return (
                    <button
                      key={peer.id}
                      type="button"
                      onClick={() => handleSimulateScan(peer, testAmt)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/80 flex items-center justify-between text-left transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                          {peer.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{peer.name}</div>
                          <div className="text-[10px] font-mono text-emerald-400">{peer.tag}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">${testAmt}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
