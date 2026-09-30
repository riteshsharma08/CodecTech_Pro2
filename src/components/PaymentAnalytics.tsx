import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  ShieldCheck, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Transaction, WalletBalances, PeerContact } from '../types/wallet.ts';

interface PaymentAnalyticsProps {
  transactions: Transaction[];
  balances: WalletBalances;
  peers: PeerContact[];
}

export const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({
  transactions,
  balances,
  peers,
}) => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'all'>('30d');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Category breakdown calculation
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    let totalOutflow = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'send' || tx.type === 'withdraw') {
        totalOutflow += tx.amount;
        const current = map.get(tx.category) || { total: 0, count: 0 };
        map.set(tx.category, {
          total: current.total + tx.amount,
          count: current.count + 1,
        });
      }
    });

    const entries = Array.from(map.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalOutflow > 0 ? (data.total / totalOutflow) * 100 : 0,
    }));

    // Sort by largest spend
    entries.sort((a, b) => b.total - a.total);
    return { list: entries, totalOutflow };
  }, [transactions]);

  // Peer payment volume analysis
  const peerVolume = useMemo(() => {
    const map = new Map<string, { name: string; tag: string; sent: number; received: number; avatarUrl?: string }>();

    transactions.forEach((tx) => {
      if (tx.type === 'send') {
        const id = tx.recipient.id;
        const current = map.get(id) || {
          name: tx.recipient.name,
          tag: tx.recipient.tag,
          sent: 0,
          received: 0,
          avatarUrl: tx.recipient.avatarUrl,
        };
        current.sent += tx.amount;
        map.set(id, current);
      } else if (tx.type === 'receive') {
        const id = tx.sender.id;
        const current = map.get(id) || {
          name: tx.sender.name,
          tag: tx.sender.tag,
          sent: 0,
          received: 0,
          avatarUrl: tx.sender.avatarUrl,
        };
        current.received += tx.amount;
        map.set(id, current);
      }
    });

    return Array.from(map.values())
      .filter((p) => p.name !== 'Wallet Top-Up' && !p.name.includes('Chase') && !p.name.includes('Bank of America'))
      .sort((a, b) => (b.sent + b.received) - (a.sent + a.received));
  }, [transactions]);

  // Monthly Bar Chart data
  const monthlyFlow = [
    { month: 'Apr', in: 4200, out: 1800 },
    { month: 'May', in: 5100, out: 2400 },
    { month: 'Jun', in: 4800, out: 3100 },
    { month: 'Jul', in: 6200, out: 2900 },
    { month: 'Aug', in: 5800, out: 2300 },
    { month: 'Sep', in: 6420, out: 2185 },
  ];

  const maxVal = 7000;

  return (
    <div className="space-y-6">
      
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payment Analytics & Intelligence</h2>
          <p className="text-xs text-slate-400">
            Real-time breakdown of cash flow velocity, peer volume, and category expenditures
          </p>
        </div>

        {/* Time range picker */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
          {(['30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase transition-all ${
                timeRange === r
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Gross Inflow</span>
            <div className="w-6 h-6 rounded-md bg-emerald-950/80 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
            +${balances.monthlyInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">+18.4%</span> vs prior 30 days
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Gross Outflow</span>
            <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
            -${balances.monthlyOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-slate-300 font-semibold">-5.2%</span> vs prior 30 days
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Net Cash Retained</span>
            <div className="w-6 h-6 rounded-md bg-teal-950/80 flex items-center justify-center text-teal-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
            +${(balances.monthlyInflow - balances.monthlyOutflow).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <span>66.0% Retention Ratio</span>
          </div>
        </div>

      </div>

      {/* Monthly Cash Flow Interactive Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Monthly Inflow vs Outflow Velocity</h3>
            <p className="text-xs text-slate-400">P2P, Gateway Top-ups, and Payout settlements (USD)</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Inbound Funds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-slate-300">Outbound Spend</span>
            </div>
          </div>
        </div>

        {/* SVG Bar Chart with Tooltips */}
        <div className="h-56 w-full flex items-end justify-between gap-3 pt-4 pb-2 px-2 border-b border-slate-800">
          {monthlyFlow.map((item, idx) => {
            const inHeight = (item.in / maxVal) * 100;
            const outHeight = (item.out / maxVal) * 100;
            const isHovered = hoveredBarIndex === idx;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredBarIndex(idx)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-14 z-20 p-2 rounded-lg bg-slate-950 border border-slate-700 shadow-xl text-[11px] whitespace-nowrap text-center animate-in fade-in">
                    <div className="font-bold text-white">{item.month} 2026</div>
                    <div className="font-mono text-emerald-400">In: +${item.in.toLocaleString()}</div>
                    <div className="font-mono text-slate-300">Out: -${item.out.toLocaleString()}</div>
                  </div>
                )}

                {/* Bars */}
                <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-full">
                  {/* Inflow bar */}
                  <div
                    className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${inHeight}%` }}
                  />
                  {/* Outflow bar */}
                  <div
                    className="w-1/2 bg-slate-700 rounded-t-sm transition-all duration-300 group-hover:bg-slate-600"
                    style={{ height: `${outHeight}%` }}
                  />
                </div>

                <span className="mt-2 text-xs font-semibold text-slate-400 group-hover:text-white">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Category Outflow & Top Peer Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Spending by Category (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Spending by Category</h3>
              <p className="text-xs text-slate-400">Total Outflow: ${categoryStats.totalOutflow.toFixed(2)}</p>
            </div>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-4">
            {categoryStats.list.map((cat, idx) => {
              const barColors = [
                'bg-emerald-400',
                'bg-cyan-400',
                'bg-teal-400',
                'bg-indigo-400',
                'bg-amber-400',
                'bg-rose-400',
                'bg-purple-400',
              ];
              const color = barColors[idx % barColors.length];

              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{cat.count} tx</span>
                      <span className="font-mono font-bold text-white tabular-nums">${cat.total.toFixed(2)}</span>
                      <span className="font-mono text-slate-400 w-12 text-right">{cat.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peer Network Volume (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Peer Transfer Exchange</h3>
              <p className="text-xs text-slate-400">Top contacts by total transactional volume</p>
            </div>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="divide-y divide-slate-800/80">
            {peerVolume.slice(0, 5).map((p) => {
              const netExchange = p.received - p.sent;
              return (
                <div key={p.tag} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                        {p.name[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{p.name}</div>
                      <div className="text-[10px] font-mono text-emerald-400 truncate">{p.tag}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-white tabular-nums">
                      ${(p.sent + p.received).toFixed(2)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Sent: ${p.sent.toFixed(0)} · Recv: ${p.received.toFixed(0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
