import { Newspaper, ExternalLink, Loader2, X, TrendingUp, Globe, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";

interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
  image?: string;
  summary?: string;
}

export default function NewsWidget() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Technology");

  const categories = ["Technology", "Business", "Science", "Top Stories", "Entertainment"];

  const fetchNews = async (category: string) => {
    setLoading(true);
    try {
      let url = "https://saurav.tech/NewsAPI/top-headlines/category/general/us.json";
      if (category !== "Top Stories") {
        url = `https://saurav.tech/NewsAPI/top-headlines/category/${category.toLowerCase()}/us.json`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.articles) {
        const formattedArticles: Article[] = data.articles.map((a: any) => ({
          title: a.title,
          url: a.url,
          source: a.source?.name || "Unknown Source",
          publishedAt: a.publishedAt,
          category: category,
          summary: a.description || "No summary available.",
          image: a.urlToImage
        }));
        setArticles(formattedArticles);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
      // Fallback if API is down
      setArticles([
        {
          title: "Unable to load live news feed",
          url: "#",
          source: "System",
          publishedAt: new Date().toISOString(),
          category: activeCategory,
          summary: "Please check your internet connection or try again later.",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  return (
    <>
      <motion.div 
        layoutId="news-widget"
        className="flex flex-col p-6 rounded-[32px] border border-black/5 dark:border-white/10 apple-glass-heavy h-full relative overflow-hidden group cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        {/* Quick Action Overlay */}
        {settings.tapToExpand && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">
            <span className="text-white font-semibold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
              Tap to Expand
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-5 h-5 text-aura-muted" />
            <span className="text-xs font-semibold uppercase tracking-widest text-aura-muted">
              Top News
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <Loader2 className="w-6 h-6 animate-spin text-aura-muted" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-10">
            {articles.slice(0, 3).map((article, i) => (
              <div 
                key={i} 
                className="group/item block p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <h4 className="text-sm font-semibold text-aura-text group-hover/item:text-blue-500 transition-colors line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <div className="flex items-center justify-between text-xs font-medium text-aura-muted">
                  <span>{article.source}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              layoutId="news-widget"
              className="w-full max-w-5xl h-full max-h-[800px] rounded-[40px] border border-black/5 dark:border-white/10 apple-glass-heavy relative overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                    <Newspaper className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-aura-text">News Reader</h2>
                    <p className="font-medium text-aura-muted">Stay updated with the latest headlines</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-aura-text transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar Categories */}
                <div className="w-full md:w-64 border-r border-black/5 dark:border-white/10 p-6 flex flex-col gap-2 bg-black/5 dark:bg-white/5 overflow-y-auto">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-aura-muted mb-4 px-4">Categories</h3>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-left font-semibold ${
                        activeCategory === category
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm'
                          : 'text-aura-muted hover:bg-black/10 dark:hover:bg-white/10 hover:text-aura-text border border-transparent'
                      }`}
                    >
                      {category === "Top Stories" ? <Globe className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                      <span>{category}</span>
                    </button>
                  ))}
                  
                  <div className="mt-auto pt-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-black/5 dark:border-white/10">
                      <div className="flex items-center gap-2 text-blue-500 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-widest">Trending</span>
                      </div>
                      <p className="text-sm text-aura-text font-semibold">AI regulations discussed at global summit</p>
                    </div>
                  </div>
                </div>

                {/* Main News Feed */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none h-64" />
                  
                  <div className="relative z-10 max-w-3xl mx-auto">
                    <h3 className="text-2xl font-semibold tracking-tight text-aura-text mb-8">{activeCategory}</h3>
                    
                    {loading ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {articles.map((article, i) => (
                          <a 
                            key={i} 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex flex-col md:flex-row gap-6 p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all hover:shadow-sm"
                          >
                            {article.image && (
                              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                                <img 
                                  src={article.image} 
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            <div className="flex-1 flex flex-col">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-black/10 dark:bg-white/10 text-aura-muted">
                                  {article.category}
                                </span>
                                <span className="text-xs text-aura-muted/50">•</span>
                                <span className="text-xs font-medium text-aura-muted">{article.source}</span>
                              </div>
                              <h4 className="text-xl font-semibold text-aura-text group-hover:text-blue-500 transition-colors mb-2">
                                {article.title}
                              </h4>
                              <p className="text-sm font-medium text-aura-muted line-clamp-2 mb-4">
                                {article.summary}
                              </p>
                              <div className="mt-auto flex items-center text-xs text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                Read full article <ExternalLink className="w-3 h-3 ml-1" />
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
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
