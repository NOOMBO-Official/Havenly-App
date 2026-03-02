import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Sparkles } from "lucide-react";

export default function AiInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          setInsight("API key missing. Configure GEMINI_API_KEY.");
          setLoading(false);
          return;
        }

        const hour = new Date().getHours();
        let timeOfDay = "day";
        if (hour < 12) timeOfDay = "morning";
        else if (hour < 18) timeOfDay = "afternoon";
        else timeOfDay = "evening";

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate a very short, poetic, and minimalistic aesthetic greeting or insight for a smart home dashboard for the ${timeOfDay}. It should feel calm, luxurious, and welcoming. Max 2 sentences. Do not use quotes.`,
        });

        setInsight(response.text || "Welcome home.");
      } catch (error) {
        console.error("Error fetching AI insight:", error);
        setInsight("Welcome home.");
      } finally {
        setLoading(false);
      }
    }

    fetchInsight();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-aura-border bg-aura-card p-6 backdrop-blur-md">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-aura-border to-transparent pointer-events-none opacity-50" />
      <div className="flex items-start space-x-4 relative z-10">
        <div className="p-3 rounded-full bg-aura-bg border border-aura-border text-aura-text shrink-0 mt-1">
          <Sparkles className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-aura-muted">
            Havenly Intelligence
          </h3>
          {loading ? (
            <div className="animate-pulse flex space-x-2 items-center h-6">
              <div className="h-1.5 w-1.5 bg-aura-muted rounded-full" />
              <div
                className="h-1.5 w-1.5 bg-aura-muted rounded-full"
                style={{ animationDelay: "200ms" }}
              />
              <div
                className="h-1.5 w-1.5 bg-aura-muted rounded-full"
                style={{ animationDelay: "400ms" }}
              />
            </div>
          ) : (
            <p className="text-sm font-light text-aura-text leading-relaxed">
              {insight}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
