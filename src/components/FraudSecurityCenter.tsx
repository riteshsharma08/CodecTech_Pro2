import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  KeyRound, 
  Smartphone, 
  Lock, 
  Check, 
  Copy, 
  RefreshCw, 
  Sliders, 
  Activity,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import { FraudRule, FraudAlertEvent, UserProfile } from '../types/wallet.ts';
import { getTotpCode } from '../utils/twoFactor.ts';
import { QRCodeDisplay } from './QRCodeDisplay.tsx';

interface FraudSecurityCenterProps {
  rules: FraudRule[];
  alerts: FraudAlertEvent[];
  user: UserProfile;
  onToggleRule: (ruleId: string) => void;
  onUpdateThreshold: (ruleId: string, val: number) => void;
  onUpdate2FAThreshold: (val: number) => void;
  onResolveAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
}

export const FraudSecurityCenter: React.FC<FraudSecurityCenterProps> = ({
  rules,
  alerts,
  user,
  onToggleRule,
  onUpdateThreshold,
  onUpdate2FAThreshold,
  onResolveAlert,
  onDismissAlert,
}) => {
  const [totp, setTotp] = useState(getTotpCode(user.totpSecret));
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [activeAlertFilter, setActiveAlertFilter] = useState<'all' | 'unresolved'>('unresolved');

  // Rotate TOTP tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTotp(getTotpCode(user.totpSecret));
    }, 1000);
    return () => clearInterval(timer);
  }, [user.totpSecret]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(user.totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeAlertFilter === 'unresolved') return !a.resolved;
    return true;
  });

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Real-Time Fraud Defense Radar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Autonomous AI Fraud Engine: ACTIVE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Fraud Detection & Multi-Factor Security
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              PaySphere monitors payment velocity, anomalous geo-locations, biometric signatures, and high-value spikes to block unauthorized account takeovers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
              <div className="text-[11px] font-semibold uppercase text-slate-400">Threat Level</div>
              <div className={`text-base font-bold font-mono mt-1 ${unresolvedCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {unresolvedCount > 0 ? 'ELEVATED' : 'NOMINAL'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
              <div className="text-[11px] font-semibold uppercase text-slate-400">Active Rules</div>
              <div className="text-base font-bold font-mono text-white mt-1">
                {rules.filter((r) => r.enabled).length}/{rules.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Fraud Alerts Section */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Active Security Alerts</h3>
              <p className="text-xs text-slate-400">Interceptions and velocity challenges requiring review</p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveAlertFilter('unresolved')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeAlertFilter === 'unresolved'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unresolved ({unresolvedCount})
            </button>
            <button
              onClick={() => setActiveAlertFilter('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeAlertFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Events ({alerts.length})
            </button>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-slate-950 border border-slate-800/60">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-300">All alerts resolved</div>
            <div className="text-[11px] text-slate-500 mt-0.5">No pending suspicious payment events detected.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.resolved
                    ? 'bg-slate-950/60 border-slate-800 opacity-60'
                    : alert.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-900/60 text-slate-200'
                    : 'bg-amber-950/20 border-amber-900/60 text-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        alert.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                      }`}>
                        {alert.severity} Risk ({alert.riskScore}/100)
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white tracking-tight">{alert.title}</h4>
                    <p className="text-xs text-slate-400">{alert.description}</p>

                    {alert.triggers && alert.triggers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {alert.triggers.map((t, i) => (
                          <span key={i} className="text-[10px] font-mono text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {!alert.resolved && (
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => onResolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                      >
                        Verify & Clear
                      </button>
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Rules Engine Configuration & 2FA Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fraud Rules Engine Matrix (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Heuristic Rules Engine</h3>
              <p className="text-xs text-slate-400">Configure thresholds for automated risk interception</p>
            </div>
            <Sliders className="w-4 h-4 text-emerald-400" />
          </div>

          {/* 2FA Amount Threshold setting */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Global 2FA Transfer Threshold</span>
              <span className="font-mono font-bold text-emerald-400">${user.twoFactorThreshold.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Any peer payment equal to or greater than this value requires mandatory 6-digit TOTP authorization.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[50, 100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdate2FAThreshold(val)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors ${
                    user.twoFactorThreshold === val
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Rules list */}
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{rule.name}</span>
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
                      rule.severity === 'high' ? 'text-rose-400 bg-rose-950/60' : 'text-amber-400 bg-amber-950/60'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{rule.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Triggered {rule.detectedCount} times in last 30 days
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleRule(rule.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      rule.enabled ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                        rule.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Factor Authentication (TOTP) Management (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Two-Factor Authentication</h3>
              <p className="text-xs text-slate-400">TOTP Authenticator (RFC 6238)</p>
            </div>
            <KeyRound className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Live TOTP Display */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Active Security Code
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-widest text-emerald-400 tabular-nums">
              {totp.code.slice(0, 3)} {totp.code.slice(3)}
            </div>

            {/* Countdown bar */}
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden my-3">
              <div
                className="h-full bg-emerald-400 transition-all duration-1000 ease-linear"
                style={{ width: `${totp.percentageRemaining}%` }}
              />
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              Rotates in {totp.secondsRemaining}s · Compatible with Google Authenticator
            </div>
          </div>

          {/* Authenticator QR Setup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300">
              Pair New Authenticator Device
            </div>
            <div className="flex justify-center my-2">
              <QRCodeDisplay
                value={`otpauth://totp/PaySphere:${user.email}?secret=${user.totpSecret}&issuer=PaySphere`}
                size={140}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-slate-300 truncate max-w-[180px]">{user.totpSecret}</span>
              <button
                type="button"
                onClick={handleCopySecret}
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-sans font-semibold shrink-0"
              >
                {copiedSecret ? 'Copied!' : 'Copy Key'}
              </button>
            </div>
          </div>

          {/* Trusted Devices */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="font-semibold text-slate-300">Registered Devices</div>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-white font-medium">MacBook Pro (Chrome)</div>
                <div className="text-[10px] text-slate-500 font-mono">192.168.1.104 · San Francisco, CA</div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Active Now</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
