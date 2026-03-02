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

const initialRooms: Room[] = [
  {
    id: 'living_room',
    name: 'Living Room',
    devices: [
      { id: 'lr_light_1', name: 'Main Lights', type: 'light', state: true },
      { id: 'lr_tv', name: 'Samsung TV', type: 'tv', state: false },
      { id: 'lr_thermostat', name: 'Nest', type: 'thermostat', state: 72 },
      { id: 'lr_speaker', name: 'Sonos', type: 'speaker', state: true },
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    devices: [
      { id: 'bed_light_1', name: 'Ceiling Light', type: 'light', state: false },
      { id: 'bed_light_2', name: 'Lamp', type: 'light', state: true },
      { id: 'bed_fan', name: 'Ceiling Fan', type: 'fan', state: false },
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    devices: [
      { id: 'k_light_1', name: 'Island Lights', type: 'light', state: true },
      { id: 'k_light_2', name: 'Under Cabinet', type: 'light', state: false },
    ]
  }
];

interface SmartHomeContextType {
  rooms: Room[];
  toggleDevice: (roomId: string, deviceId: string) => void;
  setDeviceState: (roomId: string, deviceId: string, state: any) => void;
}

const SmartHomeContext = createContext<SmartHomeContextType>({
  rooms: initialRooms,
  toggleDevice: () => {},
  setDeviceState: () => {},
});

export const SmartHomeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  useEffect(() => {
    if (user) {
      fetchDevices();
    } else {
      setRooms(initialRooms);
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
        // Map database devices back to rooms structure
        const updatedRooms = initialRooms.map(room => {
          const roomDevices = data.filter(d => d.room_id === room.id);
          return {
            ...room,
            devices: room.devices.map(device => {
              const dbDevice = roomDevices.find(d => d.device_id === device.id);
              return dbDevice ? { ...device, state: dbDevice.state } : device;
            })
          };
        });
        setRooms(updatedRooms);
      } else {
        // Initialize devices for new user
        const devicesToInsert = initialRooms.flatMap(room => 
          room.devices.map(device => ({
            user_id: user?.id,
            room_id: room.id,
            device_id: device.id,
            name: device.name,
            type: device.type,
            state: device.state
          }))
        );

        const { error: insertError } = await supabase
          .from('devices')
          .insert(devicesToInsert);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
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
    <SmartHomeContext.Provider value={{ rooms, toggleDevice, setDeviceState }}>
      {children}
    </SmartHomeContext.Provider>
  );
};

export const useSmartHome = () => useContext(SmartHomeContext);
