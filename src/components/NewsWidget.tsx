import { Newspaper, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export default function NewsWidget() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking news fetch for now, since we don't have a free news API key
    // In a real app, you'd call an API like NewsAPI or GNews
    const mockNews = [
      {
        title: "SpaceX successfully launches new satellite constellation",
        url: "#",
        source: "TechCrunch",
        publishedAt: new Date().toISOString()
      },
      {
        title: "Global markets rally amid positive economic data",
        url: "#",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        title: "New AI model breaks records in reasoning benchmarks",
        url: "#",
        source: "Wired",
        publishedAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    
    setTimeout(() => {
      setArticles(mockNews);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-5 h-5 text-aura-muted" />
          <span className="text-sm font-medium uppercase tracking-widest text-aura-muted">
            Top News
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-aura-muted" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {articles.map((article, i) => (
            <a 
              key={i} 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block p-3 rounded-2xl bg-aura-bg border border-aura-border/50 hover:border-aura-border transition-colors"
            >
              <h4 className="text-sm font-medium text-aura-text group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                {article.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-aura-muted">
                <span>{article.source}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
