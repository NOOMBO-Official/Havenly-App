import { useState } from "react";
import {
  Lightbulb,
  Tv,
  Thermometer,
  Lock,
  Fan,
  Speaker,
  Power,
} from "lucide-react";
import { useSmartHome } from "../contexts/SmartHomeContext";

export default function SmartHomeWidget() {
  const { rooms, toggleDevice } = useSmartHome();
  const [activeRoom, setActiveRoom] = useState<string>(rooms[0].id);

  const getIcon = (type: string, state: any) => {
    const props = {
      className: `w-6 h-6 ${state ? "text-white" : "text-aura-muted"}`,
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

  const currentRoom = rooms.find((r) => r.id === activeRoom);

  return (
    <div className="flex flex-col p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-aura-muted">
          Smart Home
        </h2>

        <div className="flex space-x-2 bg-aura-bg p-1 rounded-full border border-aura-border">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeRoom === room.id
                  ? "bg-aura-text text-aura-bg"
                  : "text-aura-muted hover:text-aura-text"
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {currentRoom?.devices.map((device) => (
          <button
            key={device.id}
            onClick={() => toggleDevice(currentRoom.id, device.id)}
            className={`flex flex-col justify-between p-4 rounded-2xl border transition-all h-28 ${
              device.state
                ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "bg-aura-bg border-aura-border text-aura-text hover:bg-aura-card-hover"
            }`}
          >
            <div className="flex justify-between items-start w-full">
              {getIcon(device.type, device.state)}
              <div
                className={`w-2 h-2 rounded-full ${device.state ? "bg-white" : "bg-aura-border"}`}
              />
            </div>
            <div className="text-left w-full">
              <div className="text-sm font-medium truncate">{device.name}</div>
              <div
                className={`text-xs ${device.state ? "text-indigo-100" : "text-aura-muted"}`}
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
      </div>
    </div>
  );
}
