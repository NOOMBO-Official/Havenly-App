import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useSettings } from "./SettingsContext";
import { useSmartHome } from "./SmartHomeContext";
import { useAuth } from "./AuthContext";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

interface AiContextType {
  status: "idle" | "connecting" | "listening" | "speaking" | "error";
  transcript: string;
  isVideoCall: boolean;
  videoStream: MediaStream | null;
  startSession: (withVideo?: boolean) => void;
  stopSession: () => void;
  sendMessage: (text: string) => Promise<string>;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export function AiProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { rooms, toggleDevice, setDeviceState } = useSmartHome();
  
  const [status, setStatus] = useState<"idle" | "connecting" | "listening" | "speaking" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
      }
      synthesisRef.current = window.speechSynthesis;
      
      try {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      } catch (e) {
        console.error("Failed to initialize Gemini API", e);
      }
    }
  }, []);

  const controlDeviceFunctionDeclaration: FunctionDeclaration = {
    name: "controlDevice",
    parameters: {
      type: Type.OBJECT,
      description: "Turn a smart home device on or off.",
      properties: {
        roomName: {
          type: Type.STRING,
          description: "The name of the room the device is in (e.g., 'Living Room', 'Kitchen').",
        },
        deviceName: {
          type: Type.STRING,
          description: "The name of the device (e.g., 'Main Lights', 'Thermostat').",
        },
        state: {
          type: Type.BOOLEAN,
          description: "True to turn on, false to turn off.",
        },
      },
      required: ["roomName", "deviceName", "state"],
    },
  };

  const executeFunctionCall = (name: string, args: any) => {
    if (name === 'controlDevice') {
      const { roomName, deviceName, state } = args;
      const room = rooms.find(r => r.name.toLowerCase() === roomName.toLowerCase());
      if (room) {
        const device = room.devices.find(d => d.name.toLowerCase() === deviceName.toLowerCase());
        if (device) {
          setDeviceState(room.id, device.id, state);
          return `Turned ${state ? 'on' : 'off'} ${deviceName} in ${roomName}.`;
        }
      }
      return `Could not find ${deviceName} in ${roomName}.`;
    }
    return "Function not found.";
  };

  const sendMessage = async (text: string): Promise<string> => {
    if (!aiRef.current) return "AI not initialized.";
    
    try {
      const response = await aiRef.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: `You are AVA, an advanced smart home assistant for Havenly. The user's name is ${settings?.userName || "User"}. Keep responses concise, helpful, and conversational. Do not use markdown. You can control smart home devices.`,
          tools: [{ functionDeclarations: [controlDeviceFunctionDeclaration] }],
        }
      });

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        let resultMessage = "";
        for (const call of functionCalls) {
          resultMessage += executeFunctionCall(call.name, call.args) + " ";
        }
        return resultMessage.trim() || "Done.";
      }

      return response.text || "I'm not sure what to say.";
    } catch (err) {
      console.error("AI processing error:", err);
      return "Sorry, I encountered an error processing your request.";
    }
  };

  const processWithAI = async (text: string) => {
    setStatus("connecting");
    setTranscript("Thinking...");
    
    try {
      const reply = await sendMessage(text);
      setTranscript(reply);
      speakResponse(reply);
    } catch (err) {
      console.error("AI processing error:", err);
      setStatus("error");
      setTranscript("Sorry, I couldn't process that.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const speakResponse = (text: string) => {
    if (!synthesisRef.current) return;
    
    setStatus("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Siri')) || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setStatus("idle");
      setTranscript("");
    };
    
    utterance.onerror = () => {
      setStatus("error");
      setTranscript("Error speaking.");
    };

    synthesisRef.current.speak(utterance);
  };

  const startSession = async (withVideo: boolean = false) => {
    if (status !== "idle" && status !== "error") return;
    
    setIsVideoCall(withVideo);
    
    if (withVideo) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setVideoStream(stream);
      } catch (err) {
        console.error("Failed to get video stream:", err);
        setIsVideoCall(false);
      }
    }

    if (!recognitionRef.current) {
      setStatus("error");
      setTranscript("Speech recognition not supported.");
      return;
    }

    setStatus("listening");
    setTranscript("Listening...");

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        recognitionRef.current.stop();
        processWithAI(finalTranscript);
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setStatus("error");
      setTranscript("Microphone error.");
      setTimeout(() => setStatus("idle"), 3000);
    };

    recognitionRef.current.onend = () => {
      if (statusRef.current === "listening") {
        setStatus("idle");
        setTranscript("");
      }
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
      setStatus("error");
    }
  };

  const stopSession = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    if (videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
    }
    setStatus("idle");
    setTranscript("");
    setIsVideoCall(false);
    setVideoStream(null);
  };

  return (
    <AiContext.Provider value={{ status, transcript, isVideoCall, videoStream, startSession, stopSession, sendMessage }}>
      {children}
    </AiContext.Provider>
  );
}

export function useAi() {
  const context = useContext(AiContext);
  if (!context) throw new Error("useAi must be used within AiProvider");
  return context;
}
