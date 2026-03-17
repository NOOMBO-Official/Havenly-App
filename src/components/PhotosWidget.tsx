import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, Eraser, X, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';

interface Photo {
  url: string;
  subject: string;
  info: string;
}

const DEFAULT_IMAGES: Photo[] = [
  { url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400&h=400", subject: "Golden Retriever", info: "A medium-large gun dog that was bred to retrieve shot waterfowl." },
  { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400&h=400", subject: "Mountain Landscape", info: "A large natural elevation of the earth's surface rising abruptly from the surrounding level." },
  { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400&h=400", subject: "Vintage Camera", info: "An optical instrument used to capture and record images." },
];

export default function PhotosWidget() {
  const [images, setImages] = useState<Photo[]>(DEFAULT_IMAGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLookup, setShowLookup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageSubject, setNewImageSubject] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem('custom-photos');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setImages(parsed);
        }
      } catch (e) {
        console.error("Failed to parse photos", e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!showLookup && !isEditing && !isAdding) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [showLookup, isEditing, isAdding, images.length]);

  const currentImage = images[currentIndex] || DEFAULT_IMAGES[0];

  const handleCleanUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCleaning(true);
    setTimeout(() => {
      setIsCleaning(false);
      setIsEditing(false);
      // Remove current image if there's more than one
      if (images.length > 1) {
        const newImages = images.filter((_, i) => i !== currentIndex);
        setImages(newImages);
        localStorage.setItem('custom-photos', JSON.stringify(newImages));
        setCurrentIndex(prev => prev >= newImages.length ? 0 : prev);
      }
    }, 2000);
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    
    const newPhoto: Photo = {
      url: newImageUrl,
      subject: newImageSubject || "Custom Photo",
      info: "Added by user"
    };
    
    const newImages = [...images, newPhoto];
    setImages(newImages);
    localStorage.setItem('custom-photos', JSON.stringify(newImages));
    setCurrentIndex(newImages.length - 1);
    setIsAdding(false);
    setNewImageUrl("");
    setNewImageSubject("");
  };

  return (
    <div className="rounded-[32px] overflow-hidden h-full relative group cursor-pointer shadow-lg bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={currentImage.url}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${isCleaning ? 'blur-sm scale-110 brightness-110' : ''}`}
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>
      
      {/* Clean Up Effect Overlay */}
      <AnimatePresence>
        {isCleaning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              <span className="text-white font-medium text-sm drop-shadow-md">Removing photo...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="text-white/90 text-xs font-semibold tracking-wider uppercase drop-shadow-md">
          Featured
        </span>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <h3 className="text-white text-xl font-semibold tracking-tight drop-shadow-md">Memories</h3>
        <p className="text-white/80 text-sm font-medium drop-shadow-md">A look back at today</p>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {isEditing ? (
          <>
            <button 
              onClick={handleCleanUp}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2 px-3"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs font-medium">Delete</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsAdding(true);
                setShowLookup(false);
              }}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setShowLookup(false);
              }}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60 transition-colors"
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowLookup(!showLookup);
                setIsEditing(false);
              }}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Add Photo Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-2 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 text-white z-30 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Add Photo URL
              </h4>
              <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddPhoto} className="flex flex-col gap-3 flex-1">
              <input
                type="url"
                placeholder="Image URL (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                required
              />
              <input
                type="text"
                placeholder="Subject (e.g. My Dog)"
                value={newImageSubject}
                onChange={(e) => setNewImageSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button 
                type="submit"
                className="mt-auto w-full py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                Add Photo
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Lookup Modal/Overlay */}
      <AnimatePresence>
        {showLookup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-x-2 bottom-2 p-4 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 text-white z-10"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 rounded-full text-purple-400 shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-1">
                  Visual Lookup <Sparkles className="w-3 h-3 text-purple-400" />
                </h4>
                <p className="text-xs text-white/70 mt-1 font-medium">{currentImage.subject}</p>
                <p className="text-[10px] text-white/50 mt-1 leading-relaxed">{currentImage.info}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
