import { useState, useEffect, useRef } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { FileText, Plus, Trash2, X, Edit3, CheckCircle2, Circle, ChevronRight, Sparkles, Loader2, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotesWidget() {
  const [notes, setNotes] = useState<{id: string, text: string, completed?: boolean}[]>(() => {
    const saved = localStorage.getItem('aura-notes');
    return saved ? JSON.parse(saved) : [
      { id: "1", text: "Buy groceries", completed: false },
      { id: "2", text: "Call mom", completed: true }
    ];
  });
  const [newNote, setNewNote] = useState("");
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem('aura-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([{ id: Date.now().toString(), text: newNote, completed: false }, ...notes]);
    setNewNote("");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const toggleNote = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  };

  const handleAiAction = async (action: 'summarize' | 'grammar' | 'professional') => {
    if (!newNote.trim()) return;
    setIsAiProcessing(true);
    setShowAiMenu(false);

    let prompt = '';
    switch (action) {
      case 'summarize': prompt = `Summarize this note into a concise bullet point: "${newNote}"`; break;
      case 'grammar': prompt = `Fix any grammar or spelling mistakes in this text, return only the fixed text: "${newNote}"`; break;
      case 'professional': prompt = `Rewrite this text to sound more professional and formal, return only the rewritten text: "${newNote}"`; break;
    }

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const result = await response.text();
      setNewNote(result.trim());
    } catch (error) {
      console.error("AI processing failed", error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const filteredNotes = notes.filter(n => {
    if (activeTab === 'active') return !n.completed;
    if (activeTab === 'completed') return n.completed;
    return true;
  });

  return (
    <>
      <motion.div 
        layoutId="notes-widget"
        className="flex flex-col p-5 rounded-[32px] border border-white/10 apple-glass-heavy h-full relative overflow-hidden group cursor-pointer"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
          if (settings.tapToExpand) setIsExpanded(true);
        }}
      >
        {/* Textured Background Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        {/* Quick Action Overlay */}
        {settings.tapToExpand && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">
            <span className="text-white text-sm font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
              Tap to Expand
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-3 relative z-10">
          <div className="flex items-center gap-2 text-yellow-500">
            <Edit3 className="w-5 h-5" />
            <span className="text-lg font-semibold tracking-tight text-aura-text">Notes</span>
          </div>
          <ChevronRight className="w-5 h-5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {notes.slice(0, 5).map(note => (
              <div key={note.id} className="flex items-center justify-between p-2.5 bg-black/10 dark:bg-white/5 rounded-2xl group/item">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button onClick={() => toggleNote(note.id)} className="flex-shrink-0 text-aura-muted hover:text-yellow-500 transition-colors">
                    {note.completed ? <CheckCircle2 className="w-5 h-5 text-yellow-500" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <span className={`text-sm truncate ${note.completed ? 'text-aura-muted line-through' : 'text-aura-text'}`}>
                    {note.text}
                  </span>
                </div>
                <button 
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover/item:opacity-100 text-red-400 hover:bg-red-400/10 p-1.5 rounded-full transition-all ml-2 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {notes.length > 5 && (
              <div className="text-center text-aura-muted text-xs mt-2 font-medium">
                +{notes.length - 5} more
              </div>
            )}
            {notes.length === 0 && (
              <div className="text-center text-aura-muted text-sm mt-4">No notes yet.</div>
            )}
          </div>
          
          <form onSubmit={addNote} className="mt-3 flex gap-2 relative z-10">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="New note..."
              className="flex-1 bg-black/10 dark:bg-white/5 rounded-xl px-4 py-2.5 text-sm text-aura-text focus:outline-none focus:ring-2 focus:ring-yellow-500/50 placeholder-aura-muted/50 transition-all"
            />
            <button 
              type="submit"
              disabled={!newNote.trim()}
              className="p-2.5 bg-yellow-500 text-white rounded-xl disabled:opacity-50 transition-opacity flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              layoutId="notes-widget"
              className="w-full max-w-4xl h-full max-h-[800px] rounded-[3rem] border border-white/10 dark:border-white/5 bg-black/5 dark:bg-white/5 backdrop-blur-3xl relative overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Textured Background Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

              <div className="p-8 flex justify-between items-center border-b border-white/10 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-500">
                    <Edit3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-aura-text">Notes</h2>
                    <p className="text-aura-muted font-medium">{notes.filter(n => !n.completed).length} active tasks</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-aura-text transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
                {/* Sidebar */}
                <div className="w-full md:w-64 border-r border-white/10 dark:border-white/5 p-6 flex flex-col gap-2 bg-black/5 dark:bg-white/5">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'all' ? 'bg-yellow-500 text-white shadow-md' : 'text-aura-text hover:bg-black/10 dark:hover:bg-white/10'}`}
                  >
                    <span className="font-medium">All Notes</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${activeTab === 'all' ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}>{notes.length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('active')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'active' ? 'bg-yellow-500 text-white shadow-md' : 'text-aura-text hover:bg-black/10 dark:hover:bg-white/10'}`}
                  >
                    <span className="font-medium">Active</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${activeTab === 'active' ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}>{notes.filter(n => !n.completed).length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('completed')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === 'completed' ? 'bg-yellow-500 text-white shadow-md' : 'text-aura-text hover:bg-black/10 dark:hover:bg-white/10'}`}
                  >
                    <span className="font-medium">Completed</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${activeTab === 'completed' ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}>{notes.filter(n => n.completed).length}</span>
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 flex flex-col">
                  <div className="mb-6 relative">
                    <form onSubmit={addNote} className="flex gap-3 relative z-10">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="What needs to be done?"
                          className="w-full bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-2xl pl-5 pr-12 py-4 text-base font-medium text-aura-text focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all placeholder-aura-muted"
                          disabled={isAiProcessing}
                        />
                        {newNote.trim() && !isAiProcessing && (
                          <button
                            type="button"
                            onClick={() => setShowAiMenu(!showAiMenu)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                          >
                            <Sparkles className="w-5 h-5" />
                          </button>
                        )}
                        {isAiProcessing && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-purple-500">
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                        )}
                      </div>
                      <button 
                        type="submit"
                        disabled={!newNote.trim() || isAiProcessing}
                        className="px-6 bg-yellow-500 text-white rounded-2xl disabled:opacity-50 transition-opacity font-medium flex items-center gap-2 shadow-sm"
                      >
                        <Plus className="w-5 h-5" /> Add
                      </button>
                    </form>

                    {/* AI Writing Tools Menu */}
                    <AnimatePresence>
                      {showAiMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-black/80 dark:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                        >
                          <div className="p-2 border-b border-white/10 bg-white/5">
                            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1">
                              <Wand2 className="w-3 h-3" /> Writing Tools
                            </span>
                          </div>
                          <div className="p-1">
                            <button onClick={() => handleAiAction('grammar')} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-xl transition-colors">
                              Fix Grammar & Spelling
                            </button>
                            <button onClick={() => handleAiAction('professional')} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-xl transition-colors">
                              Make Professional
                            </button>
                            <button onClick={() => handleAiAction('summarize')} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-xl transition-colors">
                              Summarize
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    <AnimatePresence>
                      {filteredNotes.map(note => (
                        <motion.div 
                          key={note.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`flex items-center justify-between p-5 rounded-2xl transition-all group ${note.completed ? 'bg-black/5 dark:bg-white/5 opacity-70' : 'apple-glass-heavy border border-white/10 dark:border-white/5 shadow-sm'}`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <button 
                              onClick={() => toggleNote(note.id)} 
                              className={`flex-shrink-0 transition-colors ${note.completed ? 'text-yellow-500' : 'text-aura-muted hover:text-yellow-500'}`}
                            >
                              {note.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                            </button>
                            <span className={`text-base font-medium ${note.completed ? 'text-aura-muted line-through' : 'text-aura-text'}`}>
                              {note.text}
                            </span>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => deleteNote(note.id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 transition-colors rounded-xl"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {filteredNotes.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-aura-muted opacity-50">
                        <FileText className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">No notes found</p>
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
