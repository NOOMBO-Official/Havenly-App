import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Sparkles, Upload, RefreshCw, Shirt, Scissors } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface OutfitStylerAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OutfitStylerApp({ isOpen, onClose }: OutfitStylerAppProps) {
  const [image, setImage] = useState<string | null>(null);
  const [style, setStyle] = useState('casual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setResultImage(null);
    }
  };

  const generateOutfit = async () => {
    if (!image) return;
    
    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key missing");
      
      const ai = new GoogleGenAI({ apiKey });
      
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const prompt = `You are an expert fashion stylist. Look at the person in this image and generate a new image of them wearing a highly fashionable ${style} outfit. Keep their face, body type, and pose exactly the same, but completely change their clothes to match the ${style} aesthetic. Make it look photorealistic and high quality.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setResultImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error("Failed to generate outfit", err);
      alert("Failed to generate outfit. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:h-[650px] bg-aura-card/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl z-[60] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-medium text-aura-text">AI Outfit Styler</h2>
                <p className="text-xs text-aura-muted">Virtual try-on & styling</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 rounded-full text-aura-muted hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar - Controls */}
            <div className="w-full md:w-80 p-6 border-r border-white/10 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
              
              <div>
                <h3 className="text-sm font-medium text-aura-text mb-3">1. Upload Photo</h3>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all flex flex-col items-center justify-center gap-2 text-aura-muted hover:text-pink-400"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-medium">Choose a full-body photo</span>
                </button>
              </div>

              <div>
                <h3 className="text-sm font-medium text-aura-text mb-3">2. Choose Style</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['casual', 'formal', 'streetwear', 'cyberpunk', 'vintage', 'bohemian'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium capitalize transition-all ${
                        style === s 
                          ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                          : 'bg-white/5 text-aura-muted hover:bg-white/10 hover:text-aura-text'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button
                  onClick={generateOutfit}
                  disabled={!image || isGenerating}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Styling...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Outfit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Area - Preview */}
            <div className="flex-1 bg-black/20 p-6 flex items-center justify-center relative overflow-hidden">
              {!image ? (
                <div className="text-center flex flex-col items-center text-aura-muted opacity-50">
                  <Camera className="w-16 h-16 mb-4" strokeWidth={1} />
                  <p>Upload a photo to start styling</p>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center gap-4">
                  <div className="relative w-1/2 h-full flex flex-col items-center justify-center">
                    <span className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white z-10">Original</span>
                    <img src={image} alt="Original" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                  </div>
                  
                  <div className="relative w-1/2 h-full flex flex-col items-center justify-center">
                    <span className="absolute top-4 left-4 bg-pink-500/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white z-10">Generated</span>
                    {resultImage ? (
                      <img src={resultImage} alt="Generated" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                    ) : isGenerating ? (
                      <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
                        <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-4" />
                        <p className="text-aura-muted text-sm animate-pulse">Designing your {style} look...</p>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl text-aura-muted">
                        <Scissors className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Ready to style</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
