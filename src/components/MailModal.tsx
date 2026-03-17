import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail as MailIcon, Search, Edit, Archive, Trash2, Reply, Star, MoreHorizontal, Sparkles } from 'lucide-react';

interface MailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_EMAILS = [
  { id: 1, sender: 'Sarah Connor', subject: 'Project Skynet Update', preview: 'The latest build is ready for review. We need to discuss the new neural net architecture...', time: '10:42 AM', unread: true, starred: true },
  { id: 2, sender: 'Apple', subject: 'Your receipt from Apple', preview: 'Receipt for your recent purchase of iCloud+ 2TB storage plan...', time: 'Yesterday', unread: false, starred: false },
  { id: 3, sender: 'John Smith', subject: 'Lunch tomorrow?', preview: 'Hey, are we still on for lunch tomorrow at the usual place? Let me know.', time: 'Monday', unread: false, starred: false },
  { id: 4, sender: 'GitHub', subject: '[GitHub] Please verify your device', preview: 'A new sign-in to GitHub was detected from an unrecognized device...', time: 'Last Week', unread: true, starred: false },
  { id: 5, sender: 'Netflix', subject: 'New arrivals for you', preview: 'Check out the latest movies and TV shows added to Netflix this week.', time: 'Last Week', unread: false, starred: false },
];

export default function MailModal({ isOpen, onClose }: MailModalProps) {
  const [emails, setEmails] = useState(MOCK_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSummarize = () => {
    setIsSummarizing(true);
    setTimeout(() => {
      setSummary("Sarah is asking for a review of the new neural net architecture for Project Skynet. The build is ready.");
      setIsSummarizing(false);
    }, 1500);
  };

  const handleDelete = (id: number) => {
    setEmails(emails.filter(e => e.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const handleArchive = (id: number) => {
    setEmails(emails.filter(e => e.id !== id));
    if (selectedEmail?.id === id) setSelectedEmail(null);
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
              className="w-full max-w-6xl h-[85vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col bg-white/5"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-inner">
                    <MailIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Mail</h2>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative hidden md:block">
                    <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search"
                      className="bg-white/10 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-colors w-64"
                    />
                  </div>
                  <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Mailboxes */}
                <div className="w-64 border-r border-white/10 bg-black/20 p-4 hidden lg:flex flex-col">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-2">Mailboxes</h3>
                  <ul className="space-y-1">
                    {['Inbox', 'VIP', 'Drafts', 'Sent', 'Junk', 'Trash'].map((item, i) => (
                      <li key={item}>
                        <button className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${i === 0 ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}>
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Email List */}
                <div className={`w-full md:w-80 border-r border-white/10 bg-black/10 flex flex-col overflow-hidden shrink-0 ${selectedEmail ? 'hidden md:flex' : 'flex'}`}>
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Inbox</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                      {emails.map((email, index) => (
                        <motion.div 
                          key={email.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative border-b border-white/5"
                        >
                          {/* Background actions for swipe */}
                          <div className="absolute inset-0 flex justify-between items-center px-4">
                            <div className="flex items-center text-green-400">
                              <Archive className="w-5 h-5" />
                            </div>
                            <div className="flex items-center text-red-400">
                              <Trash2 className="w-5 h-5" />
                            </div>
                          </div>
                          
                          <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.5}
                            onDragEnd={(e, info) => {
                              if (info.offset.x > 100) {
                                handleArchive(email.id);
                              } else if (info.offset.x < -100) {
                                handleDelete(email.id);
                              }
                            }}
                            onClick={() => { 
                              setSelectedEmail(email); 
                              setSummary(null);
                              // Mark as read
                              if (email.unread) {
                                setEmails(emails.map(e => e.id === email.id ? { ...e, unread: false } : e));
                              }
                            }}
                            className={`relative p-4 cursor-pointer transition-colors bg-black/40 backdrop-blur-md ${selectedEmail?.id === email.id ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
                          >
                            <div className="flex justify-between items-baseline mb-1">
                              <div className="flex items-center gap-2">
                                {email.unread && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                                <span className={`font-medium ${email.unread ? 'text-white font-bold' : 'text-white/80'}`}>{email.sender}</span>
                              </div>
                              <span className="text-xs text-white/50">{email.time}</span>
                            </div>
                            <h4 className={`text-sm mb-1 ${email.unread ? 'text-white font-bold' : 'text-white/70'}`}>{email.subject}</h4>
                            <p className="text-xs text-white/50 line-clamp-2">{email.preview}</p>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Email Content */}
                <div className={`flex-1 flex flex-col bg-black/5 relative ${!selectedEmail ? 'hidden md:flex' : 'flex'}`}>
                  {selectedEmail ? (
                    <>
                      {/* Toolbar */}
                      <div className="flex justify-between items-center p-4 border-b border-white/10">
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedEmail(null)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-colors md:hidden flex items-center gap-1">
                            <span className="text-sm font-medium">Back</span>
                          </button>
                          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden md:block">
                            <Archive className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden md:block">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Reply className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Star className={`w-5 h-5 ${selectedEmail.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                          </button>
                          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-32 md:pb-32">
                        <div className="max-w-3xl mx-auto">
                          <h1 className="text-3xl font-bold text-white mb-6">{selectedEmail.subject}</h1>
                          
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-medium text-lg">
                                {selectedEmail.sender[0]}
                              </div>
                              <div>
                                <div className="font-medium text-white flex items-center gap-2">
                                  {selectedEmail.sender}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updatedEmails = emails.map(email => email.id === selectedEmail.id ? { ...email, starred: !email.starred } : email);
                                      setEmails(updatedEmails);
                                      setSelectedEmail({ ...selectedEmail, starred: !selectedEmail.starred });
                                    }}
                                    className="text-white/50 hover:text-yellow-500 transition-colors"
                                  >
                                    <Star className={`w-4 h-4 ${selectedEmail.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                  </button>
                                </div>
                                <div className="text-sm text-white/50">To: me</div>
                              </div>
                            </div>
                            <div className="text-sm text-white/50">{selectedEmail.time}</div>
                          </div>

                          <div className="text-white/80 leading-relaxed space-y-4 mb-8">
                            <p>{selectedEmail.preview}</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                          </div>

                          {/* AI Summary Feature */}
                          <div className="mb-8">
                            <button 
                              onClick={handleSummarize}
                              disabled={isSummarizing || !!summary}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:from-purple-500/30 hover:to-blue-500/30 transition-all flex items-center gap-2"
                            >
                              <Sparkles className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
                              {isSummarizing ? 'Summarizing...' : summary ? 'AI Summary' : 'Summarize with AI'}
                            </button>
                            
                            <AnimatePresence>
                              {summary && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-100/90 text-sm leading-relaxed"
                                >
                                  {summary}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Reply Button */}
                          <div className="flex justify-end mt-8">
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                              <Reply className="w-5 h-5" />
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-white/50">
                      Select an email to read
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
