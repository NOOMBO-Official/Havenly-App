import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Search, Plus, MoreHorizontal, Folder, Trash2, Edit3, CheckCircle2, Circle } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotesModal({ isOpen, onClose }: NotesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState<number | null>(1);

  const notes = [
    { id: 1, title: 'Meeting Notes', preview: 'Discussed the new AI features for the upcoming release...', date: '10:42 AM' },
    { id: 2, title: 'Grocery List', preview: 'Milk, Eggs, Bread, Apples, Coffee beans...', date: 'Yesterday' },
    { id: 3, title: 'Ideas for App', preview: '1. Add a weather widget. 2. Improve the dock animations...', date: 'Monday' },
    { id: 4, title: 'Travel Itinerary', preview: 'Flight leaves at 8:00 AM. Hotel check-in is at 3:00 PM.', date: 'Oct 12' },
  ];

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
              className="w-full max-w-5xl h-[85vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col md:flex-row relative bg-[#1c1c1e]"
            >
              {/* Sidebar */}
              <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-black/20 shrink-0 ${activeNote ? 'hidden md:flex' : 'flex flex-1'}`}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Notes</h2>
                  </div>
                  <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors md:hidden">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-4 pb-4">
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
                  <div className="px-2 space-y-1">
                    {notes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => setActiveNote(note.id)}
                        className={`w-full text-left p-3 rounded-xl transition-colors ${
                          activeNote === note.id ? 'bg-yellow-500/20' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={`font-medium truncate pr-2 ${activeNote === note.id ? 'text-yellow-500' : 'text-white'}`}>
                            {note.title}
                          </h3>
                          <span className="text-xs text-white/40 whitespace-nowrap">{note.date}</span>
                        </div>
                        <p className="text-sm text-white/50 truncate">{note.preview}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-white/10 flex justify-between items-center">
                  <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <Folder className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-colors">
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className={`flex-1 flex flex-col relative bg-[#1c1c1e] ${!activeNote ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveNote(null)} className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors md:hidden flex items-center gap-1">
                      <span className="text-sm font-medium">Back</span>
                    </button>
                    <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 pb-32 md:pb-32">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-white/40 text-sm mb-6 text-center">October 24, 2023 at 10:42 AM</div>
                    <h1 className="text-3xl font-bold text-white mb-4 outline-none" contentEditable suppressContentEditableWarning>
                      Meeting Notes
                    </h1>
                    <div className="text-white/90 text-lg leading-relaxed outline-none min-h-[50vh]" contentEditable suppressContentEditableWarning>
                      <p className="mb-4">Discussed the new AI features for the upcoming release. We need to focus on:</p>
                      <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Improving the context awareness of the chat assistant.</li>
                        <li>Adding more visual feedback during voice interactions.</li>
                        <li>Integrating the AI with the calendar and mail apps.</li>
                      </ul>
                      <p className="mb-4">Action items:</p>
                      <div className="flex items-center gap-3 mb-2 text-white/70">
                        <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                        <span className="line-through">Design new waveform animation</span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <Circle className="w-5 h-5 text-white/30" />
                        <span>Implement Mail summarization</span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <Circle className="w-5 h-5 text-white/30" />
                        <span>Update Dock icons</span>
                      </div>
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
