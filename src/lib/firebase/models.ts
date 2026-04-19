export interface Zone {
  id: string;
  name: string;
  type: 'gate' | 'washroom' | 'food' | 'merch';
  currentCapacity: number;
  maxCapacity: number;
  waitTime: number; // in minutes
}

export interface Order {
  id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  deliveryPreference: 'seat' | 'express_pickup';
  seatDetails?: { block: string; row: string; seat: string };
  total: number;
  createdAt: string;
}
