import { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, RefreshCw } from 'lucide-react';

export default function NotionWidget() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, you would need:
  // 1. NOTION_API_KEY (Internal Integration Secret)
  // 2. A backend server or edge function to proxy requests to Notion API to avoid CORS issues.
  // 3. The user must share specific Notion pages/databases with the integration.

  const fetchNotionData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mocking a fetch request since we can't call Notion API directly from browser due to CORS
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPages([
        { id: '1', title: 'Project Roadmap 2026', lastEdited: '2 hours ago', icon: '🚀' },
        { id: '2', title: 'Meeting Notes: Design Sync', lastEdited: 'Yesterday', icon: '📝' },
        { id: '3', title: 'Personal Goals', lastEdited: '3 days ago', icon: '🎯' },
      ]);
    } catch (err) {
      setError('Failed to fetch Notion data. Ensure your API key is correct and CORS is handled.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotionData();
  }, []);

  return (
    <div className="bg-aura-card border border-aura-border rounded-[2rem] p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
            <BookOpen className="w-5 h-5 text-aura-text" />
          </div>
          <div>
            <h2 className="text-lg font-display font-medium text-aura-text">Notion Workspace</h2>
            <p className="text-xs text-aura-muted">Recent Pages</p>
          </div>
        </div>
        <button 
          onClick={fetchNotionData}
          disabled={loading}
          className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-aura-muted ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {error ? (
          <div className="text-sm text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            {error}
          </div>
        ) : loading && pages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-aura-text border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          pages.map(page => (
            <div 
              key={page.id}
              className="group flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{page.icon}</span>
                <div>
                  <h3 className="text-sm font-medium text-aura-text group-hover:text-blue-400 transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-xs text-aura-muted">Edited {page.lastEdited}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-[10px] text-aura-muted text-center">
          Requires NOTION_API_KEY and a backend proxy to bypass CORS.
        </p>
      </div>
    </div>
  );
}
