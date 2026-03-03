import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, Square, Loader2, Bot, User } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { useSettings } from '../contexts/SettingsContext';
import { useSmartHome } from '../contexts/SmartHomeContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
  isAudio?: boolean;
}

export default function AiChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { settings } = useSettings();
  const { toggleDevice, setDeviceState } = useSmartHome();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi ${settings?.userName || 'there'}! I'm AVA. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Initialize Chat Session
  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) return;
      
      const ai = new GoogleGenAI({ apiKey });
      
      const controlSmartHomeFunction: FunctionDeclaration = {
        name: "controlSmartHome",
        description: "Control smart home devices like lights, TVs, thermostats, fans, and speakers.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            roomId: { type: Type.STRING },
            deviceId: { type: Type.STRING },
            action: { type: Type.STRING },
            value: { type: Type.NUMBER }
          },
          required: ["roomId", "deviceId", "action"],
        }
      };

      chatSessionRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are AVA, an advanced smart home assistant for Havenly. User: ${settings?.userName || "User"}. Keep responses concise and helpful.`,
          tools: [{ functionDeclarations: [controlSmartHomeFunction] }]
        }
      });
    }
  }, [isOpen, settings]);

  const handleFunctionCall = (functionCall: any) => {
    if (functionCall.name === "controlSmartHome") {
      const { roomId, deviceId, action, value } = functionCall.args;
      if (action === 'toggle') toggleDevice(roomId, deviceId);
      else if (action === 'on') setDeviceState(roomId, deviceId, true);
      else if (action === 'off') setDeviceState(roomId, deviceId, false);
      else if (action === 'set' && value !== undefined) setDeviceState(roomId, deviceId, value);
      return { result: `Executed ${action} on ${deviceId}` };
    }
    return { error: "Unknown function" };
  };

  const handleSendText = async () => {
    if (!input.trim() || !chatSessionRef.current) return;
    
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsProcessing(true);

    try {
      let response = await chatSessionRef.current.sendMessage({ message: userText });
      
      // Handle tool calls if any
      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = response.functionCalls.map((fc: any) => ({
          id: fc.id,
          name: fc.name,
          response: handleFunctionCall(fc)
        }));
        
        response = await chatSessionRef.current.sendMessage({ 
          message: functionResponses // Note: In standard chat, we might need to format this differently or use generateContent for multi-turn tool calls.
          // For simplicity, we'll just append a text message if tool calls fail, but let's try standard tool response.
        });
      }

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Done.' }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          await handleSendAudio(base64data, mimeType);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Microphone access is required for voice chat.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendAudio = async (base64Audio: string, mimeType: string) => {
    setMessages(prev => [...prev, { role: 'user', text: "🎤 Voice Message", isAudio: true }]);
    
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      
      // We use generateContent to transcribe and respond to the audio
      // We'll pass the recent chat history as context
      const historyText = messages.slice(-5).map(m => `${m.role}: ${m.text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              { text: `Here is the recent chat history:\n${historyText}\n\nThe user just sent an audio message. Please respond to it.` },
              { inlineData: { mimeType: mimeType, data: base64Audio } }
            ]
          }
        ]
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Done.' }]);
      
      // Sync it back to the chat session if possible, though ai.chats doesn't easily accept audio parts in sendMessage yet.
      // We'll just keep it in the UI state.
    } catch (error) {
      console.error("Audio processing error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I couldn't process that audio." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed inset-4 md:inset-auto md:bottom-24 md:right-8 md:w-[400px] md:h-[600px] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-white">AVA Chat</span>
            </div>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-gradient-to-tr from-blue-500 to-purple-500'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/90'}`}>
                  {msg.isAudio ? (
                    <div className="flex items-center gap-2 font-medium">
                      <Mic className="w-4 h-4" /> Voice Message
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                  <span className="text-white/50 text-sm">AVA is thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/40">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-white/30 transition-colors">
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
                  className="w-full bg-transparent text-white px-4 py-3 max-h-32 min-h-[44px] resize-none focus:outline-none"
                  rows={1}
                />
              </div>
              
              {input.trim() ? (
                <button
                  onClick={handleSendText}
                  disabled={isProcessing}
                  className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0"
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
                  className={`p-3 rounded-xl transition-all shrink-0 ${isRecording ? 'bg-red-500 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
                {isRecording ? 'Release to send' : 'Hold mic to speak'}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
