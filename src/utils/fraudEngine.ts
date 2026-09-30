import { FraudRule, PeerContact, Transaction } from '../types/wallet.ts';

export interface FraudEvaluationResult {
  riskScore: number; // 0 - 100
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskFlags: string[];
  requires2FA: boolean;
  isHeldForReview: boolean;
  recommendedAction: 'approve' | 'challenge_2fa' | 'hold_for_review';
  reasoning: string;
}

export function evaluateTransactionRisk(
  amount: number,
  recipient: PeerContact,
  availableBalance: number,
  recentTransactions: Transaction[],
  rules: FraudRule[],
  twoFactorThreshold: number,
  options?: {
    customHour?: number;
    deviceIp?: string;
    isForeignIp?: boolean;
  }
): FraudEvaluationResult {
  let score = 5; // Base baseline risk
  const flags: string[] = [];

  const getRule = (id: string) => rules.find((r) => r.id === id && r.enabled);

  // 1. Check Recipient Reputation
  const payeeRule = getRule('rule_unverified_recipient');
  if (payeeRule) {
    if (recipient.riskRating === 'flagged') {
      score += 55;
      flags.push('Unverified / High-Risk Blacklisted Recipient');
    } else if (recipient.riskRating === 'moderate' || !recipient.verified) {
      score += 20;
      flags.push('Unverified Contact Credentials');
    }
  }

  // 2. High-Value Anomaly Spike
  const highValRule = getRule('rule_high_value');
  const threshold = highValRule?.thresholdValue || 1500;
  if (highValRule && amount >= threshold) {
    score += 30;
    flags.push(`Exceeds High-Value Spike Threshold ($${threshold.toLocaleString()})`);
  }
  if (availableBalance > 0 && amount >= availableBalance * 0.4) {
    score += 25;
    flags.push('High Balance Ratio (>40% of liquid assets)');
  }

  // 3. Velocity Anomaly (Last 60 seconds)
  const velocityRule = getRule('rule_velocity');
  if (velocityRule) {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const rapidCount = recentTransactions.filter((tx) => {
      const txTime = new Date(tx.timestamp).getTime();
      return tx.type === 'send' && txTime >= oneMinuteAgo;
    }).length;

    if (rapidCount >= (velocityRule.thresholdValue || 2)) {
      score += 35;
      flags.push(`Velocity Spike Alert (${rapidCount + 1} transfers in < 60s)`);
    }
  }

  // 4. Abnormal Off-Hours Spending (2:00 AM - 5:00 AM)
  const nightRule = getRule('rule_night_hour');
  const currentHour = options?.customHour ?? new Date().getHours();
  if (nightRule && (currentHour >= 2 && currentHour <= 5) && amount > 250) {
    score += 20;
    flags.push('Abnormal Off-Hours Transfer Request (02:00-05:00)');
  }

  // 5. Geo-IP / Device Anomaly
  const geoRule = getRule('rule_geo_anomaly');
  if (geoRule && (options?.isForeignIp || (options?.deviceIp && options.deviceIp.includes('Proxy')))) {
    score += 30;
    flags.push('Anomalous Network / Proxy Device Signature');
  }

  // Enforce score boundary [0, 100]
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Risk Level & Recommendation
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  let recommendedAction: 'approve' | 'challenge_2fa' | 'hold_for_review' = 'approve';
  let requires2FA = false;
  let isHeldForReview = false;

  if (finalScore >= 75) {
    riskLevel = finalScore >= 90 ? 'critical' : 'high';
    isHeldForReview = true;
    requires2FA = true;
    recommendedAction = 'hold_for_review';
  } else if (finalScore >= 25 || amount >= twoFactorThreshold) {
    riskLevel = 'moderate';
    requires2FA = true;
    recommendedAction = 'challenge_2fa';
    if (amount >= twoFactorThreshold && !flags.some((f) => f.includes('2FA'))) {
      flags.push(`Security Policy: Transfers ≥ $${twoFactorThreshold} require 2FA`);
    }
  } else {
    riskLevel = 'low';
    recommendedAction = 'approve';
  }

  let reasoning = 'Transaction passed baseline heuristic checks. Safe to proceed.';
  if (isHeldForReview) {
    reasoning = `High risk detected (Score ${finalScore}/100) due to multiple anomaly flags. Escrow hold applied.`;
  } else if (requires2FA) {
    reasoning = `Verification required (Score ${finalScore}/100) to confirm account authorization.`;
  }

  return {
    riskScore: finalScore,
    riskLevel,
    riskFlags: flags,
    requires2FA,
    isHeldForReview,
    recommendedAction,
    reasoning,
  };
}
