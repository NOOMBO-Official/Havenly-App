import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Image as ImageIcon, Sparkles, Wand2, Share, Trash2, Heart } from 'lucide-react';

interface PhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_PHOTOS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba', title: 'Mountain Peak', date: 'Today', location: 'Yosemite' },
  { id: 2, url: 'https://images.unsplash.com/photo-1682687982501-1e58f813f22b', title: 'Desert Dunes', date: 'Yesterday', location: 'Sahara' },
  { id: 3, url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538', title: 'Ocean Waves', date: 'Monday', location: 'Maui' },
  { id: 4, url: 'https://images.unsplash.com/photo-1682687982185-531d09ec56fc', title: 'Forest Trail', date: 'Last Week', location: 'Redwoods' },
  { id: 5, url: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b', title: 'City Lights', date: 'Last Week', location: 'Tokyo' },
  { id: 6, url: 'https://images.unsplash.com/photo-1682687982134-2ac563b2228b', title: 'Snowy Cabin', date: 'Last Month', location: 'Alps' },
];

export default function PhotosModal({ isOpen, onClose }: PhotosModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const handleCleanUp = () => {
    setIsCleaningUp(true);
    setTimeout(() => {
      setIsCleaningUp(false);
      setIsEditing(false);
    }, 2000);
  };

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
              className="w-full max-w-5xl h-[80vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 gap-4 md:gap-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-inner">
                      <ImageIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">Photos</h2>
                  </div>
                  <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0 md:hidden">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-end">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 hidden md:block" />
                    <input 
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/10 border border-white/10 rounded-full px-4 md:pl-9 md:pr-4 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-colors w-full"
                    />
                  </div>
                  <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0 hidden md:block">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24 md:pb-6">
                {selectedPhoto ? (
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <button 
                        onClick={() => { setSelectedPhoto(null); setIsEditing(false); }}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        Back to Library
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditing(!isEditing)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${isEditing ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        >
                          <Wand2 className="w-4 h-4" /> Edit
                        </button>
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                          <Share className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/50 flex items-center justify-center">
                      <img 
                        src={selectedPhoto.url} 
                        alt={selectedPhoto.title}
                        className={`max-w-full max-h-full object-contain transition-all duration-1000 ${isCleaningUp ? 'blur-md scale-105' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                      
                      {isEditing && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex gap-2 shadow-2xl"
                        >
                          <button 
                            onClick={handleCleanUp}
                            disabled={isCleaningUp}
                            className="px-4 py-2 rounded-xl hover:bg-white/10 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            <Sparkles className={`w-4 h-4 ${isCleaningUp ? 'animate-spin text-purple-400' : 'text-purple-400'}`} />
                            {isCleaningUp ? 'Cleaning...' : 'Clean Up'}
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {MOCK_PHOTOS.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase())).map((photo) => (
                      <motion.div
                        key={photo.id}
                        layoutId={`photo-${photo.id}`}
                        onClick={() => setSelectedPhoto(photo)}
                        className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative"
                      >
                        <img 
                          src={photo.url} 
                          alt={photo.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <span className="text-white font-medium text-sm">{photo.title}</span>
                          <span className="text-white/70 text-xs">{photo.location}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
