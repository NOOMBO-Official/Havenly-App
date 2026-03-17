import { useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, X, Bitcoin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function FinanceWidget() {
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=3&page=1&sparkline=false');
        if (res.ok) {
          const data = await res.json();
          setCryptoData(data);
        }
      } catch (e) {
        console.error('Failed to fetch crypto data', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCrypto();
    const interval = setInterval(fetchCrypto, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const btc = cryptoData.find(c => c.id === 'bitcoin');
  const balance = btc?.current_price || 0;
  const monthlyChange = btc?.price_change_percentage_24h || 0;
  const isPositive = monthlyChange >= 0;

  return (
    <>
      <motion.div 
        layoutId="finance-widget"
        className="apple-glass-heavy rounded-[32px] p-6 flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        {/* Quick Action Overlay */}
        {settings.tapToExpand && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">
            <span className="text-white font-semibold text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
              Tap to Expand
            </span>
          </div>
        )}

        <div className="flex justify-between items-start relative z-10 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-aura-muted flex items-center gap-2">
            <Bitcoin className="w-3 h-3 text-emerald-400" />
            Crypto Markets
          </span>
          <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(monthlyChange).toFixed(2)}%
          </div>
        </div>

        <div className="flex-1 relative z-10 flex flex-col justify-center">
          <div className="text-sm font-medium text-aura-muted mb-1">Bitcoin Price</div>
          <div className="text-4xl font-semibold text-aura-text tracking-tight mb-6">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-sm font-medium text-aura-muted">Loading markets...</div>
            ) : (
              cryptoData.filter(c => c.id !== 'bitcoin').map(coin => (
                <div key={coin.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-aura-muted">
                    <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 uppercase font-mono font-semibold text-[10px]">
                      {coin.symbol}
                    </div>
                    <span className="font-medium">{coin.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-aura-text">${coin.current_price.toLocaleString()}</span>
                    <span className={`font-semibold text-[10px] ${coin.price_change_percentage_24h > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700 mix-blend-screen" />
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              layoutId="finance-widget"
              className="w-full max-w-4xl h-full max-h-[700px] rounded-[32px] apple-glass-heavy relative overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                    <Bitcoin className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-aura-text tracking-tight">Finance Overview</h2>
                    <p className="text-sm font-medium text-aura-muted">Track your spending and subscriptions</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-aura-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Main Balance & Chart Area */}
                <div className="w-full md:w-1/2 border-r border-black/5 dark:border-white/10 p-6 md:p-8 flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 mb-8">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-aura-muted mb-2">Bitcoin Price</h3>
                    <div className="text-5xl md:text-6xl font-semibold text-aura-text tracking-tighter mb-2">
                      ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`flex items-center gap-1.5 text-sm font-semibold ${isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {Math.abs(monthlyChange).toFixed(2)}% from last 24h
                    </div>
                  </div>

                  {/* Simulated Spending Flow Animation */}
                  <div className="flex-1 flex flex-col justify-end relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-20">
                      {/* Placeholder for a real chart, using CSS shapes to simulate a flow */}
                      <svg viewBox="0 0 100 50" className="w-full h-full preserve-3d" style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }}>
                        <path d="M0,50 Q25,20 50,40 T100,10 L100,50 Z" fill="url(#grad1)" />
                        <path d="M0,50 Q25,20 50,40 T100,10" fill="none" stroke="#10b981" strokeWidth="2" />
                        <defs>
                          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.5 }} />
                            <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Transactions & Subscriptions */}
                <div className="w-full md:w-1/2 flex flex-col bg-black/[0.02] dark:bg-white/[0.02]">
                  <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/10 flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="text-lg font-semibold text-aura-text mb-4 tracking-tight">Top Cryptocurrencies</h3>
                    <div className="space-y-3">
                      {loading ? (
                        <div className="text-sm font-medium text-aura-muted">Loading data...</div>
                      ) : (
                        cryptoData.map(coin => (
                          <div key={coin.id} className="flex items-center justify-between p-4 rounded-[20px] bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 hover:border-emerald-500/30 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-aura-muted uppercase font-mono font-semibold text-xs">
                                {coin.symbol}
                              </div>
                              <div>
                                <div className="font-semibold text-aura-text">{coin.name}</div>
                                <div className="text-xs font-medium text-aura-muted">Market Cap: ${(coin.current_price * 1000000).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-aura-text">${coin.current_price.toLocaleString()}</div>
                              <div className={`text-xs font-semibold ${coin.price_change_percentage_24h > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
