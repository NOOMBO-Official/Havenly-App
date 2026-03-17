import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Device {
  id: string;
  name: string;
  type: 'light' | 'tv' | 'thermostat' | 'lock' | 'fan' | 'speaker';
  state: boolean | number | string;
}

export interface Room {
  id: string;
  name: string;
  devices: Device[];
}

interface SmartHomeContextType {
  rooms: Room[];
  toggleDevice: (roomId: string, deviceId: string) => void;
  setDeviceState: (roomId: string, deviceId: string, state: any) => void;
  addRoom: (name: string) => void;
  addDevice: (roomId: string, device: Omit<Device, 'id'>) => void;
  deleteDevice: (roomId: string, deviceId: string) => void;
}

const SmartHomeContext = createContext<SmartHomeContextType>({
  rooms: [],
  toggleDevice: () => {},
  setDeviceState: () => {},
  addRoom: () => {},
  addDevice: () => {},
  deleteDevice: () => {},
});

export const SmartHomeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (user) {
      fetchDevices();
    } else {
      setRooms([]);
    }
  }, [user]);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data && data.length > 0) {
        // Reconstruct rooms from devices
        const roomsMap = new Map<string, Room>();
        data.forEach(d => {
          if (!roomsMap.has(d.room_id)) {
            roomsMap.set(d.room_id, { id: d.room_id, name: d.room_name || d.room_id, devices: [] });
          }
          roomsMap.get(d.room_id)!.devices.push({
            id: d.device_id,
            name: d.name,
            type: d.type,
            state: d.state
          });
        });
        setRooms(Array.from(roomsMap.values()));
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const addRoom = (name: string) => {
    const newRoom: Room = {
      id: name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      name,
      devices: []
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const addDevice = async (roomId: string, device: Omit<Device, 'id'>) => {
    if (!user) return;
    const newDevice: Device = {
      ...device,
      id: device.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    };
    
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    try {
      const { error } = await supabase
        .from('devices')
        .insert({
          user_id: user.id,
          room_id: roomId,
          room_name: room.name,
          device_id: newDevice.id,
          name: newDevice.name,
          type: newDevice.type,
          state: newDevice.state
        });

      if (error) throw error;

      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, devices: [...r.devices, newDevice] };
        }
        return r;
      }));
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const deleteDevice = async (roomId: string, deviceId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('user_id', user.id)
        .eq('room_id', roomId)
        .eq('device_id', deviceId);

      if (error) throw error;

      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, devices: r.devices.filter(d => d.id !== deviceId) };
        }
        return r;
      }));
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const updateDeviceInDb = async (roomId: string, deviceId: string, state: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('devices')
        .update({ state })
        .eq('user_id', user.id)
        .eq('room_id', roomId)
        .eq('device_id', deviceId);

      if (error) throw error;

      // --- REAL DEVICE API INTEGRATION LOGIC ---
      // This is where you would call your actual smart home hub (e.g., Home Assistant, SmartThings, Hue Bridge)
      // Example implementation for a generic webhook/REST API:
      
      /*
      const HASS_URL = process.env.VITE_HOME_ASSISTANT_URL;
      const HASS_TOKEN = process.env.VITE_HOME_ASSISTANT_TOKEN;
      
      if (HASS_URL && HASS_TOKEN) {
        // Map local device IDs to Home Assistant entity IDs
        const entityMap: Record<string, string> = {
          'lr_light_1': 'light.living_room_main',
          'lr_tv': 'media_player.samsung_tv',
          'lr_thermostat': 'climate.nest',
          // ... add other mappings
        };

        const entityId = entityMap[deviceId];
        if (entityId) {
          const domain = entityId.split('.')[0];
          let service = typeof state === 'boolean' ? (state ? 'turn_on' : 'turn_off') : 'set_value';
          let payload: any = { entity_id: entityId };

          // Handle specific domains like climate
          if (domain === 'climate' && typeof state === 'number') {
            service = 'set_temperature';
            payload.temperature = state;
          }

          await fetch(`${HASS_URL}/api/services/${domain}/${service}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HASS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
          console.log(`Successfully sent command to ${entityId}`);
        }
      }
      */
      // -----------------------------------------

    } catch (error) {
      console.error('Error updating device:', error);
    }
  };

  const toggleDevice = (roomId: string, deviceId: string) => {
    setRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      return {
        ...room,
        devices: room.devices.map(device => {
          if (device.id !== deviceId) return device;
          if (typeof device.state === 'boolean') {
            const newState = !device.state;
            updateDeviceInDb(roomId, deviceId, newState);
            return { ...device, state: newState };
          }
          return device;
        })
      };
    }));
  };

  const setDeviceState = (roomId: string, deviceId: string, state: any) => {
    updateDeviceInDb(roomId, deviceId, state);
    setRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      return {
        ...room,
        devices: room.devices.map(device => {
          if (device.id !== deviceId) return device;
          return { ...device, state };
        })
      };
    }));
  };

  return (
    <SmartHomeContext.Provider value={{ rooms, toggleDevice, setDeviceState, addRoom, addDevice, deleteDevice }}>
      {children}
    </SmartHomeContext.Provider>
  );
};

export const useSmartHome = () => useContext(SmartHomeContext);
