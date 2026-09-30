/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar.tsx';
import { WalletOverview } from './components/WalletOverview.tsx';
import { TransactionHistory } from './components/TransactionHistory.tsx';
import { PaymentAnalytics } from './components/PaymentAnalytics.tsx';
import { FraudSecurityCenter } from './components/FraudSecurityCenter.tsx';
import { PaymentRequestsView } from './components/PaymentRequestsView.tsx';
import { SendPaymentModal } from './components/SendPaymentModal.tsx';
import { TwoFactorModal } from './components/TwoFactorModal.tsx';
import { DepositWithdrawModal } from './components/DepositWithdrawModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';

import {
  INITIAL_USER,
  INITIAL_PEERS,
  INITIAL_BALANCES,
  INITIAL_TRANSACTIONS,
  INITIAL_FRAUD_RULES,
  INITIAL_FRAUD_ALERTS,
  INITIAL_PAYMENT_REQUESTS,
} from './data/initialData.ts';

import { 
  UserProfile, 
  PeerContact, 
  WalletBalances, 
  Transaction, 
  FraudRule, 
  FraudAlertEvent, 
  PaymentRequestItem,
  SpendingCategory 
} from './types/wallet.ts';

import { FraudEvaluationResult } from './utils/fraudEngine.ts';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'wallet' | 'transactions' | 'analytics' | 'security' | 'requests'>('wallet');

  // Core FinTech State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('paysphere_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [balances, setBalances] = useState<WalletBalances>(() => {
    const saved = localStorage.getItem('paysphere_balances');
    return saved ? JSON.parse(saved) : INITIAL_BALANCES;
  });

  const [peers, setPeers] = useState<PeerContact[]>(INITIAL_PEERS);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('paysphere_txs');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [rules, setRules] = useState<FraudRule[]>(() => {
    const saved = localStorage.getItem('paysphere_rules');
    return saved ? JSON.parse(saved) : INITIAL_FRAUD_RULES;
  });

  const [alerts, setAlerts] = useState<FraudAlertEvent[]>(() => {
    const saved = localStorage.getItem('paysphere_alerts');
    return saved ? JSON.parse(saved) : INITIAL_FRAUD_ALERTS;
  });

  const [requests, setRequests] = useState<PaymentRequestItem[]>(INITIAL_PAYMENT_REQUESTS);

  // Modals & Drawers
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [sendPeerPreselect, setSendPeerPreselect] = useState<PeerContact | undefined>(undefined);
  const [isDepositWithdrawOpen, setIsDepositWithdrawOpen] = useState(false);
  const [depositWithdrawMode, setDepositWithdrawMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [isQROpen, setIsQROpen] = useState(false);
  const [isTwoFactorOpen, setIsTwoFactorOpen] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  // Stored pending transfer when waiting for 2FA verification
  const [pendingTransfer, setPendingTransfer] = useState<{
    recipient: PeerContact;
    amount: number;
    category: SpendingCategory;
    note: string;
    riskEvaluation: FraudEvaluationResult;
    deviceIp: string;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('paysphere_balances', JSON.stringify(balances));
  }, [balances]);

  useEffect(() => {
    localStorage.setItem('paysphere_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('paysphere_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('paysphere_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('paysphere_user', JSON.stringify(user));
  }, [user]);

  // Execute Transfer helper
  const finalizeTransfer = (params: {
    recipient: PeerContact;
    amount: number;
    category: SpendingCategory;
    note: string;
    riskEvaluation: FraudEvaluationResult;
    deviceIp: string;
    twoFactorVerified: boolean;
  }) => {
    const { recipient, amount, category, note, riskEvaluation, deviceIp, twoFactorVerified } = params;

    const isHeld = riskEvaluation.isHeldForReview;
    const refCode = `TX-${Math.floor(100000 + Math.random() * 900000)}-PS`;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceId: refCode,
      type: 'send',
      amount,
      currency: 'USD',
      fee: 0.00,
      status: isHeld ? 'held_for_review' : 'completed',
      sender: {
        id: user.id,
        name: user.name,
        tag: user.tag,
      },
      recipient: {
        id: recipient.id,
        name: recipient.name,
        tag: recipient.tag,
        avatarUrl: recipient.avatarUrl,
      },
      category,
      note,
      timestamp: new Date().toISOString(),
      riskScore: riskEvaluation.riskScore,
      riskFlags: riskEvaluation.riskFlags,
      twoFactorVerified,
      deviceIp,
      location: 'San Francisco, CA',
      gatewayProvider: 'Visa Direct',
      paymentMethodMask: 'Wallet USD Balance',
    };

    // Update balances
    setBalances((prev) => ({
      ...prev,
      availableUSD: prev.availableUSD - amount,
      monthlyOutflow: prev.monthlyOutflow + amount,
    }));

    // Prepend to transactions
    setTransactions((prev) => [newTx, ...prev]);

    // If held for review, raise fraud alert event
    if (isHeld) {
      const newAlert: FraudAlertEvent = {
        id: `alert_${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: riskEvaluation.riskLevel === 'critical' ? 'critical' : 'high',
        title: `High-Risk P2P Transfer Intercepted ($${amount.toFixed(2)})`,
        description: `Payment to ${recipient.name} (${recipient.tag}) was flagged by autonomous heuristics (Risk: ${riskEvaluation.riskScore}/100). Funds held in protective escrow.`,
        transactionRef: refCode,
        amount,
        resolved: false,
        riskScore: riskEvaluation.riskScore,
        triggers: riskEvaluation.riskFlags,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    } else {
      // Trigger festive celebration
      try {
        confetti({
          particleCount: 70,
          spread: 55,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  // Handler from SendPaymentModal
  const handleInitiateTransfer = (params: {
    recipient: PeerContact;
    amount: number;
    category: SpendingCategory;
    note: string;
    riskEvaluation: FraudEvaluationResult;
    deviceIp: string;
  }) => {
    setIsSendOpen(false);

    // Check if 2FA is needed
    if (params.riskEvaluation.requires2FA) {
      setPendingTransfer(params);
      setIsTwoFactorOpen(true);
    } else {
      finalizeTransfer({
        ...params,
        twoFactorVerified: false,
      });
    }
  };

  // Handler when 2FA code is verified successfully
  const handleTwoFactorSuccess = () => {
    setIsTwoFactorOpen(false);
    if (pendingTransfer) {
      finalizeTransfer({
        ...pendingTransfer,
        twoFactorVerified: true,
      });
      setPendingTransfer(null);
    }
  };

  // Handler for deposit top-ups via Gateway
  const handleExecuteDeposit = (amount: number, method: string) => {
    const refCode = `GW-${Math.floor(100000 + Math.random() * 900000)}-DEP`;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceId: refCode,
      type: 'deposit',
      amount,
      currency: 'USD',
      fee: 0.00,
      status: 'completed',
      sender: {
        id: 'gateway_prov',
        name: `Payment Gateway (${method})`,
        tag: '$gateway',
      },
      recipient: {
        id: user.id,
        name: user.name,
        tag: user.tag,
      },
      category: 'Top-Up / Deposit',
      note: `Wallet loaded via ${method}`,
      timestamp: new Date().toISOString(),
      riskScore: 2,
      riskFlags: [],
      twoFactorVerified: true,
      deviceIp: '192.168.1.104 (Trusted)',
      gatewayProvider: method.includes('Visa') ? 'Visa Direct' : 'Plaid ACH',
      paymentMethodMask: method,
    };

    setBalances((prev) => ({
      ...prev,
      availableUSD: prev.availableUSD + amount,
      monthlyInflow: prev.monthlyInflow + amount,
    }));

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Handler for bank payouts / withdrawals
  const handleExecuteWithdrawal = (amount: number, method: string, fee: number) => {
    const refCode = `WD-${Math.floor(100000 + Math.random() * 900000)}-ACH`;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceId: refCode,
      type: 'withdraw',
      amount,
      currency: 'USD',
      fee,
      status: 'completed',
      sender: {
        id: user.id,
        name: user.name,
        tag: user.tag,
      },
      recipient: {
        id: 'bank_partner',
        name: method,
        tag: '$bank',
      },
      category: 'Bank Withdrawal',
      note: `Bank payout to ${method}`,
      timestamp: new Date().toISOString(),
      riskScore: 8,
      riskFlags: [],
      twoFactorVerified: true,
      deviceIp: '192.168.1.104 (Trusted)',
      gatewayProvider: 'Plaid ACH',
      paymentMethodMask: method,
    };

    setBalances((prev) => ({
      ...prev,
      availableUSD: prev.availableUSD - amount,
      monthlyOutflow: prev.monthlyOutflow + amount,
    }));

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Vault Stash
  const handleTransferToVault = (amount: number) => {
    setBalances((prev) => ({
      ...prev,
      availableUSD: prev.availableUSD - amount,
      vaultReserveUSD: prev.vaultReserveUSD + amount,
    }));
  };

  // Vault Release
  const handleWithdrawFromVault = (amount: number) => {
    setBalances((prev) => ({
      ...prev,
      availableUSD: prev.availableUSD + amount,
      vaultReserveUSD: prev.vaultReserveUSD - amount,
    }));
  };

  // Rules engine controls
  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleUpdateThreshold = (ruleId: string, val: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, thresholdValue: val } : r))
    );
  };

  const handleUpdate2FAThreshold = (val: number) => {
    setUser((prev) => ({
      ...prev,
      twoFactorThreshold: val,
    }));
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // Payment Requests
  const handlePayRequest = (req: PaymentRequestItem) => {
    if (balances.availableUSD < req.amount) {
      alert('Insufficient available wallet balance');
      return;
    }

    const peer = peers.find((p) => p.tag === req.requesterTag) || {
      id: `peer_${Date.now()}`,
      name: req.requesterName,
      tag: req.requesterTag,
      email: `${req.requesterTag.replace('$', '')}@example.com`,
      phone: '+1 (555) 000-0000',
      avatarUrl: req.requesterAvatar,
      isFavorite: false,
      riskRating: 'low' as const,
      verified: true,
    };

    // If amount >= 2FA threshold, challenge 2FA
    if (req.amount >= user.twoFactorThreshold) {
      setPendingTransfer({
        recipient: peer,
        amount: req.amount,
        category: 'Peer Transfer',
        note: `Payment for request: ${req.note}`,
        riskEvaluation: {
          riskScore: 15,
          riskLevel: 'moderate',
          riskFlags: [`Transfers ≥ $${user.twoFactorThreshold} require 2FA`],
          requires2FA: true,
          isHeldForReview: false,
          recommendedAction: 'challenge_2fa',
          reasoning: 'Security policy requires 2FA authentication.',
        },
        deviceIp: '192.168.1.104 (Trusted)',
      });
      setIsTwoFactorOpen(true);
    } else {
      finalizeTransfer({
        recipient: peer,
        amount: req.amount,
        category: 'Peer Transfer',
        note: `Settled request: ${req.note}`,
        riskEvaluation: {
          riskScore: 5,
          riskLevel: 'low',
          riskFlags: [],
          requires2FA: false,
          isHeldForReview: false,
          recommendedAction: 'approve',
          reasoning: 'Clean peer settlement.',
        },
        deviceIp: '192.168.1.104 (Trusted)',
        twoFactorVerified: false,
      });
    }

    setRequests((prev) =>
      prev.map((item) => (item.id === req.id ? { ...item, status: 'settled' } : item))
    );
  };

  const handleDeclineRequest = (reqId: string) => {
    setRequests((prev) =>
      prev.map((item) => (item.id === reqId ? { ...item, status: 'declined' } : item))
    );
  };

  const handleCreateRequest = (item: Omit<PaymentRequestItem, 'id' | 'createdAt' | 'status'>) => {
    const newItem: PaymentRequestItem = {
      ...item,
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setRequests((prev) => [newItem, ...prev]);
  };

  // QR Scan callback
  const handleScanSuccess = (scannedPeer: PeerContact, customAmt?: number) => {
    setSendPeerPreselect(scannedPeer);
    setIsSendOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        alerts={alerts}
        onOpenSendModal={() => {
          setSendPeerPreselect(undefined);
          setIsSendOpen(true);
        }}
        onOpenDepositModal={() => {
          setDepositWithdrawMode('deposit');
          setIsDepositWithdrawOpen(true);
        }}
        onOpenQRModal={() => setIsQROpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'wallet' && (
          <WalletOverview
            balances={balances}
            user={user}
            peers={peers}
            recentTransactions={transactions}
            onOpenSendModal={(peer) => {
              setSendPeerPreselect(peer);
              setIsSendOpen(true);
            }}
            onOpenDepositModal={() => {
              setDepositWithdrawMode('deposit');
              setIsDepositWithdrawOpen(true);
            }}
            onOpenWithdrawModal={() => {
              setDepositWithdrawMode('withdraw');
              setIsDepositWithdrawOpen(true);
            }}
            onOpenRequestModal={() => setActiveTab('requests')}
            onOpenQRModal={() => setIsQROpen(true)}
            onViewAllTransactions={() => setActiveTab('transactions')}
            onSelectTransaction={(tx) => setSelectedTxDetail(tx)}
            onTransferToVault={handleTransferToVault}
            onWithdrawFromVault={handleWithdrawFromVault}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionHistory
            transactions={transactions}
            onOpenSendModal={() => {
              setSendPeerPreselect(undefined);
              setIsSendOpen(true);
            }}
            selectedTransaction={selectedTxDetail}
            onSelectTransaction={(tx) => setSelectedTxDetail(tx)}
          />
        )}

        {activeTab === 'analytics' && (
          <PaymentAnalytics
            transactions={transactions}
            balances={balances}
            peers={peers}
          />
        )}

        {activeTab === 'security' && (
          <FraudSecurityCenter
            rules={rules}
            alerts={alerts}
            user={user}
            onToggleRule={handleToggleRule}
            onUpdateThreshold={handleUpdateThreshold}
            onUpdate2FAThreshold={handleUpdate2FAThreshold}
            onResolveAlert={handleResolveAlert}
            onDismissAlert={handleDismissAlert}
          />
        )}

        {activeTab === 'requests' && (
          <PaymentRequestsView
            requests={requests}
            peers={peers}
            user={user}
            availableBalance={balances.availableUSD}
            onPayRequest={handlePayRequest}
            onDeclineRequest={handleDeclineRequest}
            onCreateRequest={handleCreateRequest}
          />
        )}
      </main>

      {/* Footer conforming to domain-native aesthetics */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PaySphere Digital Wallet</span>
            <span>·</span>
            <span>End-to-End Encrypted Financial Network</span>
            <span>·</span>
            <span className="text-emerald-400">SOC2 Type II Certified</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>TLS 1.3</span>
            <span>·</span>
            <span>RFC 6238 TOTP</span>
            <span>·</span>
            <span>Zero-Fee P2P Rail</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SendPaymentModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        peers={peers}
        user={user}
        availableBalance={balances.availableUSD}
        recentTransactions={transactions}
        rules={rules}
        preselectedPeer={sendPeerPreselect}
        onInitiateTransfer={handleInitiateTransfer}
      />

      <TwoFactorModal
        isOpen={isTwoFactorOpen}
        onClose={() => {
          setIsTwoFactorOpen(false);
          setPendingTransfer(null);
        }}
        onSuccess={handleTwoFactorSuccess}
        transactionContext={
          pendingTransfer
            ? {
                amount: pendingTransfer.amount,
                recipientName: pendingTransfer.recipient.name,
                recipientTag: pendingTransfer.recipient.tag,
                reason: pendingTransfer.riskEvaluation.reasoning,
              }
            : undefined
        }
      />

      <DepositWithdrawModal
        isOpen={isDepositWithdrawOpen}
        mode={depositWithdrawMode}
        onClose={() => setIsDepositWithdrawOpen(false)}
        availableBalance={balances.availableUSD}
        onExecuteDeposit={handleExecuteDeposit}
        onExecuteWithdrawal={handleExecuteWithdrawal}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        user={user}
        peers={peers}
        onScanSuccess={handleScanSuccess}
      />

    </div>
  );
}
