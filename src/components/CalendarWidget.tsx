import { useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MapPin,
  Video,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  id: string;
  title: string;
  time: string;
  type: string;
  location: string;
  color: string;
  date: string;
}

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventType, setNewEventType] = useState("in-person");
  const [newEventColor, setNewEventColor] = useState("bg-red-500");

  const fetchEvents = () => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvent = {
      title: newEventTitle,
      time: newEventTime || "All Day",
      type: newEventType,
      location: newEventLocation || "TBD",
      color: newEventColor,
      date: selectedDate.toISOString()
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        fetchEvents();
        setIsAddingEvent(false);
        setNewEventTitle("");
        setNewEventTime("");
        setNewEventLocation("");
      }
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number, month: number, year: number) => {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === date.getDate() && 
             eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <>
      <motion.div 
        layoutId="calendar-widget"
        className="flex flex-col p-5 rounded-[32px] apple-glass-heavy h-full cursor-pointer group relative overflow-hidden"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          if (settings.tapToExpand) setIsExpanded(true);
        }}
      >
        {/* Quick Action Overlay */}
        {settings.tapToExpand && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">
            <span className="text-white font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
              Tap to Expand
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-2 text-red-500">
            <CalendarIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-aura-text tracking-tight">Calendar</h2>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={(e) => { e.stopPropagation(); prevMonth(); }}
              className="p-1.5 text-aura-muted hover:text-aura-text hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextMonth(); }}
              className="p-1.5 text-aura-muted hover:text-aura-text hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-lg font-semibold text-aura-text mb-3 relative z-10 tracking-tight">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1 relative z-10">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-semibold text-aura-muted py-1 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 flex-1 relative z-10">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="p-1" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const today = isToday(day, currentDate.getMonth(), currentDate.getFullYear());
            const hasEvents = getEventsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)).length > 0;
            
            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center p-1 text-[13px] rounded-full transition-colors relative h-8 w-8 mx-auto ${
                  today
                    ? "bg-red-500 text-white font-semibold shadow-sm"
                    : "text-aura-text hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer font-medium"
                }`}
              >
                <span>{day}</span>
                {hasEvents && !today && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-aura-muted/50" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              layoutId="calendar-widget"
              className="w-full max-w-5xl h-full max-h-[800px] rounded-[3rem] border border-white/10 dark:border-white/5 bg-black/5 dark:bg-white/5 backdrop-blur-3xl relative overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-white/10 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-500">
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-aura-text">Schedule</h2>
                    <p className="text-aura-muted font-medium">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-aura-text transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Large Calendar View */}
                <div className="w-full md:w-1/2 lg:w-7/12 border-r border-white/10 dark:border-white/5 p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-semibold tracking-tight text-aura-text">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={prevMonth}
                        className="p-2 bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl text-aura-muted hover:text-aura-text transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl text-sm font-medium text-aura-text hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        onClick={nextMonth}
                        className="p-2 bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl text-aura-muted hover:text-aura-text transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium uppercase tracking-wider text-aura-muted py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2 flex-1">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} className="p-2" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const isTodayDate = isToday(day, currentDate.getMonth(), currentDate.getFullYear());
                      const isSelectedDate = isSelected(day, currentDate.getMonth(), currentDate.getFullYear());
                      const events = getEventsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                      
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                          className={`flex flex-col items-center justify-start p-2 rounded-2xl transition-all relative border ${
                            isSelectedDate
                              ? "bg-red-500/20 border-red-500/50 text-red-500"
                              : isTodayDate
                              ? "bg-black/5 dark:bg-white/5 border-white/10 dark:border-white/5 text-aura-text"
                              : "border-transparent text-aura-text hover:bg-black/5 dark:hover:bg-white/5 hover:border-white/10 dark:hover:border-white/5"
                          }`}
                        >
                          <span className={`text-lg font-medium mb-1 ${isTodayDate && !isSelectedDate ? 'text-red-500' : ''}`}>{day}</span>
                          
                          <div className="flex gap-1 mt-auto">
                            {events.slice(0, 3).map((event, idx) => (
                              <div key={idx} className={`w-1.5 h-1.5 rounded-full ${event.color}`} />
                            ))}
                            {events.length > 3 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-aura-muted" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Schedule View */}
                <div className="w-full md:w-1/2 lg:w-5/12 p-8 bg-black/5 dark:bg-white/5 overflow-y-auto custom-scrollbar flex flex-col">
                  <h3 className="text-xl font-semibold tracking-tight text-aura-text mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-aura-muted" />
                    Schedule for {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
                  </h3>

                  {selectedEvents.length > 0 ? (
                    <div className="space-y-4 flex-1">
                      {selectedEvents.map(event => (
                        <div key={event.id} className="p-5 rounded-2xl apple-glass-heavy border border-white/10 dark:border-white/5 relative overflow-hidden group hover:border-white/20 transition-colors">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${event.color}`} />
                          <div className="pl-3">
                            <div className="text-sm text-aura-muted mb-1 font-mono">{event.time}</div>
                            <div className="text-lg font-medium text-aura-text mb-3">{event.title}</div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-aura-muted">
                                <div className="flex items-center gap-1.5">
                                  {event.type === 'video' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                  <span>{event.location}</span>
                                </div>
                              </div>
                              <button 
                                onClick={(e) => handleDeleteEvent(event.id, e)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-aura-muted opacity-50">
                      <CalendarIcon className="w-16 h-16 mb-4" />
                      <p className="text-lg font-medium">No events scheduled</p>
                      <p className="text-sm mt-2">Enjoy your free time!</p>
                    </div>
                  )}

                  {isAddingEvent ? (
                    <form onSubmit={handleAddEvent} className="mt-6 p-5 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 dark:border-white/5 flex flex-col gap-3">
                      <h4 className="text-sm font-semibold text-aura-text mb-2">New Event</h4>
                      <input
                        type="text"
                        placeholder="Event Title"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-aura-text focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Time (e.g. 2:00 PM)"
                          value={newEventTime}
                          onChange={(e) => setNewEventTime(e.target.value)}
                          className="w-1/2 bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-aura-text focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Location"
                          value={newEventLocation}
                          onChange={(e) => setNewEventLocation(e.target.value)}
                          className="w-1/2 bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-aura-text focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={newEventType}
                          onChange={(e) => setNewEventType(e.target.value)}
                          className="w-1/2 bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-aura-text focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                          <option value="in-person">In Person</option>
                          <option value="video">Video Call</option>
                        </select>
                        <select
                          value={newEventColor}
                          onChange={(e) => setNewEventColor(e.target.value)}
                          className="w-1/2 bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-aura-text focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                          <option value="bg-red-500">Red</option>
                          <option value="bg-blue-500">Blue</option>
                          <option value="bg-green-500">Green</option>
                          <option value="bg-purple-500">Purple</option>
                          <option value="bg-orange-500">Orange</option>
                        </select>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingEvent(false)}
                          className="flex-1 py-2 bg-black/10 dark:bg-white/10 text-aura-text rounded-xl font-medium hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newEventTitle.trim()}
                          className="flex-1 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 text-sm"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setIsAddingEvent(true)}
                      className="mt-6 w-full py-4 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                    >
                      + New Event
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
