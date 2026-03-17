import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_EVENTS = [
  { id: 1, title: 'Team Sync', time: '10:00 AM', duration: '1h', color: 'bg-blue-500' },
  { id: 2, title: 'Design Review', time: '1:00 PM', duration: '1.5h', color: 'bg-purple-500' },
  { id: 3, title: 'Client Meeting', time: '3:30 PM', duration: '45m', color: 'bg-orange-500' },
];

export default function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
              className="w-full max-w-5xl h-[80vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col bg-white/5"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-inner">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Calendar</h2>
                </div>
                
                <div className="flex items-center gap-4">
                  <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Mini Calendar & Events */}
                <div className="w-80 border-r border-white/10 bg-black/20 p-6 hidden md:flex flex-col overflow-y-auto custom-scrollbar">
                  {/* Mini Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <div className="flex gap-1">
                      <button onClick={prevMonth} className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={nextMonth} className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mini Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-8">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-white/50 py-1">{day}</div>
                    ))}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} className="p-2"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                      return (
                        <button 
                          key={day} 
                          className={`p-2 w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${isToday ? 'bg-red-500 text-white font-bold' : 'text-white hover:bg-white/10'}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Upcoming Events */}
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Today</h3>
                    <div className="space-y-3">
                      {MOCK_EVENTS.map(event => (
                        <div key={event.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                          <div className={`w-1 h-10 rounded-full ${event.color} mt-1`} />
                          <div>
                            <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">{event.title}</h4>
                            <p className="text-white/50 text-xs">{event.time} • {event.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Calendar View (Day/Week) */}
                <div className="flex-1 p-6 pb-32 overflow-y-auto custom-scrollbar relative">
                  {/* Time Grid */}
                  <div className="absolute inset-0 p-6 pointer-events-none">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="flex h-20 border-t border-white/5">
                        <div className="w-16 text-xs text-white/30 font-medium -mt-2 pr-4 text-right">
                          {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                        </div>
                        <div className="flex-1" />
                      </div>
                    ))}
                  </div>

                  {/* Events Overlay (Mocked positions) */}
                  <div className="absolute top-6 left-28 right-6 bottom-6 pointer-events-auto">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-[800px] left-0 right-4 h-20 bg-blue-500/20 border border-blue-500/50 rounded-xl p-3 backdrop-blur-sm cursor-pointer hover:bg-blue-500/30 transition-colors"
                    >
                      <h4 className="text-blue-100 font-semibold text-sm">Team Sync</h4>
                      <p className="text-blue-200/70 text-xs">10:00 AM - 11:00 AM</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="absolute top-[1040px] left-0 right-4 h-32 bg-purple-500/20 border border-purple-500/50 rounded-xl p-3 backdrop-blur-sm cursor-pointer hover:bg-purple-500/30 transition-colors"
                    >
                      <h4 className="text-purple-100 font-semibold text-sm">Design Review</h4>
                      <p className="text-purple-200/70 text-xs">1:00 PM - 2:30 PM</p>
                    </motion.div>
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
