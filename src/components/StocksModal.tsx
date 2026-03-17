import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, Search, Plus, Activity, Clock } from 'lucide-react';

interface StocksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StocksModal({ isOpen, onClose }: StocksModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStock, setActiveStock] = useState<string>('AAPL');

  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '178.25', change: '+1.24', changePercent: '+0.70%', isUp: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: '332.58', change: '-2.15', changePercent: '-0.64%', isUp: false },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '136.80', change: '+0.45', changePercent: '+0.33%', isUp: true },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '131.27', change: '+1.80', changePercent: '+1.39%', isUp: true },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '245.34', change: '-4.56', changePercent: '-1.82%', isUp: false },
    { symbol: 'META', name: 'Meta Platforms', price: '300.21', change: '+3.45', changePercent: '+1.16%', isUp: true },
  ];

  const currentStock = stocks.find(s => s.symbol === activeStock) || stocks[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-5xl h-[85vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col md:flex-row relative bg-black"
            >
              {/* Sidebar */}
              <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#1c1c1e] shrink-0 ${activeStock ? 'hidden md:flex' : 'flex flex-1'}`}>
                <div className="p-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Stocks</h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors md:hidden">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="px-4 pb-4 border-b border-white/10">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-black/30 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
                  <div className="px-2 py-2 space-y-1">
                    {stocks.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => setActiveStock(stock.symbol)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                          activeStock === stock.symbol ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-white">{stock.symbol}</span>
                          <span className="text-xs text-white/50 truncate w-24 text-left">{stock.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-white">{stock.price}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${stock.isUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {stock.changePercent}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border-t border-white/10 flex justify-between items-center text-xs text-white/50">
                  <span>Business News provided by Yahoo</span>
                  <span>Updated Just Now</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className={`flex-1 flex flex-col relative bg-black overflow-y-auto custom-scrollbar ${!activeStock ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-md border-b border-white/10 md:border-none md:bg-transparent md:backdrop-blur-none">
                  <button onClick={() => setActiveStock('')} className="p-2 text-blue-500 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors md:hidden flex items-center gap-1">
                    <span className="text-sm font-medium">Back</span>
                  </button>
                  <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block ml-auto">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stock Details */}
                <div className="p-8 md:p-12 pt-20 pb-32">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-1">{currentStock.symbol}</h1>
                      <h2 className="text-xl text-white/50">{currentStock.name}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-light text-white mb-2">{currentStock.price}</div>
                      <div className={`text-xl font-medium flex items-center justify-end gap-2 ${currentStock.isUp ? 'text-green-400' : 'text-red-400'}`}>
                        {currentStock.isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {currentStock.change} ({currentStock.changePercent})
                      </div>
                    </div>
                  </div>

                  {/* Chart Area (Mock) */}
                  <div className="h-64 w-full relative mb-8">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path 
                        d={currentStock.isUp 
                          ? "M0,80 Q10,70 20,75 T40,60 T60,40 T80,30 T100,10" 
                          : "M0,20 Q10,30 20,25 T40,40 T60,60 T80,70 T100,90"
                        } 
                        fill="none" 
                        stroke={currentStock.isUp ? "#4ade80" : "#f87171"} 
                        strokeWidth="2" 
                        vectorEffect="non-scaling-stroke"
                      />
                      <path 
                        d={currentStock.isUp 
                          ? "M0,80 Q10,70 20,75 T40,60 T60,40 T80,30 T100,10 L100,100 L0,100 Z" 
                          : "M0,20 Q10,30 20,25 T40,40 T60,60 T80,70 T100,90 L100,100 L0,100 Z"
                        } 
                        fill={currentStock.isUp ? "url(#gradUp)" : "url(#gradDown)"} 
                        opacity="0.2"
                      />
                      <defs>
                        <linearGradient id="gradUp" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
                          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradDown" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f87171" stopOpacity="1" />
                          <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Time Range Selector */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 py-2 border-t border-white/10">
                      {['1D', '1W', '1M', '3M', '6M', '1Y', 'All'].map((range, i) => (
                        <button key={range} className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${i === 0 ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}>
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#1c1c1e] p-4 rounded-2xl">
                      <div className="text-white/50 text-xs mb-1">Open</div>
                      <div className="text-white font-medium">176.48</div>
                    </div>
                    <div className="bg-[#1c1c1e] p-4 rounded-2xl">
                      <div className="text-white/50 text-xs mb-1">High</div>
                      <div className="text-white font-medium">179.38</div>
                    </div>
                    <div className="bg-[#1c1c1e] p-4 rounded-2xl">
                      <div className="text-white/50 text-xs mb-1">Low</div>
                      <div className="text-white font-medium">176.17</div>
                    </div>
                    <div className="bg-[#1c1c1e] p-4 rounded-2xl">
                      <div className="text-white/50 text-xs mb-1">Vol</div>
                      <div className="text-white font-medium">58.43M</div>
                    </div>
                    <div className="bg-[#1c1c1e] p-4 rounded-2xl">
                      <div className="text-white/50 text-xs mb-1">P/E</div>
                      <div className="text-white font-medium">29.85</div>
                    </div>
                    <div className="bg-[#1c1c1e] p-4 rounded-2xl">
                      <div className="text-white/50 text-xs mb-1">Mkt Cap</div>
                      <div className="text-white font-medium">2.79T</div>
                    </div>
                    <div className="bg-[#1c1c1e] p-4 rounded-2xl">
                      <div className="text-white/50 text-xs mb-1">52W H</div>
                      <div className="text-white font-medium">198.23</div>
                    </div>
                    <div className="bg-[#1c1c1e] p-4 rounded-2xl">
                      <div className="text-white/50 text-xs mb-1">52W L</div>
                      <div className="text-white font-medium">124.17</div>
                    </div>
                  </div>

                  {/* News Section */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Business News</h3>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[#1c1c1e] p-4 rounded-2xl flex gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="flex-1">
                            <div className="text-white/50 text-xs mb-2 flex items-center gap-2">
                              <span>Bloomberg</span>
                              <span>•</span>
                              <span>2h ago</span>
                            </div>
                            <h4 className="text-white font-medium mb-2 leading-snug">Tech Stocks Rally as Investors Digest Latest Economic Data and Earnings Reports</h4>
                            <p className="text-white/60 text-sm line-clamp-2">Major technology companies saw significant gains in early trading following positive sentiment in the broader market...</p>
                          </div>
                          <div className="w-24 h-24 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                            <img src={`https://picsum.photos/seed/news${i}/200/200`} alt="News" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
