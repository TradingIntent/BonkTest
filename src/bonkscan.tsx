import React, { useState, useEffect, useRef } from 'react';
import { useTokens } from './App';
import { 
  Search, 
  Wallet, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  ExternalLink,
  Twitter,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Routes, Route, useNavigate } from 'react-router-dom';
import type { ChartOptions } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

interface TransactionProps {
  type: 'buy' | 'sell' | 'transfer';
  time: string;
  amount: string;
  from: string;
  to: string;
  signature: string;
}

interface LocalTransaction extends TransactionProps {
  mint: string;
  symbol: string;
}

const CARD_BG = '#101624';
const CARD_BORDER = '#232a3a';

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive }) => (
  <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:bg-gray-900/80 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 group">
    <div className="flex flex-col">
      <span className="text-gray-400 text-sm font-medium mb-1">{title}</span>
      <span className="text-white text-xl font-bold font-mono">{value}</span>
      {change && (
        <span className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </span>
      )}
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
  </div>
);

const BONK_MINT = 'DezX1PzKz7xnJ2B2K2uAHzb1xQ3VQh7Wi7QdBjc7h4uF';
const HELIUS_API_KEY = '7595b575-bcc9-4291-9a5d-8c41742a065f';
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// --- StatsHeader Component ---
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Animated, realistic stats state ---
const realisticInitialStats = {
  totalBlocks: 4567123,
  totalTx: 457,
  walletAddresses: 246,
  avgBlockTime: 3.0,
  dailyTx: 56,
  dailyTxHistory: [42, 51, 56, 48, 60, 54, 59, 62, 58, 56, 53, 57, 61, 55, 56, 54, 60, 62, 59, 56],
};

function useRealisticStats() {
  const [stats, setStats] = useState(realisticInitialStats);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    function updateStats() {
      setStats(prev => {
        // Blocks: up or down by 1-10, sometimes a burst
        const blockBurst = Math.random() < 0.15;
        const blockDelta = (Math.random() < 0.5 ? 1 : -1) * (blockBurst ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 3) + 1);
        const newBlocks = Math.max(0, prev.totalBlocks + blockDelta);
        // Transactions: only up, by 1-10, sometimes a burst
        const txBurst = Math.random() < 0.1;
        const txDelta = txBurst ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 3) + 1;
        const newTx = prev.totalTx + txDelta;
        // Wallet addresses: up or down by 1-3
        const walletDelta = (Math.random() < 0.6 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
        const newWallets = Math.max(0, prev.walletAddresses + walletDelta);
        // Avg block time: random float between 2.5 and 4.5
        const newBlockTime = Math.max(2.5, Math.min(4.5, prev.avgBlockTime + (Math.random() - 0.5) * 0.2));
        // Daily tx: only up, by 1-7
        const dailyTxDelta = Math.floor(Math.random() * 7) + 1;
        const newDaily = prev.dailyTx + dailyTxDelta;
        // Daily tx history: shift and add new value (always increasing)
        const newHistory = [...prev.dailyTxHistory.slice(1), newDaily];
        return {
          totalBlocks: newBlocks,
          totalTx: newTx,
          walletAddresses: newWallets,
          avgBlockTime: parseFloat(newBlockTime.toFixed(2)),
          dailyTx: newDaily,
          dailyTxHistory: newHistory,
        };
      });
      timeout = setTimeout(updateStats, Math.floor(Math.random() * 1200) + 800);
    }
    updateStats();
    return () => clearTimeout(timeout);
  }, []);
  return stats;
}

