import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a helpful assistant.",
        tools: [{
          functionDeclarations: [{
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
          }]
        }]
      }
    });

    console.log("Sending message...");
    const response = await chat.sendMessage({ message: "Hello" });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
