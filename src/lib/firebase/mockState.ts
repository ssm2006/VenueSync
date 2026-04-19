import { useState, useEffect } from 'react';
import { Zone, Order } from './models';

// Mock initial data
const initialZones: Zone[] = [
  { id: 'z1', name: 'Gate A (North)', type: 'gate', currentCapacity: 450, maxCapacity: 500, waitTime: 12 },
  { id: 'z2', name: 'Gate B (South)', type: 'gate', currentCapacity: 150, maxCapacity: 500, waitTime: 3 },
  { id: 'z3', name: 'Food Court East', type: 'food', currentCapacity: 80, maxCapacity: 100, waitTime: 15 },
  { id: 'z4', name: 'Beer Stand West', type: 'food', currentCapacity: 20, maxCapacity: 50, waitTime: 2 },
  { id: 'z5', name: 'Washroom Block 1', type: 'washroom', currentCapacity: 45, maxCapacity: 50, waitTime: 8 },
  { id: 'z6', name: 'Washroom Block 2', type: 'washroom', currentCapacity: 10, maxCapacity: 50, waitTime: 0 },
  { id: 'z7', name: 'Main Team Store', type: 'merch', currentCapacity: 190, maxCapacity: 200, waitTime: 25 },
];

export function useMockFirestore() {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [orders, setOrders] = useState<Order[]>([]);

  // Simulate real-time updates for zones
  useEffect(() => {
    const interval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => {
          // Randomly fluctuate capacity by -5 to +5
          const change = Math.floor(Math.random() * 11) - 5;
          let newCapacity = zone.currentCapacity + change;
          if (newCapacity < 0) newCapacity = 0;
          if (newCapacity > zone.maxCapacity) newCapacity = zone.maxCapacity;
          
          // Calculate wait time roughly based on capacity ratio
          const ratio = newCapacity / zone.maxCapacity;
          let newWaitTime = Math.floor(ratio * 30); // Max 30 mins wait

          return { ...zone, currentCapacity: newCapacity, waitTime: newWaitTime };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  return { zones, orders, addOrder };
}
