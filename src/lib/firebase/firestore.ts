import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, setDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { Zone, Order } from './models';

const initialZones: Zone[] = [
  { id: 'z1', name: 'Gate A (North)', type: 'gate', currentCapacity: 450, maxCapacity: 500, waitTime: 12 },
  { id: 'z2', name: 'Gate B (South)', type: 'gate', currentCapacity: 150, maxCapacity: 500, waitTime: 3 },
  { id: 'z3', name: 'Food Court East', type: 'food', currentCapacity: 80, maxCapacity: 100, waitTime: 15 },
  { id: 'z4', name: 'Beer Stand West', type: 'food', currentCapacity: 20, maxCapacity: 50, waitTime: 2 },
  { id: 'z5', name: 'Washroom Block 1', type: 'washroom', currentCapacity: 45, maxCapacity: 50, waitTime: 8 },
  { id: 'z6', name: 'Washroom Block 2', type: 'washroom', currentCapacity: 10, maxCapacity: 50, waitTime: 0 },
  { id: 'z7', name: 'Main Team Store', type: 'merch', currentCapacity: 190, maxCapacity: 200, waitTime: 25 },
];

export function useFirestoreData() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!db) {
      console.warn("Firebase DB is not initialized. Check your .env setup. Falling back to local state");
      setZones(initialZones);
      setLoading(false);
      return;
    }

    const zonesRef = collection(db, 'zones');
    const ordersRef = collection(db, 'orders');

    const unsubscribeZones = onSnapshot(zonesRef, (snapshot) => {
      const zonesData: Zone[] = [];
      snapshot.forEach((doc) => {
        zonesData.push(doc.data() as Zone);
      });
      if (zonesData.length > 0) {
        setZones(zonesData.sort((a,b) => a.id.localeCompare(b.id)));
      }
      setLoading(false);
    });

    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push(doc.data() as Order);
      });
      // Sort orders desc by createdAt
      setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    return () => {
      unsubscribeZones();
      unsubscribeOrders();
    };
  }, []);

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (db) {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } else {
      setOrders(prev => [newOrder, ...prev]);
    }
    
    return newOrder;
  };

  const seedAndSimulate = async () => {
    if (!db) {
      alert("Firebase not configured!");
      return;
    }
    
    const zonesRef = collection(db, 'zones');
    const snapshot = await getDocs(zonesRef);
    
    if (snapshot.empty) {
      // Seed
      for (const zone of initialZones) {
        await setDoc(doc(db, 'zones', zone.id), zone);
      }
      console.log("Seeded database with initial zones.");
    }
    
    let isSimulating = true;
    
    const interval = setInterval(async () => {
      if (!isSimulating) {
        clearInterval(interval);
        return;
      }
      
      const snap = await getDocs(zonesRef);
      snap.forEach(async (docSnap) => {
        const zone = docSnap.data() as Zone;
        const change = Math.floor(Math.random() * 11) - 5;
        let newCapacity = zone.currentCapacity + change;
        if (newCapacity < 0) newCapacity = 0;
        if (newCapacity > zone.maxCapacity) newCapacity = zone.maxCapacity;
        
        const ratio = newCapacity / zone.maxCapacity;
        let newWaitTime = Math.floor(ratio * 30);
        
        await updateDoc(doc(db!, 'zones', zone.id), {
          currentCapacity: newCapacity,
          waitTime: newWaitTime
        });
      });
      console.log('Simulation cycle completed.');
    }, 3000);
    
    return () => { isSimulating = false }; // return stop function
  };

  return { zones, orders, addOrder, loading, seedAndSimulate };
}
