import { useSettings } from "../contexts/SettingsContext";
import { Music, Image as ImageIcon, Lightbulb, Database, Server } from "lucide-react";
import { useState, useEffect } from "react";

export default function IntegrationsWidget() {
  const { settings } = useSettings();
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  useEffect(() => {
    const checkSpotifyStatus = async () => {
      try {
        const res = await fetch("/api/spotify/status");
        const data = await res.json();
        setSpotifyConnected(data.connected);
      } catch (err) {
        console.error("Failed to check Spotify status", err);
      }
    };

    if (settings.integrations.spotify) {
      checkSpotifyStatus();
    }
  }, [settings.integrations.spotify]);

  const handleConnectSpotify = async () => {
    try {
      const authWindow = window.open(
        "",
        "spotify_oauth",
        "width=600,height=700",
      );
      
      if (!authWindow) {
        alert("Please allow popups for this site to connect your account.");
        return;
      }

      const response = await fetch("/api/auth/spotify/url");
      if (!response.ok) throw new Error("Failed to get auth URL");
      const { url } = await response.json();

      authWindow.location.href = url;
    } catch (error) {
      console.error("OAuth error:", error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SPOTIFY_AUTH_SUCCESS") {
        setSpotifyConnected(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const apps = [
    {
      id: "spotify",
      name: "Spotify",
      icon: Music,
      color: "text-green-400",
      bg: "bg-green-400/10",
      connected: spotifyConnected,
      onConnect: handleConnectSpotify,
    },
    {
      id: "pinterest",
      name: "Pinterest",
      icon: ImageIcon,
      color: "text-red-400",
      bg: "bg-red-400/10",
      connected: true,
    },
    {
      id: "hue",
      name: "Philips Hue",
      icon: Lightbulb,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      connected: true,
    },
  ];

  const activeApps = apps.filter((app) => settings.integrations[app.id]);

  const [mcpConnections, setMcpConnections] = useState([
    { id: '1', name: 'Local Database', status: 'connected', type: 'PostgreSQL' },
    { id: '2', name: 'File System', status: 'disconnected', type: 'Local' },
  ]);

  const toggleMcp = (id: string) => {
    setMcpConnections(prev => prev.map(c => 
      c.id === id ? { ...c, status: c.status === 'connected' ? 'disconnected' : 'connected' } : c
    ));
  };

  if (activeApps.length === 0 && mcpConnections.length === 0) return null;

  return (
    <div className="flex flex-col p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full overflow-y-auto custom-scrollbar">
      <span className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
        Connected Apps
      </span>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {activeApps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              className="flex items-center space-x-4 p-3 rounded-2xl bg-aura-bg border border-aura-border"
            >
              <div className={`p-2 rounded-xl ${app.bg}`}>
                <Icon className={`w-5 h-5 ${app.color}`} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-aura-text">{app.name}</div>
                <div className="text-[10px] text-aura-muted uppercase tracking-wider">
                  {app.connected ? "Connected" : "Disconnected"}
                </div>
              </div>
              {!app.connected && app.onConnect && (
                <button
                  onClick={app.onConnect}
                  className="px-3 py-1 text-xs bg-aura-text text-aura-bg rounded-full font-medium"
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-widest text-aura-muted">
          AI MCP Connections
        </span>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Beta</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {mcpConnections.map(mcp => (
          <div key={mcp.id} className="flex items-center justify-between p-3 rounded-2xl bg-aura-bg border border-aura-border group hover:border-aura-text/20 transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${mcp.status === 'connected' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-aura-muted'}`}>
                {mcp.type === 'PostgreSQL' ? <Database className="w-4 h-4" /> : <Server className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-sm font-medium text-aura-text block">{mcp.name}</span>
                <span className="text-[10px] text-aura-muted">{mcp.type}</span>
              </div>
            </div>
            <button 
              onClick={() => toggleMcp(mcp.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                mcp.status === 'connected' 
                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                  : 'bg-white/5 text-aura-muted hover:bg-white/10'
              }`}
            >
              {mcp.status === 'connected' ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
