export interface UserProfile {
  id: string;
  name: string;
  tag: string; // e.g. "$ritesh"
  email: string;
  phone: string;
  avatarUrl: string;
  accountNumber: string;
  routingNumber: string;
  kycTier: 'Tier 1' | 'Tier 2 (Verified)' | 'Enterprise';
  twoFactorEnabled: boolean;
  twoFactorMethod: 'totp' | 'sms';
  twoFactorThreshold: number; // requires 2FA if amount >= threshold
  totpSecret: string;
  fraudStrictMode: boolean;
  velocityLimitPerHour: number;
}

export interface PeerContact {
  id: string;
  name: string;
  tag: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isFavorite: boolean;
  riskRating: 'low' | 'moderate' | 'high' | 'flagged';
  verified: boolean;
  recentTransactionDate?: string;
  totalExchanged?: number;
}

export type TransactionType = 'send' | 'receive' | 'deposit' | 'withdraw' | 'request';
export type TransactionStatus = 'completed' | 'pending_2fa' | 'held_for_review' | 'declined' | 'refunded';
export type SpendingCategory = 
  | 'Peer Transfer' 
  | 'Food & Dining' 
  | 'Tech & Subscriptions' 
  | 'Shopping & Retail' 
  | 'Travel & Transit' 
  | 'Bills & Utilities' 
  | 'Top-Up / Deposit' 
  | 'Bank Withdrawal';

export interface Transaction {
  id: string;
  referenceId: string;
  type: TransactionType;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  fee: number;
  status: TransactionStatus;
  sender: {
    id: string;
    name: string;
    tag: string;
    avatarUrl?: string;
  };
  recipient: {
    id: string;
    name: string;
    tag: string;
    avatarUrl?: string;
  };
  category: SpendingCategory;
  note: string;
  timestamp: string;
  riskScore: number; // 0 - 100
  riskFlags: string[];
  twoFactorVerified: boolean;
  deviceIp?: string;
  location?: string;
  gatewayProvider?: 'Stripe Connect' | 'Plaid ACH' | 'Visa Direct' | 'Mastercard Send';
  paymentMethodMask?: string;
}

export interface WalletBalances {
  availableUSD: number;
  vaultReserveUSD: number;
  subBalances: {
    EUR: number;
    GBP: number;
  };
  monthlyInflow: number;
  monthlyOutflow: number;
  exchangeRates: {
    EUR: number; // 1 USD = 0.92 EUR
    GBP: number; // 1 USD = 0.79 GBP
  };
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high';
  thresholdValue?: number;
  unit?: string;
  detectedCount: number;
}

export interface FraudAlertEvent {
  id: string;
  timestamp: string;
  severity: 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  transactionRef?: string;
  amount?: number;
  resolved: boolean;
  riskScore: number;
  triggers: string[];
}

export interface PaymentRequestItem {
  id: string;
  requesterName: string;
  requesterTag: string;
  requesterAvatar: string;
  payerName: string;
  payerTag: string;
  amount: number;
  note: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'settled' | 'declined';
}
