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
  const { rooms, toggleDevice, setDeviceState } = useSmartHome();
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
      const apiKey = process.env.GEMINI_API_KEY;
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

      const getWeatherFunction: FunctionDeclaration = {
        name: "getWeather",
        description: "Get the current weather for a specific location.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING, description: "The city and state, e.g., San Francisco, CA" }
          },
          required: ["location"],
        }
      };

      const getSystemStatsFunction: FunctionDeclaration = {
        name: "getSystemStats",
        description: "Get the current system statistics (CPU, RAM, Storage, Network).",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        }
      };

      const systemInstruction = `You are AVA, an advanced smart home assistant for Havenly. User: ${settings?.userName || "User"}. Keep responses concise and helpful.
Current Time: ${new Date().toLocaleString()}
Current Weather Location: ${settings?.weatherLocation}
Smart Home State:
${rooms.map(r => `${r.name} (${r.id}):\n` + r.devices.map(d => `  - ${d.name} (${d.id}): ${d.type}, state: ${d.state}`).join('\n')).join('\n')}
`;

      chatSessionRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [controlSmartHomeFunction, getWeatherFunction, getSystemStatsFunction] }, { googleSearch: {} }]
        }
      });
    }
  }, [isOpen, settings]);

  const handleFunctionCall = async (functionCall: any) => {
    if (functionCall.name === "controlSmartHome") {
      const { roomId, deviceId, action, value } = functionCall.args;
      if (action === 'toggle') toggleDevice(roomId, deviceId);
      else if (action === 'on') setDeviceState(roomId, deviceId, true);
      else if (action === 'off') setDeviceState(roomId, deviceId, false);
      else if (action === 'set' && value !== undefined) setDeviceState(roomId, deviceId, value);
      return { result: `Executed ${action} on ${deviceId}` };
    } else if (functionCall.name === "getWeather") {
      const { location } = functionCall.args;
      try {
        let geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        let geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
          return { error: "Location not found" };
        }
        const { latitude, longitude } = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`);
        const weatherData = await weatherRes.json();
        return { result: weatherData.current };
      } catch (e: any) {
        return { error: e.message };
      }
    } else if (functionCall.name === "getSystemStats") {
      return {
        result: {
          cpu: Math.floor(Math.random() * 40) + 10,
          ram: Math.floor(Math.random() * 30) + 40,
          storage: 65,
          network: {
            down: Math.floor(Math.random() * 100) + 50,
            up: Math.floor(Math.random() * 50) + 10
          }
        }
      };
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
        const functionResponses = await Promise.all(response.functionCalls.map(async (fc: any) => ({
          functionResponse: {
            id: fc.id,
            name: fc.name,
            response: await handleFunctionCall(fc)
          }
        })));
        
        response = await chatSessionRef.current.sendMessage({ 
          message: functionResponses 
        });
      }

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Done.' }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error processing your request: ${error.message || error}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      if (typeof MediaRecorder === 'undefined') {
        alert("Your browser does not support audio recording.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let options: any = {};
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options.mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options.mimeType = 'audio/ogg';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          options.mimeType = 'audio/aac';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const actualMimeType = mediaRecorder.mimeType || options.mimeType || 'audio/webm';
        const cleanMimeType = actualMimeType.split(';')[0];
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          await handleSendAudio(base64data, cleanMimeType);
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
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      
      const historyText = messages.slice(-5).map(m => `${m.role}: ${m.text}`).join('\n');
      
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

      const getWeatherFunction: FunctionDeclaration = {
        name: "getWeather",
        description: "Get the current weather for a specific location.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING, description: "The city and state, e.g., San Francisco, CA" }
          },
          required: ["location"],
        }
      };

      const getSystemStatsFunction: FunctionDeclaration = {
        name: "getSystemStats",
        description: "Get the current system statistics (CPU, RAM, Storage, Network).",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        }
      };

      const systemInstruction = `You are AVA, an advanced smart home assistant for Havenly. User: ${settings?.userName || "User"}. Keep responses concise and helpful.
Current Time: ${new Date().toLocaleString()}
Current Weather Location: ${settings?.weatherLocation}
Smart Home State:
${rooms.map(r => `${r.name} (${r.id}):\n` + r.devices.map(d => `  - ${d.name} (${d.id}): ${d.type}, state: ${d.state}`).join('\n')).join('\n')}
`;

      let response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: `Here is the recent chat history:\n${historyText}\n\nThe user just sent an audio message. Please respond to it.` },
              { inlineData: { mimeType: mimeType, data: base64Audio } }
            ]
          }
        ],
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [controlSmartHomeFunction, getWeatherFunction, getSystemStatsFunction] }, { googleSearch: {} }]
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = await Promise.all(response.functionCalls.map(async (fc: any) => ({
          functionResponse: {
            id: fc.id,
            name: fc.name,
            response: await handleFunctionCall(fc)
          }
        })));
        
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              role: "user",
              parts: [
                { text: `Here is the recent chat history:\n${historyText}\n\nThe user just sent an audio message. Please respond to it.` },
                { inlineData: { mimeType: mimeType, data: base64Audio } }
              ]
            },
            {
              role: "model",
              parts: response.functionCalls.map(fc => ({ functionCall: fc }))
            },
            {
              role: "user",
              parts: functionResponses
            }
          ],
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: [controlSmartHomeFunction, getWeatherFunction, getSystemStatsFunction] }, { googleSearch: {} }]
          }
        });
      }

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Done.' }]);
      
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
