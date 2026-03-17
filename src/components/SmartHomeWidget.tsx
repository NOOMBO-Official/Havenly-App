import { useState } from "react";
import { useSettings } from "../contexts/SettingsContext";
import {
  Lightbulb,
  Tv,
  Thermometer,
  Lock,
  Fan,
  Speaker,
  Power,
  X,
  Home,
  Settings2,
  Activity,
  Plus,
  Trash2
} from "lucide-react";
import { useSmartHome, Device } from "../contexts/SmartHomeContext";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "../utils/haptics";

export default function SmartHomeWidget() {
  const { rooms, toggleDevice, addRoom, addDevice, deleteDevice } = useSmartHome();
  const [activeRoom, setActiveRoom] = useState<string>(rooms[0]?.id || '');
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleToggleDevice = (roomId: string, deviceId: string) => {
    if (settings.hapticsEnabled) {
      triggerHaptic('light');
    }
    toggleDevice(roomId, deviceId);
  };

  const getIcon = (type: string, state: any, large = false) => {
    const props = {
      className: `${large ? 'w-8 h-8' : 'w-6 h-6'} ${state ? "text-white" : "text-aura-muted"}`,
      strokeWidth: 1.5,
    };
    switch (type) {
      case "light":
        return <Lightbulb {...props} fill={state ? "currentColor" : "none"} />;
      case "tv":
        return <Tv {...props} />;
      case "thermostat":
        return <Thermometer {...props} />;
      case "lock":
        return <Lock {...props} />;
      case "fan":
        return <Fan {...props} className={state ? "animate-spin-slow" : ""} />;
      case "speaker":
        return <Speaker {...props} />;
      default:
        return <Power {...props} />;
    }
  };

  const currentRoom = rooms.find((r) => r.id === activeRoom) || rooms[0];

  const activeDevicesCount = rooms.reduce((acc, room) => 
    acc + room.devices.filter(d => d.state === true || typeof d.state === 'number').length, 0
  );

  const handleAddRoom = () => {
    const name = prompt("Enter room name:");
    if (name) {
      addRoom(name);
      if (!activeRoom) setActiveRoom(name.toLowerCase().replace(/\s+/g, '_'));
    }
  };

  const handleAddDevice = () => {
    if (!currentRoom) return;
    const name = prompt("Enter device name:");
    if (!name) return;
    const typeStr = prompt("Enter device type (light, tv, thermostat, lock, fan, speaker):", "light");
    if (!typeStr) return;
    
    const validTypes = ['light', 'tv', 'thermostat', 'lock', 'fan', 'speaker'];
    const type = validTypes.includes(typeStr) ? typeStr as Device['type'] : 'light';
    
    addDevice(currentRoom.id, {
      name,
      type,
      state: type === 'thermostat' ? 72 : false
    });
  };

  return (
    <>
      <motion.div 
        layoutId="smarthome-widget"
        className="flex flex-col p-5 rounded-[32px] apple-glass-heavy h-full cursor-pointer group relative overflow-hidden"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          if (settings.tapToExpand) setIsExpanded(true);
        }}
      >
        {/* Quick Action Overlay */}
        {settings.tapToExpand && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">
            <span className="text-white font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
              Tap to Expand
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2 text-orange-500">
            <Home className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-aura-text tracking-tight">Home</h2>
          </div>

          <div className="flex space-x-1.5 bg-black/10 dark:bg-white/5 p-1 rounded-full border border-white/5">
            {rooms.slice(0, 3).map((room) => (
              <button
                key={room.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveRoom(room.id);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  (activeRoom || rooms[0]?.id) === room.id
                    ? "bg-white text-black shadow-sm"
                    : "text-aura-muted hover:text-aura-text"
                }`}
              >
                {room.name.split(' ')[0]}
              </button>
            ))}
            {rooms.length === 0 && (
              <span className="px-3 py-1 text-xs font-medium text-aura-muted">No Rooms</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 relative z-10">
          {currentRoom?.devices.slice(0, 4).map((device) => (
            <button
              key={device.id}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleDevice(currentRoom.id, device.id);
              }}
              className={`flex flex-col justify-between p-3.5 rounded-[20px] transition-all h-[100px] ${
                device.state
                  ? "bg-white text-black shadow-md"
                  : "apple-btn text-aura-text hover:bg-black/10 dark:hover:bg-white/10"
              }`}
            >
              <div className="flex justify-between items-start w-full">
                {getIcon(device.type, device.state)}
                <div
                  className={`w-1.5 h-1.5 rounded-full ${device.state ? "bg-orange-500" : "bg-aura-muted/50"}`}
                />
              </div>
              <div className="text-left w-full">
                <div className="text-[13px] font-semibold truncate leading-tight">{device.name}</div>
                <div
                  className={`text-[11px] font-medium ${device.state ? "text-black/60" : "text-aura-muted"}`}
                >
                  {typeof device.state === "boolean"
                    ? device.state
                      ? "On"
                      : "Off"
                    : device.state}
                </div>
              </div>
            </button>
          ))}
          {(!currentRoom || currentRoom.devices.length === 0) && (
            <div className="col-span-full text-center text-aura-muted text-sm py-4">
              No devices found. Tap to expand and add some.
            </div>
          )}
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
              layoutId="smarthome-widget"
              className="w-full max-w-6xl h-full max-h-[800px] rounded-[3rem] border border-white/10 dark:border-white/5 bg-black/5 dark:bg-white/5 backdrop-blur-3xl relative overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-white/10 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-500">
                    <Home className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-aura-text">Home Control</h2>
                    <p className="text-aura-muted font-medium">{activeDevicesCount} devices active</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-aura-text transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar - Rooms */}
                <div className="w-full md:w-64 border-r border-white/10 dark:border-white/5 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted">Rooms</h3>
                    {isEditMode && (
                      <button onClick={handleAddRoom} className="p-1 text-aura-muted hover:text-aura-text">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {rooms.map((room) => {
                      const activeInRoom = room.devices.filter(d => d.state === true || typeof d.state === 'number').length;
                      return (
                        <button
                          key={room.id}
                          onClick={() => setActiveRoom(room.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                            (activeRoom || rooms[0]?.id) === room.id
                              ? "bg-orange-500/10 border border-orange-500/30 text-orange-500"
                              : "bg-transparent border border-transparent text-aura-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-aura-text"
                          }`}
                        >
                          <span className="font-medium">{room.name}</span>
                          {activeInRoom > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${(activeRoom || rooms[0]?.id) === room.id ? 'bg-orange-500/20' : 'bg-white/10 dark:bg-black/10'}`}>
                              {activeInRoom}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {rooms.length === 0 && (
                      <div className="text-sm text-aura-muted text-center py-4">No rooms added.</div>
                    )}
                  </div>

                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mt-8 mb-4">Quick Scenes</h3>
                  <div className="space-y-2">
                    {['Good Morning', 'Leaving Home', 'Movie Night', 'Goodnight'].map(scene => (
                      <button key={scene} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 text-aura-text hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left">
                        <Activity className="w-4 h-4 text-aura-muted" />
                        <span className="font-medium text-sm">{scene}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Content - Devices in Room */}
                <div className="flex-1 p-8 overflow-y-auto bg-black/5 dark:bg-white/5">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-aura-text">{currentRoom?.name || 'No Room Selected'}</h3>
                      <p className="text-aura-muted mt-1 font-medium">{currentRoom?.devices.length || 0} devices</p>
                    </div>
                    <button 
                      onClick={() => setIsEditMode(!isEditMode)}
                      className={`p-3 border rounded-xl transition-colors ${isEditMode ? 'bg-orange-500/20 border-orange-500/50 text-orange-500' : 'bg-black/5 dark:bg-white/5 border-white/10 dark:border-white/5 text-aura-text hover:bg-black/10 dark:hover:bg-white/5'}`}
                    >
                      <Settings2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentRoom?.devices.map((device) => (
                      <div
                        key={device.id}
                        className={`flex flex-col justify-between p-6 rounded-3xl border transition-all h-48 relative overflow-hidden ${
                          device.state
                            ? "bg-white text-black shadow-xl"
                            : "apple-glass-heavy border-white/10 dark:border-white/5 text-aura-text hover:border-white/20"
                        }`}
                      >
                        {/* Background Glow for active state */}
                        {device.state && (
                          <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent pointer-events-none" />
                        )}

                        <div className="flex justify-between items-start w-full relative z-10">
                          <div className={`p-3 rounded-2xl ${device.state ? 'bg-black/5' : 'bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5'}`}>
                            {getIcon(device.type, device.state, true)}
                          </div>
                          {isEditMode ? (
                            <button 
                              onClick={() => deleteDevice(currentRoom.id, device.id)}
                              className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleDevice(currentRoom.id, device.id)}
                              className={`w-12 h-6 rounded-full p-1 transition-colors ${device.state ? 'bg-orange-500' : 'bg-black/20 dark:bg-white/20'}`}
                            >
                              <div className={`w-4 h-4 rounded-full transition-transform ${device.state ? 'bg-white translate-x-6' : 'bg-aura-muted translate-x-0'}`} />
                            </button>
                          )}
                        </div>

                        <div className="text-left w-full relative z-10">
                          <div className="text-lg font-medium truncate mb-1">{device.name}</div>
                          <div
                            className={`text-sm font-medium ${device.state ? "text-black/60" : "text-aura-muted"}`}
                          >
                            {typeof device.state === "boolean"
                              ? device.state
                                ? "On"
                                : "Off"
                              : `${device.state}${device.type === 'thermostat' ? '°' : '%'}`}
                          </div>
                        </div>

                        {/* Controls for specific types (e.g., slider for lights/thermostat) */}
                        {device.state && (device.type === 'light' || device.type === 'thermostat') && !isEditMode && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                            <div className="h-full bg-orange-500 w-3/4" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isEditMode && currentRoom && (
                      <button
                        onClick={handleAddDevice}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-3xl border border-dashed border-white/20 text-aura-muted hover:text-aura-text hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all h-48"
                      >
                        <Plus className="w-8 h-8" />
                        <span className="font-medium">Add Device</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