const StatsHeader: React.FC = () => {
  const stats = useRealisticStats();

  // Animated numbers for each stat
  const animatedBlocks = useAnimatedNumber(stats.totalBlocks);
  const animatedTx = useAnimatedNumber(stats.totalTx);
  const animatedWallets = useAnimatedNumber(stats.walletAddresses);
  const animatedBlockTime = useAnimatedNumber(stats.avgBlockTime, 400);
  const animatedDailyTx = useAnimatedNumber(stats.dailyTx);

  // Chart.js data
  const chartData = {
    labels: stats.dailyTxHistory.map((_: unknown, i: number) => i + 1),
    datasets: [
      {
        data: stats.dailyTxHistory,
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.08)',
        borderColor: '#3b82f6',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* 2x2 stat cards */}
        <div className="grid grid-cols-2 gap-6 col-span-2">
          <StatCard icon={<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#fff" strokeWidth="2"/><rect x="7" y="7" width="10" height="10" rx="2" stroke="#fbbf24" strokeWidth="2"/></svg>} label="Total blocks" value={animatedBlocks.toLocaleString()} />
          <StatCard icon={<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M17 17H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" stroke="#fff" strokeWidth="2"/><path d="M7 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="#fbbf24" strokeWidth="2"/></svg>} label="Total transactions" value={animatedTx.toLocaleString()} />
          <StatCard icon={<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" stroke="#fff" strokeWidth="2"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" stroke="#fbbf24" strokeWidth="2"/></svg>} label="Wallet addresses" value={animatedWallets.toLocaleString()} />
          <StatCard icon={<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#fbbf24" strokeWidth="2"/></svg>} label="Average block time" value={animatedBlockTime + 's'} />
        </div>
        {/* Chart */}
        <div className="rounded-xl p-6 flex flex-col justify-between shadow" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 font-semibold text-lg">Daily transactions <span className="align-super text-xs text-gray-500" title="Fake data, updates randomly">ⓘ</span></span>
            <span className="text-3xl font-bold text-white">{animatedDailyTx}</span>
          </div>
          <div className="h-24 w-full">
            <Line data={chartData} options={chartOptions} height={96} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="rounded-xl p-6 flex items-center gap-4 shadow" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
    <div className="flex-shrink-0 flex items-center justify-center" style={{ minWidth: 40, minHeight: 40 }}>
      {icon}
    </div>
    <div>
      <div className="text-gray-400 text-base font-normal mb-0.5" style={{ fontFamily: 'DM Sans, Inter, sans-serif' }}>{label}</div>
      <div className="text-3xl font-bold text-white -mt-1" style={{ fontFamily: 'DM Sans, Inter, sans-serif', letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  </div>
);
// --- End StatsHeader ---

// Helper to generate a random Solana address (44 chars, base58)
function randomSolAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let addr = '';
  for (let i = 0; i < 44; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
}

// --- Fake blocks data generator with full history and fade-in ---
function useFakeBlocksWithHistory(visibleCount: number = 5) {
  const [blocks, setBlocks] = useState(() => Array.from({ length: visibleCount }, (_, i) => ({
    number: 5524447 - i,
    createdAt: Date.now() - i * 4000,
    miner: randomSolAddress(),
    txn: Math.floor(Math.random() * 11),
    reward: (Math.random() * 2).toFixed(2),
    fadeIn: false,
  })));
  const [allBlocks, setAllBlocks] = useState(() => [...blocks]);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    function addBlock() {
      setBlocks(prev => {
        const newBlock = {
          number: prev[0].number + 1,
          createdAt: Date.now(),
          miner: randomSolAddress(),
          txn: Math.floor(Math.random() * 11),
          reward: (Math.random() * 2).toFixed(2),
          fadeIn: true,
        };
        const updated = [newBlock, ...prev].slice(0, visibleCount).map((b, i) => ({
          ...b,
          fadeIn: i === 0,
        }));
        setAllBlocks(all => [newBlock, ...all]);
        return updated;
      });
      timeout = setTimeout(addBlock, 2000);
    }
    timeout = setTimeout(addBlock, 2000);
    return () => clearTimeout(timeout);
  }, [visibleCount]);
  return { blocks, allBlocks };
}

// --- Animated number hook ---
function useAnimatedNumber(value: number, duration = 600) {
  const [display, setDisplay] = useState(value);
  const raf = useRef<number>();
  useEffect(() => {
    const start = display;
    const end = value;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + (end - start) * progress);
      setDisplay(current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    }
    animate(performance.now());
    return () => {
      if (raf.current !== undefined) {
        cancelAnimationFrame(raf.current);
      }
    };
    // eslint-disable-next-line
  }, [value]);
  return display;
}

// --- LatestBlocks component ---
const LatestBlocks: React.FC<{ onShowAllBlocks: () => void }> = ({ onShowAllBlocks }) => {
  const { blocks } = useFakeBlocksWithHistory(5);
  // Timer to force re-render every second for dynamic time ago
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  function getTimeAgo(createdAt: number) {
    const seconds = Math.floor((Date.now() - createdAt) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
  return (
    <div className="rounded-xl p-4 shadow mb-6" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-white">Latest blocks</span>
        <span className="text-xs text-gray-400">Network utilization: <span className="text-blue-400">0.00%</span></span>
      </div>
      <div className="space-y-3">
        {blocks.map((block, idx) => {
          const animatedNumber = useAnimatedNumber(block.number);
          return (
            <div key={block.number} className={`flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-transparent border border-blue-500/20 hover:bg-blue-500/5 transition-colors duration-200 ${block.fadeIn ? 'animate-fadeIn' : ''}`} style={{ animationDuration: '0.7s' }}>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-mono font-bold cursor-pointer hover:underline">{animatedNumber}</span>
                <span className="text-gray-500">{getTimeAgo(block.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Txn {block.txn}</span>
                <span>Reward {block.reward}</span>
                <span>Miner <span className="text-gray-300 font-mono">{block.miner}</span></span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-2 text-center">
        <a href="#" className="text-blue-400 text-xs hover:underline" onClick={e => { e.preventDefault(); onShowAllBlocks(); }}>View all blocks</a>
      </div>
    </div>
  );
};

// --- Sidebar component ---
const Sidebar: React.FC<{ onShowAllTransactions: () => void; onShowTokenTransfers: () => void; onShowChartAndStats: () => void }> = ({ onShowAllTransactions, onShowTokenTransfers, onShowChartAndStats }) => (
  <aside className="hidden md:flex flex-col items-center bg-[#101624] border-r border-[#232a3a] min-h-screen w-20 py-6 gap-6">
    {/* Logo */}
    <div className="mb-8">
      <img src="/bonk-logo.png" alt="BonkScan Logo" className="w-12 h-12 rounded-full border-2 border-orange-400 shadow" />
    </div>
    {/* Menu */}
    <nav className="flex flex-col gap-4 w-full items-center">
      <SidebarItem icon={<Activity size={24} />} label="Transactions" onClick={onShowAllTransactions} />
      <SidebarItem icon={<ArrowRightLeft size={24} />} label="Token transfers" onClick={onShowTokenTransfers} />
      <SidebarItem icon={<BarChart3 size={24} />} label="Chart & stats" onClick={onShowChartAndStats} />
    </nav>
  </aside>
);

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center w-full py-2 px-2 rounded-lg hover:bg-orange-400/10 transition group focus:outline-none">
    <span className="text-gray-300 group-hover:text-orange-400 mb-1">{icon}</span>
    <span className="text-xs text-gray-400 group-hover:text-orange-400 font-medium tracking-wide">{label}</span>
  </button>
);
// --- End Sidebar ---

// --- AllTransactionsPage component ---
const AllTransactionsPage: React.FC<{ transactions: any[]; newSignatures: string[]; onBack: () => void }> = ({ transactions, newSignatures, onBack }) => (
  <div className="flex flex-col w-full max-w-6xl mx-auto py-10 px-2">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={onBack} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700 hover:border-orange-500/30">
        ← Back to dashboard
      </button>
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Activity className="w-8 h-8 text-orange-500" />
        All Transactions
      </h1>
    </div>
    <div className="space-y-4">
      {transactions.map((transaction, index) => (
        <div
          key={transaction.signature}
          className={`transaction-row-animated ${newSignatures.includes(transaction.signature) ? 'transaction-pop' : ''}`}
        >
          <TransactionRow {...transaction} />
        </div>
      ))}
    </div>
  </div>
);
// --- End AllTransactionsPage ---

// --- TokenTransfersPage component ---
const mockTokenTransfers = Array.from({ length: 20 }, (_, i) => ({
  hash: randomSolAddress().slice(0, 16),
  method: ['Transfer', 'Mint', 'Burn'][Math.floor(Math.random() * 3)],
  block: 5524400 + i,
  from: randomSolAddress(),
  to: randomSolAddress(),
  tokenId: Math.floor(Math.random() * 10000),
  amount: (Math.random() * 1000).toFixed(2),
}));

const TokenTransfersPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-col w-full max-w-7xl mx-auto py-10 px-2">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={onBack} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700 hover:border-orange-500/30">
        ← Back to dashboard
      </button>
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <ArrowRightLeft className="w-8 h-8 text-orange-500" />
        Token Transfers
      </h1>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-[#101624] rounded-xl overflow-hidden text-left text-sm text-gray-300 shadow-lg">
        <thead className="sticky top-0 z-10 bg-[#101624]">
          <tr className="border-b border-[#232a3a]">
            <th className="px-4 py-3 font-semibold text-gray-200">Txn hash</th>
            <th className="px-4 py-3 font-semibold text-gray-200">Method</th>
            <th className="px-4 py-3 font-semibold text-gray-200">Block</th>
            <th className="px-4 py-3 font-semibold text-gray-200">From</th>
            <th className="px-4 py-3 font-semibold text-gray-200">To</th>
          </tr>
        </thead>
        <tbody>
          {mockTokenTransfers.map((tx, i) => (
            <tr key={i} className="border-b border-[#232a3a] hover:bg-[#181c2a] transition group">
              <td className="px-4 py-2 text-blue-400 font-mono cursor-pointer hover:underline">{tx.hash}</td>
              <td className="px-4 py-2 font-mono bg-[#181c2a] rounded text-xs">{tx.method}</td>
              <td className="px-4 py-2 font-mono">{tx.block}</td>
              <td className="px-4 py-2 text-blue-400 font-mono group-hover:underline cursor-pointer">{tx.from}</td>
              <td className="px-4 py-2 text-blue-400 font-mono group-hover:underline cursor-pointer">{tx.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
// --- End TokenTransfersPage ---

// --- ChartAndStatsPage component ---
const fakeStats = [
  { label: 'Average block time', value: '3s' },
  { label: 'Completed txns', value: '74,266K' },
  { label: 'Number of contracts today', value: '0' },
  { label: 'Total accounts', value: '125' },
  { label: 'Total addresses', value: '404' },
  { label: 'Total blocks', value: '5.525M' },
  { label: 'Total tokens', value: '20' },
  { label: 'Total txns', value: '74,301K' },
  { label: 'Total contracts', value: '21' },
  { label: 'Transactions (24h)', value: '47' },
  { label: 'Pending transactions (30m)', value: '0' },
  { label: 'Transaction fees (24h)', value: '0 BONK' },
  { label: 'Avg. transaction fee (24h)', value: '0 BONK' },
  { label: 'Total verified contracts', value: '0' },
  { label: 'Number of verified contracts today', value: '0' },
  { label: 'Total volume (24h)', value: '1.2M BONK' },
  { label: 'Largest holder', value: '0xA1B2...C3D4' },
  { label: 'Top token', value: 'BONK' },
  { label: 'Active wallets (24h)', value: '1,234' },
  { label: 'New tokens (24h)', value: '7' },
];

// Animated/interactive chart data
const chartConfigs = [
  {
    title: 'Number of accounts',
    data: Array.from({ length: 30 }, (_, i) => 100 + i * 2 + Math.round(Math.random() * 10)),
    color: '#fbbf24',
  },
  {
    title: 'Active accounts',
    data: Array.from({ length: 30 }, () => Math.round(Math.random() * 10)),
    color: '#3b82f6',
  },
  {
    title: 'New accounts',
    data: Array.from({ length: 30 }, () => Math.random() * 2 + 1),
    color: '#f472b6',
  },
  {
    title: 'Token volume (24h)',
    data: Array.from({ length: 30 }, () => Math.round(Math.random() * 100000) + 50000),
    color: '#34d399',
    isBonk: true,
  },
  {
    title: 'Transaction fees (BONK)',
    data: Array.from({ length: 30 }, () => Math.random() * 1000 + 500),
    color: '#f87171',
    isBonk: true,
  },
];

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function(context: import('chart.js').TooltipItem<'line'>) {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          label += context.parsed.y;
          if ((context.dataset as any).isBonk) label += ' BONK';
          return label;
        },
      },
      backgroundColor: '#232a3a',
      titleColor: '#fff',
      bodyColor: '#fbbf24',
      borderColor: '#fbbf24',
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: false,
    },
  },
  scales: {
    x: {
      display: false,
      grid: { display: false },
    },
    y: {
      display: false,
      grid: { display: false },
    },
  },
  elements: {
    line: { tension: 0.4, borderWidth: 3 },
    point: { radius: 0, hoverRadius: 5 },
  },
  animation: {
    duration: 1200,
    easing: 'easeInOutCubic',
  },
};

const ChartAndStatsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-col w-full max-w-7xl mx-auto py-12 px-4 sm:px-8">
    <div className="flex items-center gap-4 mb-10">
      <button onClick={onBack} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700 hover:border-orange-500/30">
        ← Back to dashboard
      </button>
      <h1 className="text-4xl font-bold text-white flex items-center gap-3 tracking-tight">
        <BarChart3 className="w-10 h-10 text-orange-500" />
        Chart & stats
      </h1>
    </div>
    {/* Stats Section */}
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-bonk-orange mb-6 tracking-wide">Network & Token Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {fakeStats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-8 flex flex-col gap-3 shadow bg-[#181c24] border border-[#232a3a] min-h-[110px]">
            <div className="text-gray-400 text-base font-normal mb-0.5">{stat.label}</div>
            <div className="text-3xl font-extrabold text-white -mt-1 tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
    {/* Charts Section */}
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-bonk-orange mb-6 tracking-wide">Activity & Growth Charts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {chartConfigs.map((chart, i) => {
          const labels = Array.from({ length: chart.data.length }, (_, idx) => `Day ${idx + 1}`);
          const data = {
            labels,
            datasets: [
              {
                label: chart.title,
                data: chart.data,
                borderColor: chart.color,
                backgroundColor: chart.color + '33',
                fill: true,
                isBonk: chart.isBonk,
              },
            ],
          };
          return (
            <div key={i} className="rounded-2xl p-8 shadow bg-[#181c24] border border-[#232a3a] flex flex-col min-h-[320px]">
              <div className="text-gray-300 font-semibold text-lg mb-4">{chart.title}</div>
              <div className="flex-1 flex items-end">
                <Line data={data} options={chartOptions} height={120} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
    {/* Search/filter bar (fake) */}
    <div className="flex flex-col md:flex-row items-center gap-4 mb-8 mt-8">
      <select className="bg-[#101624] border border-[#232a3a] text-gray-300 rounded-lg px-3 py-2 w-full md:w-auto">
        <option>All stats</option>
      </select>
      <div className="flex gap-2 w-full md:w-auto">
        <button className="px-3 py-1 rounded bg-[#232a3a] text-gray-300 font-medium w-full md:w-auto">All time</button>
        <button className="px-3 py-1 rounded bg-[#232a3a] text-gray-300 font-medium w-full md:w-auto">1M</button>
        <button className="px-3 py-1 rounded bg-[#232a3a] text-gray-300 font-medium w-full md:w-auto">3M</button>
        <button className="px-3 py-1 rounded bg-[#232a3a] text-gray-300 font-medium w-full md:w-auto">6M</button>
        <button className="px-3 py-1 rounded bg-[#232a3a] text-gray-300 font-medium w-full md:w-auto">1Y</button>
      </div>
      <input className="flex-1 bg-[#101624] border border-[#232a3a] text-gray-300 rounded-lg px-3 py-2 min-w-[200px]" placeholder="Find chart, metric..." />
    </div>
  </div>
);

function App() {
  const { tokens } = useTokens();

  const metrics = [
    { title: 'Market Cap', value: '$1.22B', change: '+1.12%', isPositive: true },
    { title: 'Price', value: '$0.041', change: '+0.47%', isPositive: true },
    { title: 'Liquidity', value: '$39.7K', change: '-0.88%', isPositive: false },
    { title: 'Supply', value: '88.8T' },
    { title: 'Holders', value: '945,730', change: '-0.64%', isPositive: false },
  ];

  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [newSignatures, setNewSignatures] = useState<string[]>([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showTokenTransfers, setShowTokenTransfers] = useState(false);
  const [showChartAndStats, setShowChartAndStats] = useState(false);

  useEffect(() => {
    if (!tokens.length) return;
    let timeout: NodeJS.Timeout;
    function addTransactions() {
      setTransactions(prev => {
        const burst = Math.random() < 0.35; // 35% chance for a burst
        const count = burst ? Math.floor(Math.random() * 6) + 3 : 1; // 3-8 or 1
        const newTxs: LocalTransaction[] = Array.from({ length: count })
          .map(() => {
            const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
            if (!randomToken) return null;
            const type = Math.random() > 0.5 ? 'buy' : 'sell';
            const solAmount = (Math.random() * 9.8 + 0.2).toFixed(2); // 0.2 - 10 SOL
            const price = randomToken.price || 0.00002;
            const bonkAmount = price ? (Number(solAmount) / price) : 0;
            const amountStr = bonkAmount > 1_000_000 ? (bonkAmount / 1_000_000).toFixed(2) + 'M ' + randomToken.symbol : bonkAmount.toFixed(0) + ' ' + randomToken.symbol;
            const from = randomWallet();
            const to = randomWallet();
            return {
              type,
              time: 'just now',
              amount: amountStr,
              from,
              to,
              signature: Math.random().toString(36).slice(2, 10),
              mint: randomToken.mint,
              symbol: randomToken.symbol,
            };
          })
          .filter((tx): tx is LocalTransaction => !!tx);
        // Track new signatures for pop animation
        setNewSignatures(newTxs.map(tx => tx.signature));
        return [
          ...newTxs,
          ...prev.slice(0, 20 - newTxs.length),
        ];
      });
      // Next interval: random between 200ms and 1200ms
      const next = Math.floor(Math.random() * 1000) + 200;
      timeout = setTimeout(addTransactions, next);
    }
    addTransactions();
    return () => clearTimeout(timeout);
  }, [tokens]);

  // Clear newSignatures after animation
  useEffect(() => {
    if (newSignatures.length === 0) return;
    const timeout = setTimeout(() => setNewSignatures([]), 500);
    return () => clearTimeout(timeout);
  }, [newSignatures]);

  function randomWallet() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    return (
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') +
      '...' +
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    );
  }

  function getRelativeTime(dateValue: number): string {
    const now = Date.now();
    const diff = Math.max(0, now - dateValue);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function formatBonkAmount(amount: number): string {
    if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(2) + 'B BONK';
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + 'M BONK';
    if (amount >= 1_000) return (amount / 1_000).toFixed(2) + 'K BONK';
    return amount + ' BONK';
  }

  function shorten(addr: string) {
    if (!addr) return '';
    return addr.slice(0, 3) + '...' + addr.slice(-3);
  }

  const stats = useRealisticStats();

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <Sidebar onShowAllTransactions={() => { setShowAllTransactions(true); setShowTokenTransfers(false); setShowChartAndStats(false); }} onShowTokenTransfers={() => { setShowTokenTransfers(true); setShowAllTransactions(false); setShowChartAndStats(false); }} onShowChartAndStats={() => { setShowChartAndStats(true); setShowAllTransactions(false); setShowTokenTransfers(false); }} />
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {showAllTransactions ? (
          <AllTransactionsPage transactions={transactions} newSignatures={newSignatures} onBack={() => setShowAllTransactions(false)} />
        ) : showTokenTransfers ? (
          <TokenTransfersPage onBack={() => setShowTokenTransfers(false)} />
        ) : showChartAndStats ? (
          <ChartAndStatsPage onBack={() => setShowChartAndStats(false)} />
        ) : (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
              <DashboardStatsRow stats={stats} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <LatestBlocksDashboard onShowAllBlocks={() => { setShowTokenTransfers(true); setShowAllTransactions(false); setShowChartAndStats(false); }} />
                <LatestTransactionsDashboard transactions={transactions} newSignatures={newSignatures} onShowAllTransactions={() => { setShowAllTransactions(true); setShowTokenTransfers(false); setShowChartAndStats(false); }} />
              </div>
            </div>
          </>
        )}
        {/* Footer */}
        <footer className="mt-16 border-t border-gray-800 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-400 text-sm">BonkScan - Solana Blockchain Explorer</span>
              </div>
              <div className="text-gray-500 text-sm">
                Built with ❤️ for the BONK community
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

const TransactionRow: React.FC<LocalTransaction> = ({ type, time, amount, from, to, signature, mint, symbol }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'buy':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'sell':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'transfer':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'buy':
        return <ArrowUpRight size={16} />;
      case 'sell':
        return <ArrowDownRight size={16} />;
      case 'transfer':
        return <ArrowRightLeft size={16} />;
    }
  };

  const getRowBg = () => {
    switch (type) {
      case 'buy':
        return 'hover:bg-green-500/5 border-green-500/10';
      case 'sell':
        return 'hover:bg-red-500/5 border-red-500/10';
      case 'transfer':
        return 'hover:bg-blue-500/5 border-blue-500/10';
    }
  };

  return (
    <div className={`bg-gray-900/40 border border-gray-800 rounded-lg p-4 transition-all duration-200 ${getRowBg()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getTypeStyles()}`}>
            {getTypeIcon()}
            <span className="text-sm font-medium capitalize">{type}</span>
          </div>
          <span className="text-gray-400 text-sm font-mono">{time}</span>
          {symbol && (
            <span className="text-bonk-orange text-xs font-mono font-bold">${symbol}</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-white font-mono font-bold">{amount}</span>
          <a
            href={`https://birdeye.so/token/${mint || BONK_MINT}?chain=solana`}
            target="_blank"
            rel="noopener noreferrer"
            title="View on Birdeye"
            className="pointer-events-auto z-10"
            tabIndex={0}
          >
            <ExternalLink size={16} className="text-gray-400 hover:text-orange-400 transition-colors" />
          </a>
        </div>
      </div>
      <div className="mt-3 flex items-center space-x-2 text-sm">
        <span className="text-gray-400">From:</span>
        <span className="text-gray-300 font-mono">{from}</span>
      </div>
    </div>
  );
};

const DashboardStatsRow: React.FC<{ stats: {
  totalBlocks: number;
  totalTx: number;
  walletAddresses: number;
  avgBlockTime: number;
  dailyTx: number;
  dailyTxHistory: number[];
} }> = ({ stats }) => {
  const animatedBlocks = useAnimatedNumber(stats.totalBlocks);
  const animatedTx = useAnimatedNumber(stats.totalTx);
  const animatedWallets = useAnimatedNumber(stats.walletAddresses);
  const animatedBlockTime = useAnimatedNumber(stats.avgBlockTime, 400);
  const animatedDailyTx = useAnimatedNumber(stats.dailyTx);
  // Chart.js data for daily tx
  const chartData = {
    labels: stats.dailyTxHistory.map((_: unknown, i: number) => i + 1),
    datasets: [
      {
        data: stats.dailyTxHistory,
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.08)',
        borderColor: '#3b82f6',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="rounded-xl p-6 flex items-center gap-4 shadow bg-[#181c24] border border-[#232a3a] h-full min-h-[120px]">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#fff" strokeWidth="2"/><rect x="7" y="7" width="10" height="10" rx="2" stroke="#fbbf24" strokeWidth="2"/></svg>
        <div>
          <div className="text-gray-400 text-base font-normal mb-0.5">Total blocks</div>
          <div className="text-2xl font-bold text-white -mt-1">{animatedBlocks.toLocaleString()}</div>
        </div>
      </div>
      <div className="rounded-xl p-6 flex items-center gap-4 shadow bg-[#181c24] border border-[#232a3a] h-full min-h-[120px]">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M17 17H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" stroke="#fff" strokeWidth="2"/><path d="M7 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" stroke="#fbbf24" strokeWidth="2"/></svg>
        <div>
          <div className="text-gray-400 text-base font-normal mb-0.5">Total transactions</div>
          <div className="text-2xl font-bold text-white -mt-1">{animatedTx.toLocaleString()}</div>
        </div>
      </div>
      <div className="rounded-xl p-6 flex items-center gap-4 shadow bg-[#181c24] border border-[#232a3a] h-full min-h-[120px]">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" stroke="#fff" strokeWidth="2"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" stroke="#fbbf24" strokeWidth="2"/></svg>
        <div>
          <div className="text-gray-400 text-base font-normal mb-0.5">Wallet addresses</div>
          <div className="text-2xl font-bold text-white -mt-1">{animatedWallets.toLocaleString()}</div>
        </div>
      </div>
      <div className="rounded-xl p-6 flex flex-col justify-between shadow bg-[#181c24] border border-[#232a3a] h-full min-h-[120px]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400 text-base font-normal">Daily transactions</div>
          <div className="text-2xl font-bold text-white">{animatedDailyTx}</div>
        </div>
        <div className="h-12 w-full flex items-end">
          <Line data={chartData} options={chartOptions} height={48} />
        </div>
        <div className="mt-2 text-gray-400 text-xs">Average block time: <span className="text-white font-bold">{animatedBlockTime}s</span></div>
      </div>
    </div>
  );
};

// --- LatestBlocksDashboard ---
const LatestBlocksDashboard: React.FC<{ onShowAllBlocks: () => void }> = ({ onShowAllBlocks }) => {
  // Show 7 blocks to fill the section visually
  const { blocks } = useFakeBlocksWithHistory(7);
  // Timer to force re-render every second for dynamic time ago
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  function getTimeAgo(createdAt: number) {
    const seconds = Math.floor((Date.now() - createdAt) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
  return (
    <div className="bg-[#181c24] border border-[#232a3a] rounded-xl p-4 flex flex-col h-full min-w-[260px]">
      <div className="text-lg font-bold text-white mb-2">Latest blocks</div>
      <div className="text-xs text-gray-400 mb-3">Network utilization: <span className="text-blue-400">0.00%</span></div>
      <div className="flex-1 flex flex-col gap-3">
        {blocks.map((block, idx) => (
          <div key={block.number} className={`rounded-lg px-3 py-2 bg-[#101624] border border-[#232a3a] flex flex-col gap-1 ${block.fadeIn ? 'transaction-pop' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-mono font-bold text-base">{block.number}</span>
              <span className="text-gray-400 text-xs">{getTimeAgo(block.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Txn {block.txn}</span>
              <span>Reward {block.reward}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Miner</span>
              <span className="text-gray-300 font-mono truncate max-w-[120px]">{block.miner.slice(0, 6)}...{block.miner.slice(-4)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-3 text-center">
        <a href="#" className="text-blue-400 text-xs hover:underline" onClick={e => { e.preventDefault(); onShowAllBlocks(); }}>View all blocks</a>
      </div>
    </div>
  );
};

// --- LatestTransactionsDashboard ---
const LatestTransactionsDashboard: React.FC<{ onShowAllTransactions: () => void, transactions: LocalTransaction[], newSignatures: string[] }> = ({ onShowAllTransactions, transactions, newSignatures }) => {
  return (
    <div className="bg-[#181c24] border border-[#232a3a] rounded-xl p-4 flex flex-col h-full min-w-[340px]">
      <div className="text-lg font-bold text-white mb-2">Latest transactions</div>
      <div className="flex items-center gap-2 bg-[#232a3a] text-xs px-3 py-2 rounded mb-3">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
        <span className="text-green-400 font-semibold">Live</span>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {transactions.slice(0, 6).map((tx) => (
          <div
            key={tx.signature}
            className={`transaction-row-animated ${newSignatures.includes(tx.signature) ? 'transaction-pop' : ''}`}
          >
            <TransactionRow {...tx} />
          </div>
        ))}
      </div>
      <div className="pt-3 text-center">
        <a href="#" className="text-blue-400 text-xs hover:underline" onClick={e => { e.preventDefault(); onShowAllTransactions(); }}>View all transactions</a>
      </div>
    </div>
  );
};

export default App;