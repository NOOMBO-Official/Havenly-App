import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Plus, Phone, Mail, Video, MessageSquare } from 'lucide-react';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactsModal({ isOpen, onClose }: ContactsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContact, setActiveContact] = useState<number | null>(1);

  const contacts = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', phone: '+1 (555) 123-4567', initial: 'A', color: 'bg-blue-500' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1 (555) 987-6543', initial: 'B', color: 'bg-green-500' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 (555) 456-7890', initial: 'C', color: 'bg-yellow-500' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', phone: '+1 (555) 789-0123', initial: 'D', color: 'bg-purple-500' },
    { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', phone: '+1 (555) 321-6549', initial: 'E', color: 'bg-red-500' },
  ];

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedContact = contacts.find(c => c.id === activeContact) || contacts[0];

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
              className="w-full max-w-4xl h-[80vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col md:flex-row relative bg-[#1c1c1e]"
            >
              {/* Sidebar */}
              <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#2c2c2e]/50 shrink-0 ${activeContact ? 'hidden md:flex' : 'flex flex-1'}`}>
                <div className="p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Contacts</h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors md:hidden">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="px-4 pb-4 border-b border-white/10">
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
                  <div className="p-2">
                    {filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => setActiveContact(contact.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                          activeContact === contact.id ? 'bg-blue-500/20' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full ${contact.color} flex items-center justify-center text-white font-bold shrink-0`}>
                          {contact.initial}
                        </div>
                        <div className="flex-1 text-left border-b border-white/5 pb-2 pt-2">
                          <div className="text-white font-medium">{contact.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className={`flex-1 flex flex-col relative bg-[#1c1c1e] ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
                  <button onClick={() => setActiveContact(null)} className="p-2 text-blue-500 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors md:hidden flex items-center gap-1">
                    <span className="text-sm font-medium">Back</span>
                  </button>
                  <div className="flex items-center gap-2 ml-auto">
                    <button className="text-blue-400 hover:text-blue-300 font-medium px-4 py-2 transition-colors">
                      Edit
                    </button>
                    <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contact Details */}
                {selectedContact ? (
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32 flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full ${selectedContact.color} flex items-center justify-center text-white text-5xl font-bold mb-6 shadow-lg`}>
                      {selectedContact.initial}
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-8">{selectedContact.name}</h1>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-8 w-full max-w-md justify-center">
                      <button className="flex flex-col items-center gap-2 w-20 p-3 bg-[#2c2c2e] rounded-2xl hover:bg-[#3a3a3c] transition-colors">
                        <MessageSquare className="w-6 h-6 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">message</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 w-20 p-3 bg-[#2c2c2e] rounded-2xl hover:bg-[#3a3a3c] transition-colors">
                        <Phone className="w-6 h-6 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">call</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 w-20 p-3 bg-[#2c2c2e] rounded-2xl hover:bg-[#3a3a3c] transition-colors">
                        <Video className="w-6 h-6 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">video</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 w-20 p-3 bg-[#2c2c2e] rounded-2xl hover:bg-[#3a3a3c] transition-colors">
                        <Mail className="w-6 h-6 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">mail</span>
                      </button>
                    </div>

                    {/* Info Cards */}
                    <div className="w-full max-w-md space-y-4">
                      <div className="bg-[#2c2c2e] p-4 rounded-2xl">
                        <div className="text-white/50 text-xs mb-1">mobile</div>
                        <div className="text-blue-400 text-lg">{selectedContact.phone}</div>
                      </div>
                      <div className="bg-[#2c2c2e] p-4 rounded-2xl">
                        <div className="text-white/50 text-xs mb-1">email</div>
                        <div className="text-blue-400 text-lg">{selectedContact.email}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-white/50">
                    No Contact Selected
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
