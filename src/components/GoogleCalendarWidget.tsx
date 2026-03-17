import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ExternalLink, RefreshCw, Clock } from 'lucide-react';

export default function GoogleCalendarWidget() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, you would need:
  // 1. Google OAuth Client ID
  // 2. A backend proxy or Firebase Auth to handle the OAuth flow and get an access token
  // 3. Call the Google Calendar API: https://www.googleapis.com/calendar/v3/calendars/primary/events

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mocking a fetch request for Google Calendar API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const now = new Date();
      setEvents([
        { 
          id: '1', 
          title: 'Team Standup', 
          time: '10:00 AM - 10:30 AM', 
          color: 'bg-blue-500',
          isNow: true
        },
        { 
          id: '2', 
          title: 'Design Review', 
          time: '1:00 PM - 2:00 PM', 
          color: 'bg-purple-500',
          isNow: false
        },
        { 
          id: '3', 
          title: '1:1 with Alex', 
          time: '3:30 PM - 4:00 PM', 
          color: 'bg-green-500',
          isNow: false
        },
        { 
          id: '4', 
          title: 'Dinner with Sarah', 
          time: '7:00 PM - 9:00 PM', 
          color: 'bg-orange-500',
          isNow: false
        },
      ]);
    } catch (err) {
      setError('Failed to fetch Google Calendar data. Ensure your OAuth is configured.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  return (
    <div className="apple-glass-heavy border border-black/5 dark:border-white/10 rounded-[32px] p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-aura-text">Google Calendar</h2>
            <p className="text-xs font-medium text-aura-muted">Today's Schedule</p>
          </div>
        </div>
        <button 
          onClick={fetchCalendarData}
          disabled={loading}
          className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-aura-muted ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {error ? (
          <div className="text-sm text-red-500 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
            {error}
          </div>
        ) : loading && events.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-aura-muted">
            <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">No more events today</p>
          </div>
        ) : (
          events.map(event => (
            <div 
              key={event.id}
              className={`group flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${
                event.isNow 
                  ? 'bg-blue-500/10 border-blue-500/30 shadow-sm' 
                  : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <div className={`w-1.5 h-10 rounded-full ${event.color} mr-4 shrink-0`} />
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold truncate transition-colors ${
                  event.isNow ? 'text-blue-500' : 'text-aura-text group-hover:text-blue-500'
                }`}>
                  {event.title}
                </h3>
                <div className="flex items-center text-xs font-medium text-aura-muted mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {event.time}
                  {event.isNow && (
                    <span className="ml-2 px-1.5 py-0.5 bg-blue-500/20 text-blue-500 rounded text-[9px] uppercase tracking-wider font-bold animate-pulse">
                      Now
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
        <p className="text-[10px] font-medium text-aura-muted text-center">
          Requires Google OAuth Client ID and Calendar API scope.
        </p>
      </div>
    </div>
  );
}
