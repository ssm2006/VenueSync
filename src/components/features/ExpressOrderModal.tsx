import { useState } from "react";
import { X, ShoppingBag, CreditCard, QrCode, Plus, Minus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface ExpressOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (order: any) => void;
}

const MENU_ITEMS = [
  { id: 1, name: "Stadium Hot Dog", price: 8.50, desc: "Classic all-beef frank" },
  { id: 2, name: "Craft Beer (IPA)", price: 12.00, desc: "Local brewery 16oz draft" },
  { id: 3, name: "Soft Pretzel", price: 6.00, desc: "Warm with cheese dip" },
  { id: 4, name: "Nachos Supreme", price: 10.50, desc: "Jalapenos, cheese, salsa" },
  { id: 5, name: "Bottled Water", price: 4.50, desc: "Ice cold 20oz" }
];

export function ExpressOrderModal({ isOpen, onClose, onPlaceOrder }: ExpressOrderModalProps) {
  const [deliveryType, setDeliveryType] = useState<"seat" | "express_pickup">("seat");
  const [seat, setSeat] = useState({ block: "", row: "", seat: "" });
  const [isOrdered, setIsOrdered] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState<{id: number, name: string, price: number, qty: number, desc: string}[]>([]);

  if (!isOpen) return null;

  const handleAddToCart = (item: typeof MENU_ITEMS[0]) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === id);
      if (exists && exists.qty > 1) {
        return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    
    // Map cart to backend order struct
    const backendItems = cart.map(({ name, qty, price }) => ({ name, quantity: qty, price }));

    onPlaceOrder({
      items: backendItems,
      deliveryPreference: deliveryType,
      seatDetails: deliveryType === "seat" ? seat : undefined,
      total
    });
    setIsOrdered(true);
  };

  const handleModalClose = () => {
    setCart([]);
    setIsOrdered(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleModalClose}></div>
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-[80vh] md:h-[600px]">
        
        {isOrdered ? (
          <div className="flex-1 p-8 text-center flex flex-col items-center justify-center bg-white">
            {deliveryType === "express_pickup" ? (
              <>
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Order Ready Soon</h3>
                <p className="text-slate-500 mb-8">Scan this QR code at the Express Lane.</p>
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-8">
                  <QRCodeSVG value="VenueSync-Order-Mock" size={200} style={{ width: "100%", height: "100%" }} />
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                  <ShoppingBag className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Order Confirmed!</h3>
                <p className="text-slate-500 text-lg">Your items will be delivered to Block {seat.block}, Row {seat.row}, Seat {seat.seat} shortly.</p>
              </>
            )}
            <button onClick={handleModalClose} className="mt-4 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 rounded-xl transition-all font-semibold">
              Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: MENU */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 border-r border-slate-100 bg-slate-50">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-slate-800">Food & Drink Menu</h2>
                 <button onClick={handleModalClose} className="md:hidden text-slate-400 hover:text-slate-700">
                    <X className="w-6 h-6" />
                 </button>
               </div>
               
               <div className="space-y-4">
                 {MENU_ITEMS.map(item => (
                   <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                     <div>
                       <h4 className="font-bold text-slate-800">{item.name}</h4>
                       <p className="text-sm text-slate-500">{item.desc}</p>
                       <span className="font-semibold text-indigo-600 mt-1 inline-block">${item.price.toFixed(2)}</span>
                     </div>
                     <button 
                       onClick={() => handleAddToCart(item)}
                       className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"
                     >
                       <Plus className="w-5 h-5"/>
                     </button>
                   </div>
                 ))}
               </div>
            </div>

            {/* RIGHT COLUMN: CART & CHECKOUT */}
            <div className="w-full md:w-[400px] flex flex-col bg-white">
              <div className="p-6 md:p-8 flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-600" /> Your Cart
                  </h3>
                  <button onClick={handleModalClose} className="hidden md:block text-slate-400 hover:text-slate-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <ShoppingBag className="w-12 h-12 opacity-20 mb-3" />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto mb-6 pr-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 last:border-0">
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-800 text-sm">{item.name}</h5>
                          <div className="font-medium text-slate-500 text-sm">${(item.price * item.qty).toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                          <button onClick={() => handleRemoveFromCart(item.id)} className="p-1 hover:bg-white rounded text-slate-600 hover:text-red-500 shadow-sm"><Minus className="w-4 h-4"/></button>
                          <span className="font-bold w-4 text-center text-sm">{item.qty}</span>
                          <button onClick={() => handleAddToCart(item)} className="p-1 hover:bg-white rounded text-slate-600 hover:text-indigo-600 shadow-sm"><Plus className="w-4 h-4"/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex justify-between mb-6 font-bold text-xl text-slate-800">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("seat")}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                          deliveryType === "seat" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Deliver to Seat
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType("express_pickup")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                          deliveryType === "express_pickup" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <QrCode className="w-4 h-4" /> QR Pickup
                      </button>
                    </div>

                    {deliveryType === "seat" && (
                      <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top-2">
                        <input required value={seat.block} onChange={e => setSeat({...seat, block: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 text-sm font-medium" placeholder="Block" />
                        <input required value={seat.row} onChange={e => setSeat({...seat, row: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 text-sm font-medium" placeholder="Row" />
                        <input required value={seat.seat} onChange={e => setSeat({...seat, seat: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 text-sm font-medium" placeholder="Seat" />
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={cart.length === 0}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 active:scale-95 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
                    >
                      <CreditCard className="w-5 h-5" /> Pay & Place Order
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
