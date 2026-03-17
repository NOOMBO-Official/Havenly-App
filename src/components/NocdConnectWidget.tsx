import { useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, Activity, Terminal, Plus, X, Settings2, Power, 
  RefreshCw, WifiOff, Code, Play, Save, Trash2, Server, DownloadCloud, CheckCircle2
} from "lucide-react";

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'syncing';
  lastSeen: string;
  ip: string;
  board?: string;
  firmwareVersion?: string;
}

interface Automation {
  id: string;
  name: string;
  conditionDevice: string;
  conditionProperty: string;
  conditionOperator: string;
  conditionValue: string;
  actionDevice: string;
  actionCommand: string;
  active: boolean;
}

interface Sketch {
  id: string;
  name: string;
  code: string;
  deviceId: string;
}

export default function NocdConnectWidget() {
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'devices' | 'automations' | 'arduino' | 'ota'>('devices');
  
  // State
  const [devices, setDevices] = useState<Device[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  
  const [showAddAutomation, setShowAddAutomation] = useState(false);
  const [newAutomation, setNewAutomation] = useState<Partial<Automation>>({ conditionOperator: '>', active: true });
  
  const [showAddSketch, setShowAddSketch] = useState(false);
  const [newSketch, setNewSketch] = useState<Partial<Sketch>>({});

  // OTA State
  const [otaTarget, setOtaTarget] = useState<string | null>(null);
  const [otaStatus, setOtaStatus] = useState<'idle' | 'checking' | 'downloading' | 'flashing' | 'complete' | 'error'>('idle');
  const [otaProgress, setOtaProgress] = useState(0);
  const [otaLogs, setOtaLogs] = useState<string[]>([]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'devices_update') {
          setDevices(data.devices);
        } else if (data.type === 'ota_progress') {
          if (data.deviceId === otaTarget) {
            setOtaStatus(data.status);
            setOtaProgress(data.progress);
            if (data.log) {
              setOtaLogs(prev => [...prev, data.log]);
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [otaTarget]);

  const startOtaUpdate = async (deviceId: string) => {
    setOtaTarget(deviceId);
    setOtaStatus('checking');
    setOtaProgress(0);
    setOtaLogs(['Initializing real OTA update sequence...', `Sending OTA command to device ${deviceId}...`]);

    try {
      const res = await fetch(`/api/devices/${deviceId}/ota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmwareUrl: 'http://example.com/firmware.bin' })
      });
      
      if (!res.ok) {
        throw new Error('Device not found or offline');
      }
      
      setOtaLogs(prev => [...prev, 'Command sent successfully. Waiting for device response...']);
    } catch (err) {
      setOtaStatus('error');
      setOtaLogs(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    }
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;

  useEffect(() => {
    fetch('/api/automations').then(res => res.json()).then(setAutomations).catch(console.error);
    fetch('/api/sketches').then(res => res.json()).then(setSketches).catch(console.error);
  }, []);

  const handleAddAutomation = async () => {
    if (newAutomation.name && newAutomation.conditionDevice && newAutomation.actionDevice) {
      try {
        const res = await fetch('/api/automations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newAutomation.name,
            conditionDevice: newAutomation.conditionDevice,
            conditionProperty: newAutomation.conditionProperty || '',
            conditionOperator: newAutomation.conditionOperator || '>',
            conditionValue: newAutomation.conditionValue || '',
            actionDevice: newAutomation.actionDevice,
            actionCommand: newAutomation.actionCommand || '',
            active: true
          })
        });
        const data = await res.json();
        setAutomations([...automations, data]);
        setShowAddAutomation(false);
        setNewAutomation({ conditionOperator: '>', active: true });
      } catch (e) {
        console.error('Failed to add automation', e);
      }
    }
  };

  const handleAddSketch = async () => {
    if (newSketch.name && newSketch.deviceId) {
      try {
        const res = await fetch('/api/sketches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newSketch.name,
            code: newSketch.code || '',
            deviceId: newSketch.deviceId
          })
        });
        const data = await res.json();
        setSketches([...sketches, data]);
        setShowAddSketch(false);
        setNewSketch({ code: 'void setup() {\n  \n}\n\nvoid loop() {\n  \n}' });
      } catch (e) {
        console.error('Failed to add sketch', e);
      }
    }
  };

  const toggleAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;
    try {
      await fetch(`/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !automation.active })
      });
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    } catch (e) {
      console.error('Failed to toggle automation', e);
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE' });
      setAutomations(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error('Failed to delete automation', e);
    }
  };

  const deleteSketch = async (id: string) => {
    try {
      await fetch(`/api/sketches/${id}`, { method: 'DELETE' });
      setSketches(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error('Failed to delete sketch', e);
    }
  };

  const groupedDevices = devices.reduce((acc, device) => {
    if (!acc[device.type]) acc[device.type] = [];
    acc[device.type].push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'online') {
      return (
        <div className="relative flex items-center justify-center w-6 h-6">
          <div className="absolute w-full h-full bg-emerald-500 rounded-full animate-ping opacity-20" />
          <div className="absolute w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
        </div>
      );
    }
    if (status === 'syncing') {
      return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
    }
    return <WifiOff className="w-5 h-5 text-gray-500" />;
  };

  return (
    <>
      <motion.div 
        layoutId="nocd-connect-widget"
        className="flex flex-col p-6 rounded-[32px] border border-white/10 apple-glass-heavy h-full cursor-pointer group relative overflow-hidden shadow-sm"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          if (settings.tapToExpand) setIsExpanded(true);
        }}
      >
        {settings.tapToExpand && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">
            <span className="text-white font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
              Tap to Manage Devices
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium uppercase tracking-widest text-aura-muted">
              nocdCONNECT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 border border-white/5">
              <div className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-xs font-mono text-aura-muted">{onlineCount}/{devices.length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="text-2xl font-display font-medium text-aura-text mb-1">
            Network of Cloud Devices
          </div>
          <p className="text-sm text-aura-muted mb-6">
            {devices.length === 0 ? 'No devices connected' : `${onlineCount} micro-controllers active`}
          </p>

          <div className="flex -space-x-2 overflow-hidden">
            {devices.slice(0, 4).map((device, i) => (
              <div 
                key={device.id} 
                className={`w-10 h-10 rounded-full border-2 border-aura-card flex items-center justify-center text-xs font-bold ${
                  device.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 
                  device.status === 'syncing' ? 'bg-blue-500/20 text-blue-400' : 
                  'bg-gray-500/20 text-gray-400'
                }`}
                style={{ zIndex: 10 - i }}
                title={device.name}
              >
                {device.type.substring(0, 2).toUpperCase()}
              </div>
            ))}
            {devices.length > 4 && (
              <div className="w-10 h-10 rounded-full border-2 border-aura-card bg-white/5 flex items-center justify-center text-xs font-bold text-aura-muted z-0">
                +{devices.length - 4}
              </div>
            )}
            {devices.length === 0 && (
              <div className="w-10 h-10 rounded-full border-2 border-aura-card bg-white/5 flex items-center justify-center text-aura-muted border-dashed">
                <Plus className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              layoutId="nocd-connect-widget"
              className="w-full max-w-6xl h-full max-h-[850px] rounded-[40px] border border-white/10 apple-glass-heavy relative overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                    <Cpu className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display text-aura-text">nocdCONNECT</h2>
                    <p className="text-aura-muted">Network of Cloud Devices</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
                    <button 
                      onClick={() => setActiveTab('devices')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'devices' ? 'bg-white/10 text-white' : 'text-aura-muted hover:text-white'}`}
                    >
                      Devices
                    </button>
                    <button 
                      onClick={() => setActiveTab('automations')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'automations' ? 'bg-white/10 text-white' : 'text-aura-muted hover:text-white'}`}
                    >
                      Automations
                    </button>
                    <button 
                      onClick={() => setActiveTab('arduino')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'arduino' ? 'bg-white/10 text-white' : 'text-aura-muted hover:text-white'}`}
                    >
                      Arduino Hub
                    </button>
                    <button 
                      onClick={() => setActiveTab('ota')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ota' ? 'bg-white/10 text-white' : 'text-aura-muted hover:text-white'}`}
                    >
                      OTA Updates
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="p-4 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors ml-4 border border-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {activeTab === 'devices' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-display text-aura-text flex items-center gap-2">
                        <Server className="w-5 h-5 text-indigo-400" />
                        Device Network
                      </h3>
                    </div>

                    {devices.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                        <Cpu className="w-12 h-12 text-aura-muted mx-auto mb-4 opacity-50" />
                        <p className="text-aura-text font-medium">No devices connected</p>
                        <p className="text-sm text-aura-muted mt-1">Waiting for devices to connect via WebSocket...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-8">
                        {Object.entries(groupedDevices).map(([type, typeDevices]) => (
                          <div key={type} className="space-y-4">
                            <h4 className="text-sm font-medium text-aura-muted uppercase tracking-wider pl-2 border-l-2 border-indigo-500/50">{type}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {typeDevices.map(device => (
                                <div key={device.id} className="p-5 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors group relative">
                                  <div className="flex justify-between items-start mb-4 pr-6">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-3 rounded-xl ${
                                        device.status === 'online' ? 'bg-emerald-500/10 border border-emerald-500/20' : 
                                        device.status === 'syncing' ? 'bg-blue-500/10 border border-blue-500/20' : 
                                        'bg-gray-500/10 border border-gray-500/20'
                                      }`}>
                                        <StatusIcon status={device.status} />
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-medium text-aura-text">{device.name}</h4>
                                        <p className="text-xs text-aura-muted">{device.board || device.type}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div>
                                      <div className="text-[10px] text-aura-muted uppercase tracking-wider mb-1">Status</div>
                                      <div 
                                        className={`text-xs font-medium capitalize px-2 py-1 rounded-md border inline-block ${
                                          device.status === 'online' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 
                                          device.status === 'syncing' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 
                                          'text-gray-400 border-gray-500/30 bg-gray-500/10'
                                        }`}
                                      >
                                        {device.status}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] text-aura-muted uppercase tracking-wider mb-1">IP Address</div>
                                      <div className="text-xs font-mono text-aura-text">{device.ip}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'automations' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-display text-aura-text flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-indigo-400" />
                        Automations
                      </h3>
                      <button 
                        onClick={() => setShowAddAutomation(true)}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Create Automation
                      </button>
                    </div>

                    {showAddAutomation && (
                      <div className="p-6 rounded-2xl bg-black/20 border border-indigo-500/30 mb-8">
                        <h4 className="text-lg font-medium text-white mb-4">New Automation</h4>
                        <div className="space-y-4">
                          <input 
                            type="text" 
                            placeholder="Automation Name (e.g., Turn on fan when hot)" 
                            value={newAutomation.name || ''}
                            onChange={e => setNewAutomation({...newAutomation, name: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                          />
                          
                          <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                            <div className="text-sm font-medium text-aura-muted mb-3">IF (Condition)</div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <select 
                                value={newAutomation.conditionDevice || ''}
                                onChange={e => setNewAutomation({...newAutomation, conditionDevice: e.target.value})}
                                className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                              >
                                <option value="">Select Device...</option>
                                {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                              </select>
                              <span className="text-aura-muted text-sm">reports</span>
                              <input 
                                type="text" 
                                placeholder="Property (e.g., temperature)" 
                                value={newAutomation.conditionProperty || ''}
                                onChange={e => setNewAutomation({...newAutomation, conditionProperty: e.target.value})}
                                className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none w-32"
                              />
                              <select 
                                value={newAutomation.conditionOperator || '>'}
                                onChange={e => setNewAutomation({...newAutomation, conditionOperator: e.target.value})}
                                className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                              >
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                                <option value="==">==</option>
                                <option value="!=">!=</option>
                              </select>
                              <input 
                                type="text" 
                                placeholder="Value (e.g., 80)" 
                                value={newAutomation.conditionValue || ''}
                                onChange={e => setNewAutomation({...newAutomation, conditionValue: e.target.value})}
                                className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none w-24"
                              />
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                            <div className="text-sm font-medium text-aura-muted mb-3">THEN (Action)</div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-aura-muted text-sm">Set</span>
                              <select 
                                value={newAutomation.actionDevice || ''}
                                onChange={e => setNewAutomation({...newAutomation, actionDevice: e.target.value})}
                                className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                              >
                                <option value="">Select Device...</option>
                                {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                              </select>
                              <span className="text-aura-muted text-sm">to</span>
                              <input 
                                type="text" 
                                placeholder="Command (e.g., ON)" 
                                value={newAutomation.actionCommand || ''}
                                onChange={e => setNewAutomation({...newAutomation, actionCommand: e.target.value})}
                                className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none flex-1 min-w-[150px]"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                          <button onClick={() => setShowAddAutomation(false)} className="px-4 py-2 rounded-xl text-aura-muted hover:text-white">Cancel</button>
                          <button onClick={handleAddAutomation} className="px-4 py-2 bg-indigo-500 text-white rounded-xl">Save Automation</button>
                        </div>
                      </div>
                    )}

                    {automations.length === 0 && !showAddAutomation ? (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                        <Activity className="w-12 h-12 text-aura-muted mx-auto mb-4 opacity-50" />
                        <p className="text-aura-text font-medium">No automations created</p>
                        <p className="text-sm text-aura-muted mt-1">Create rules to automate your devices.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {automations.map(auto => {
                          const condDevice = devices.find(d => d.id === auto.conditionDevice)?.name || 'Unknown Device';
                          const actDevice = devices.find(d => d.id === auto.actionDevice)?.name || 'Unknown Device';
                          
                          return (
                            <div key={auto.id} className={`p-5 rounded-2xl border transition-colors flex items-center justify-between ${auto.active ? 'bg-black/20 border-white/10' : 'bg-black/10 border-white/5 opacity-60'}`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-medium text-white">{auto.name}</h4>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${auto.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {auto.active ? 'Active' : 'Paused'}
                                  </span>
                                </div>
                                <div className="text-sm text-aura-muted flex flex-wrap items-center gap-1.5">
                                  <span className="text-indigo-400 font-medium">IF</span>
                                  <span className="text-white bg-white/5 px-2 py-0.5 rounded">{condDevice}</span>
                                  <span>{auto.conditionProperty}</span>
                                  <span className="font-mono text-white">{auto.conditionOperator}</span>
                                  <span className="text-white bg-white/5 px-2 py-0.5 rounded">{auto.conditionValue}</span>
                                  <span className="text-indigo-400 font-medium ml-2">THEN</span>
                                  <span className="text-white bg-white/5 px-2 py-0.5 rounded">{actDevice}</span>
                                  <span>&rarr;</span>
                                  <span className="font-mono text-white">{auto.actionCommand}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <button 
                                  onClick={() => toggleAutomation(auto.id)}
                                  className={`w-12 h-6 rounded-full transition-colors relative ${auto.active ? 'bg-indigo-500' : 'bg-white/10'}`}
                                >
                                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${auto.active ? 'left-7' : 'left-1'}`} />
                                </button>
                                <button onClick={() => deleteAutomation(auto.id)} className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'arduino' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-display text-aura-text flex items-center gap-2">
                        <Code className="w-5 h-5 text-indigo-400" />
                        Arduino Hub
                      </h3>
                      <button 
                        onClick={() => setShowAddSketch(true)}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> New Sketch
                      </button>
                    </div>

                    {showAddSketch && (
                      <div className="p-6 rounded-2xl bg-black/20 border border-indigo-500/30 mb-8">
                        <h4 className="text-lg font-medium text-white mb-4">Create Sketch</h4>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <input 
                              type="text" 
                              placeholder="Sketch Name" 
                              value={newSketch.name || ''}
                              onChange={e => setNewSketch({...newSketch, name: e.target.value})}
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                            />
                            <select 
                              value={newSketch.deviceId || ''}
                              onChange={e => setNewSketch({...newSketch, deviceId: e.target.value})}
                              className="bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 w-64"
                            >
                              <option value="">Target Arduino...</option>
                              {devices.filter(d => d.type === 'Arduino').map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.board})</option>
                              ))}
                            </select>
                          </div>
                          <div className="relative">
                            <textarea 
                              value={newSketch.code || ''}
                              onChange={e => setNewSketch({...newSketch, code: e.target.value})}
                              className="w-full h-64 bg-[#1e1e1e] border border-white/10 rounded-xl p-4 text-green-400 font-mono text-sm focus:outline-none focus:border-indigo-500 resize-none"
                              spellCheck="false"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button onClick={() => setShowAddSketch(false)} className="px-4 py-2 rounded-xl text-aura-muted hover:text-white">Cancel</button>
                          <button onClick={handleAddSketch} className="px-4 py-2 bg-indigo-500 text-white rounded-xl flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Sketch
                          </button>
                        </div>
                      </div>
                    )}

                    {sketches.length === 0 && !showAddSketch ? (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                        <Code className="w-12 h-12 text-aura-muted mx-auto mb-4 opacity-50" />
                        <p className="text-aura-text font-medium">No sketches found</p>
                        <p className="text-sm text-aura-muted mt-1">Write and upload code to your Arduino boards.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {sketches.map(sketch => {
                          const targetDevice = devices.find(d => d.id === sketch.deviceId);
                          return (
                            <div key={sketch.id} className="flex flex-col rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                                <div>
                                  <h4 className="font-medium text-white">{sketch.name}</h4>
                                  <p className="text-xs text-aura-muted mt-0.5">
                                    Target: {targetDevice ? `${targetDevice.name} (${targetDevice.board})` : 'Unknown Device'}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
                                    title="Verify & Upload"
                                  >
                                    <Play className="w-3.5 h-3.5" /> Upload
                                  </button>
                                  <button onClick={() => deleteSketch(sketch.id)} className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="p-4 bg-[#1e1e1e] overflow-x-auto">
                                <pre className="text-xs font-mono text-green-400/90 m-0">
                                  <code>{sketch.code}</code>
                                </pre>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'ota' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-display text-aura-text flex items-center gap-2">
                        <DownloadCloud className="w-5 h-5 text-indigo-400" />
                        OTA Firmware Updates
                      </h3>
                    </div>

                    {devices.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                        <Server className="w-12 h-12 text-aura-muted mx-auto mb-4 opacity-50" />
                        <p className="text-aura-text font-medium">No devices available</p>
                        <p className="text-sm text-aura-muted mt-1">Connect devices to manage their firmware.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-aura-muted uppercase tracking-wider pl-2 border-l-2 border-indigo-500/50">Available Devices</h4>
                          <div className="space-y-3">
                            {devices.map(device => (
                              <div key={device.id} className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-white">{device.name}</h4>
                                    <span className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                  </div>
                                  <div className="text-xs text-aura-muted flex gap-3">
                                    <span>{device.type} {device.board ? `(${device.board})` : ''}</span>
                                    <span>Firmware: <span className="text-indigo-400 font-mono">{device.firmwareVersion || 'v1.0.0'}</span></span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => startOtaUpdate(device.id)}
                                  disabled={device.status !== 'online' || (otaStatus !== 'idle' && otaStatus !== 'complete' && otaStatus !== 'error')}
                                  className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                                >
                                  <DownloadCloud className="w-3.5 h-3.5" /> Update
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col h-full min-h-[400px] rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden relative">
                          <div className="p-3 border-b border-white/5 bg-black/40 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-aura-muted" />
                            <span className="text-xs font-medium text-aura-muted uppercase tracking-wider">OTA Terminal</span>
                            {otaStatus !== 'idle' && (
                              <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                                {otaStatus.toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar flex flex-col gap-1">
                            {otaLogs.length === 0 ? (
                              <div className="text-gray-600 italic mt-auto mb-auto text-center">Waiting for OTA sequence to initiate...</div>
                            ) : (
                              otaLogs.map((log, i) => (
                                <div key={i} className="text-green-400/90 break-all">
                                  <span className="text-gray-500 mr-2">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                                  {log}
                                </div>
                              ))
                            )}
                            {otaStatus === 'flashing' && (
                              <div className="mt-4">
                                <div className="flex justify-between text-[10px] text-aura-muted mb-1">
                                  <span>Flashing Progress</span>
                                  <span>{otaProgress}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 transition-all duration-300"
                                    style={{ width: `${otaProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {otaStatus === 'complete' && (
                              <div className="mt-4 flex items-center gap-2 text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Update applied successfully.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
