import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function AiInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      try {
        const hour = new Date().getHours();
        let timeOfDay = "day";
        if (hour < 12) timeOfDay = "morning";
        else if (hour < 18) timeOfDay = "afternoon";
        else timeOfDay = "evening";

        const response = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: `Generate a very short, poetic, and minimalistic aesthetic greeting or insight for a smart home dashboard for the ${timeOfDay}. It should feel calm, luxurious, and welcoming. Max 2 sentences. Do not use quotes.` }
            ]
          })
        });
        const text = await response.text();

        setInsight(text || "Welcome home.");
      } catch (error: any) {
        console.error("Error generating AI insight:", error);
        setInsight(`Error: ${error.message || "Failed to load insight"}`);
      } finally {
        setLoading(false);
      }
    }

    fetchInsight();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[24px] apple-glass-heavy p-6 border border-white/10 shadow-sm">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-50" />
      <div className="flex items-start space-x-4 relative z-10">
        <div className="p-3 rounded-full bg-white/10 border border-white/5 text-white shrink-0 mt-1 shadow-inner">
          <Sparkles className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="text-[10px] font-medium uppercase tracking-widest text-white/50">
            Havenly Intelligence
          </h3>
          {loading ? (
            <div className="animate-pulse flex space-x-2 items-center h-6">
              <div className="h-1.5 w-1.5 bg-white/50 rounded-full" />
              <div
                className="h-1.5 w-1.5 bg-white/50 rounded-full"
                style={{ animationDelay: "200ms" }}
              />
              <div
                className="h-1.5 w-1.5 bg-white/50 rounded-full"
                style={{ animationDelay: "400ms" }}
              />
            </div>
          ) : (
            <p className="text-sm font-medium text-white leading-relaxed tracking-tight">
              {insight}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
