import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, Square, Loader2, Bot, User } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSmartHome } from '../contexts/SmartHomeContext';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
  isAudio?: boolean;
}

export default function AiChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { settings } = useSettings();
  const { rooms, toggleDevice, setDeviceState } = useSmartHome();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi ${settings?.userName || 'there'}! I'm AVA. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = async (event: any) => {
          const text = event.results[0][0].transcript;
          setIsRecording(false);
          await handleSendText(text);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, [rooms, settings]);

  const handleSendText = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText) return;
    
    if (!textToSend) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsProcessing(true);

    // Simple local command parsing
    const lowerText = userText.toLowerCase();
    let commandExecuted = false;
    if (lowerText.includes("turn on") || lowerText.includes("turn off") || lowerText.includes("toggle")) {
      for (const room of rooms) {
        for (const device of room.devices) {
          if (lowerText.includes(device.name.toLowerCase()) || lowerText.includes(device.type.toLowerCase())) {
            if (lowerText.includes("turn on")) setDeviceState(room.id, device.id, true);
            else if (lowerText.includes("turn off")) setDeviceState(room.id, device.id, false);
            else if (lowerText.includes("toggle")) toggleDevice(room.id, device.id);
            commandExecuted = true;
          }
        }
      }
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const contents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: userText }] });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: `You are AVA, an advanced smart home assistant for Havenly. User: ${settings?.userName || "User"}. Keep responses concise and helpful. ${commandExecuted ? "Acknowledge that you executed the user's smart home command." : ""}`,
        }
      });
      
      const reply = response.text;
      setMessages(prev => [...prev, { role: 'model', text: reply || 'Done.' }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error processing your request: ${error.message || error}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        setIsRecording(true);
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
        setIsRecording(false);
      }
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed inset-0 md:top-auto md:left-auto md:bottom-24 md:right-8 md:w-[400px] md:h-[600px] apple-glass-heavy rounded-none md:rounded-[32px] shadow-2xl z-[115] flex flex-col overflow-hidden border-0 md:border transition-all duration-500 ${isProcessing ? 'border-transparent' : 'border-white/10'} pb-24 md:pb-0`}
        >
          {/* Apple Intelligence Glow Border */}
          {isProcessing && (
            <div className="absolute inset-0 z-[-1] rounded-[32px] p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor' }}></div>
          )}

          {/* Ambient Background Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none z-[-1] animate-pulse" />

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-inner">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white tracking-tight">AVA Chat</span>
            </div>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-white/10' : 'bg-gradient-to-tr from-blue-500 to-purple-500'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white border border-white/5'}`}>
                  {msg.isAudio ? (
                    <div className="flex items-center gap-2 font-medium">
                      <Mic className="w-4 h-4" /> Voice Message
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-invert">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm border border-white/5">
                  <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                  <span className="text-white/50 text-sm font-medium">AVA is thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 border-t border-white/10 bg-black/20 backdrop-blur-md">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-white/30 transition-colors shadow-inner">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendText();
                    }
                  }}
                  placeholder="Message AVA..."
                  className="w-full bg-transparent text-white px-4 py-3 max-h-32 min-h-[44px] resize-none focus:outline-none placeholder:text-white/30"
                  rows={1}
                />
              </div>
              
              {input.trim() ? (
                <button
                  onClick={() => handleSendText()}
                  disabled={isProcessing}
                  className="p-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                  disabled={isProcessing}
                  className={`p-3 rounded-xl transition-all shrink-0 shadow-sm ${isRecording ? 'bg-red-500 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)] text-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'}`}
                >
                  {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
            </div>
            <div className="text-center mt-3 h-4 flex items-center justify-center">
              {isRecording ? (
                <div className="flex items-center gap-1 h-full">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-red-500 rounded-full"
                      animate={{ height: ['20%', '100%', '20%'] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">
                  Hold mic to speak
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
