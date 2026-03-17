import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Image as ImageIcon, Loader2, Download, RefreshCw } from 'lucide-react';

export default function ImagePlaygroundWidget() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // Using Pollinations AI for image generation
      const seed = Math.floor(Math.random() * 100000);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=400&height=400&nologo=true`;
      
      // Preload image
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setImageUrl(url);
    } catch (error) {
      console.error("Failed to generate image", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-[32px] overflow-hidden h-full relative group shadow-lg apple-glass-heavy border border-white/10 flex flex-col p-5">
      <div className="flex items-center gap-2 mb-4 text-purple-500">
        <Sparkles className="w-5 h-5" />
        <span className="text-lg font-semibold tracking-tight text-aura-text">Image Playground</span>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-purple-500"
            >
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-medium text-aura-muted">Creating...</span>
            </motion.div>
          ) : imageUrl ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full group/img"
            >
              <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                <button onClick={() => setImageUrl(null)} className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
                <a href={imageUrl} download="generated-image.jpg" target="_blank" rel="noreferrer" className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors">
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-aura-muted opacity-50"
            >
              <ImageIcon className="w-12 h-12" />
              <span className="text-sm font-medium">Describe an image</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={generateImage} className="flex gap-2 relative z-10">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic city..."
          disabled={isGenerating}
          className="flex-1 bg-black/10 dark:bg-white/5 rounded-xl px-4 py-2.5 text-sm text-aura-text focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-aura-muted/50 transition-all disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="p-2.5 bg-purple-500 text-white rounded-xl disabled:opacity-50 transition-opacity flex items-center justify-center shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
