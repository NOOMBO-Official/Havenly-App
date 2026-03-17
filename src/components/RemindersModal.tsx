import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Circle, CheckCircle2, Calendar, Flag, Search, List, MoreHorizontal } from 'lucide-react';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RemindersModal({ isOpen, onClose }: RemindersModalProps) {
  const [activeList, setActiveList] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [reminders, setReminders] = useState([
    { id: 1, title: 'Buy groceries', list: 'Today', completed: false, time: '5:00 PM' },
    { id: 2, title: 'Call mom', list: 'Today', completed: true, time: '12:00 PM' },
    { id: 3, title: 'Finish project report', list: 'Work', completed: false, time: 'Tomorrow' },
    { id: 4, title: 'Pay bills', list: 'Scheduled', completed: false, time: 'Oct 15' },
    { id: 5, title: 'Book flight tickets', list: 'Flagged', completed: false, time: '' },
  ]);

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const filteredReminders = reminders.filter(r => {
    if (searchQuery) return r.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeList === 'All') return true;
    if (activeList === 'Flagged') return r.list === 'Flagged';
    if (activeList === 'Scheduled') return r.list === 'Scheduled' || r.time;
    if (activeList === 'Today') return r.list === 'Today' || r.time.includes('PM') || r.time.includes('AM');
    return r.list === activeList;
  });

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
              <div className={`w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#2c2c2e]/50 shrink-0 ${activeList ? 'hidden md:flex' : 'flex flex-1'}`}>
                <div className="p-4 flex items-center justify-between">
                  <div className="relative flex-1 mr-2">
                    <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-black/30 transition-colors"
                    />
                  </div>
                  <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors md:hidden">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24 md:pb-4">
                  {/* Smart Lists Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setActiveList('Today')}
                      className={`p-3 rounded-2xl flex flex-col items-start gap-2 transition-colors ${activeList === 'Today' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-black/20 hover:bg-black/30'}`}
                    >
                      <div className="flex justify-between w-full items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">
                          {reminders.filter(r => r.list === 'Today' && !r.completed).length}
                        </span>
                      </div>
                      <span className="text-white/70 font-medium">Today</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveList('Scheduled')}
                      className={`p-3 rounded-2xl flex flex-col items-start gap-2 transition-colors ${activeList === 'Scheduled' ? 'bg-red-500/20 border border-red-500/30' : 'bg-black/20 hover:bg-black/30'}`}
                    >
                      <div className="flex justify-between w-full items-center">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">
                          {reminders.filter(r => r.list === 'Scheduled' && !r.completed).length}
                        </span>
                      </div>
                      <span className="text-white/70 font-medium">Scheduled</span>
                    </button>

                    <button 
                      onClick={() => setActiveList('All')}
                      className={`p-3 rounded-2xl flex flex-col items-start gap-2 transition-colors ${activeList === 'All' ? 'bg-gray-500/20 border border-gray-500/30' : 'bg-black/20 hover:bg-black/30'}`}
                    >
                      <div className="flex justify-between w-full items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                          <List className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">
                          {reminders.filter(r => !r.completed).length}
                        </span>
                      </div>
                      <span className="text-white/70 font-medium">All</span>
                    </button>

                    <button 
                      onClick={() => setActiveList('Flagged')}
                      className={`p-3 rounded-2xl flex flex-col items-start gap-2 transition-colors ${activeList === 'Flagged' ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-black/20 hover:bg-black/30'}`}
                    >
                      <div className="flex justify-between w-full items-center">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                          <Flag className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">
                          {reminders.filter(r => r.list === 'Flagged' && !r.completed).length}
                        </span>
                      </div>
                      <span className="text-white/70 font-medium">Flagged</span>
                    </button>
                  </div>

                  {/* My Lists */}
                  <div>
                    <h3 className="text-white/50 font-semibold text-sm mb-2 px-2">My Lists</h3>
                    <div className="space-y-1">
                      <button 
                        onClick={() => setActiveList('Reminders')}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${activeList === 'Reminders' ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <List className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-white">Reminders</span>
                        </div>
                        <span className="text-white/50 text-sm">
                          {reminders.filter(r => r.list === 'Reminders' && !r.completed).length}
                        </span>
                      </button>
                      <button 
                        onClick={() => setActiveList('Work')}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${activeList === 'Work' ? 'bg-purple-500/20' : 'hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <List className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="text-white">Work</span>
                        </div>
                        <span className="text-white/50 text-sm">
                          {reminders.filter(r => r.list === 'Work' && !r.completed).length}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-white/10">
                  <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-full">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add List</span>
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className={`flex-1 flex flex-col relative bg-[#1c1c1e] ${!activeList ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveList('')} className="p-2 text-blue-500 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors md:hidden flex items-center gap-1">
                      <span className="text-sm font-medium">Back</span>
                    </button>
                    <h2 className={`text-xl md:text-2xl font-bold ${
                      activeList === 'Today' ? 'text-blue-400' : 
                      activeList === 'Scheduled' ? 'text-red-400' : 
                      activeList === 'Flagged' ? 'text-orange-400' : 
                      activeList === 'All' ? 'text-gray-400' : 
                      'text-blue-400'
                    }`}>
                      {activeList}
                    </h2>
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

                {/* Reminders List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-32">
                  <div className="space-y-2">
                    {filteredReminders.map((reminder) => (
                      <div key={reminder.id} className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                        <button onClick={() => toggleReminder(reminder.id)} className="mt-0.5 shrink-0">
                          {reminder.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-white/30 group-hover:text-white/50 transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 border-b border-white/10 pb-3 group-last:border-0">
                          <div className={`text-lg transition-colors ${reminder.completed ? 'text-white/30 line-through' : 'text-white'}`}>
                            {reminder.title}
                          </div>
                          {reminder.time && (
                            <div className={`text-sm mt-1 ${reminder.completed ? 'text-white/20' : 'text-red-400'}`}>
                              {reminder.time}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Reminder Input */}
                    <div className="flex items-center gap-3 p-3">
                      <Plus className="w-6 h-6 text-white/30 shrink-0" />
                      <div className="flex-1 border-b border-white/10 pb-3">
                        <input 
                          type="text"
                          placeholder="New Reminder"
                          className="w-full bg-transparent text-lg text-white placeholder:text-white/30 focus:outline-none"
                        />
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
