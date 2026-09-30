import React from 'react';
import { Shield, Bell, QrCode, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';
import { UserProfile, FraudAlertEvent } from '../types/wallet.ts';

interface NavbarProps {
  activeTab: 'wallet' | 'transactions' | 'analytics' | 'security' | 'requests';
  setActiveTab: (tab: 'wallet' | 'transactions' | 'analytics' | 'security' | 'requests') => void;
  user: UserProfile;
  alerts: FraudAlertEvent[];
  onOpenSendModal: () => void;
  onOpenDepositModal: () => void;
  onOpenQRModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  alerts,
  onOpenSendModal,
  onOpenDepositModal,
  onOpenQRModal,
}) => {
  const unresolvedAlertsCount = alerts.filter((a) => !a.resolved).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <span className="text-white font-bold text-lg tracking-tight">P</span>
          </div>
          <button 
            onClick={() => setActiveTab('wallet')}
            className="text-left group flex items-center gap-1.5 focus:outline-none"
          >
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              PaySphere
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              FinTech
            </span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'bg-slate-800/90 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-slate-800/90 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-800/90 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`relative px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-slate-800/90 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fraud & 2FA</span>
            {unresolvedAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-slate-800/90 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Requests
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick QR code icon */}
          <button
            onClick={onOpenQRModal}
            title="Scan or View QR Code"
            className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Quick Add Money */}
          <button
            onClick={onOpenDepositModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Money</span>
          </button>

          {/* Quick Send Money primary CTA */}
          <button
            onClick={onOpenSendModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Send Money</span>
          </button>

          {/* User profile tag */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-xs text-white border border-slate-600">
              RS
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-slate-200">{user.name}</div>
              <div className="text-emerald-400 font-mono text-[11px]">{user.tag}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile subnavigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-slate-950/80 py-2 px-2 text-xs">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-2.5 py-1 rounded ${activeTab === 'wallet' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Wallet
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-2.5 py-1 rounded ${activeTab === 'transactions' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1 rounded ${activeTab === 'analytics' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`relative px-2.5 py-1 rounded ${activeTab === 'security' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Security
          {unresolvedAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-2.5 py-1 rounded ${activeTab === 'requests' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Requests
        </button>
      </div>
    </header>
  );
};
