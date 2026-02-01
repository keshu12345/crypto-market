'use client';

import { useState, useEffect } from 'react';

interface OrderBookData {
  bids: Array<{ price: number; quantity: number; count: number }>;
  asks: Array<{ price: number; quantity: number; count: number }>;
}

interface Order {
  id: string;
  user_id: string;
  market: string;
  side: 'buy' | 'sell';
  order_type: string;
  price: number;
  quantity: number;
  filled_quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Trade {
  id: string;
  market: string;
  maker_order_id: string;
  taker_order_id: string;
  maker_user_id: string;
  taker_user_id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

interface Balance {
  available: number;
  locked: number;
}

export default function Home() {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balance, setBalance] = useState<{ SOL: Balance; USDC: Balance } | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadOrderBook();
    loadUserOrders();
    loadTrades();
    loadBalance();
  }, []);

  const loadOrderBook = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/orderbook/SOL-USDC');
      const data = await response.json();
      setOrderBook(data);
    } catch (error) {
      console.error('Failed to load order book:', error);
    }
  };

  const loadUserOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/orders?user_id=user_1');
      const data = await response.json();
      setUserOrders(data);
    } catch (error) {
      console.error('Failed to load user orders:', error);
    }
  };

  const loadTrades = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/trades/SOL-USDC');
      const data = await response.json();
      setTrades(data);
    } catch (error) {
      console.error('Failed to load trades:', error);
    }
  };

  const loadBalance = async () => {
    try {
      const [solRes, usdcRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/users/user_1/balance?asset=SOL'),
        fetch('http://localhost:3000/api/v1/users/user_1/balance?asset=USDC')
      ]);

      const [solData, usdcData] = await Promise.all([
        solRes.json(),
        usdcRes.json()
      ]);

      setBalance({ SOL: solData, USDC: usdcData });
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const placeOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const side = formData.get('side') as string;
    const price = formData.get('price') as string;
    const quantity = formData.get('quantity') as string;

    const orderData = {
      user_id: 'user_1',
      market: 'SOL-USDC',
      side,
      price: parseFloat(price),
      quantity: parseFloat(quantity)
    };

    try {
      const response = await fetch('http://localhost:3000/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'secret-key'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(`Order placed! Order ID: ${result.order_id}`);

      // Refresh data
      loadOrderBook();
      loadUserOrders();
      loadTrades();
      loadBalance();
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: 'user_1' })
      });

      if (response.ok) {
        alert('Order cancelled');
        loadUserOrders();
      } else {
        alert('Failed to cancel order');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Crypto DEX</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Book */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Order Book - SOL/USDC</h2>
            {orderBook ? (
              <div className="space-y-2">
                <div className="text-green-400 text-sm mb-2">Bids</div>
                {orderBook.bids.slice(0, 5).map((bid, i) => (
                  <div key={i} className="flex justify-between text-green-400 text-sm">
                    <span>${bid.price.toFixed(2)}</span>
                    <span>{bid.quantity.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-600 my-2"></div>
                <div className="text-red-400 text-sm mb-2">Asks</div>
                {orderBook.asks.slice(0, 5).map((ask, i) => (
                  <div key={i} className="flex justify-between text-red-400 text-sm">
                    <span>${ask.price.toFixed(2)}</span>
                    <span>{ask.quantity.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">Loading...</div>
            )}
          </div>
        </div>

        {/* Order Form */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Place Order</h2>
            <form onSubmit={placeOrder} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Side</label>
                <select name="side" className="w-full p-2 bg-gray-700 border border-gray-600 rounded" required>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Price</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue="100.50"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  step="0.01"
                  defaultValue="1.0"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 px-4 rounded font-medium"
              >
                {loading ? 'Placing...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Balance */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Balance</h2>
            {balance ? (
              <div className="space-y-4">
                <div>
                  <div className="font-medium">SOL</div>
                  <div className="text-sm text-gray-400">Available: {balance.SOL.available.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Locked: {balance.SOL.locked.toFixed(2)}</div>
                </div>
                <div>
                  <div className="font-medium">USDC</div>
                  <div className="text-sm text-gray-400">Available: {balance.USDC.available.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Locked: {balance.USDC.locked.toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">Loading...</div>
            )}
          </div>
        </div>
      </div>

      {/* Trade History and User Orders */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trade History */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Recent Trades - SOL/USDC</h2>
          {trades.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trades.slice(-10).reverse().map((trade) => (
                <div key={trade.id} className="flex justify-between items-center bg-gray-700 p-3 rounded text-sm">
                  <div>
                    <div className={`font-medium ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.side.toUpperCase()}
                    </div>
                    <div className="text-gray-400">
                      ${trade.price.toFixed(2)} × {trade.quantity.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right text-gray-400">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No recent trades</div>
          )}
        </div>

        {/* User Orders */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
          {userOrders.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                  <div>
                    <div className={`font-medium ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {order.side.toUpperCase()} {order.market}
                    </div>
                    <div className="text-sm text-gray-400">
                      Price: ${order.price.toFixed(2)} | Qty: {order.quantity.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm mb-1">{order.status}</div>
                    {order.status === 'open' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No orders found</div>
          )}
        </div>
      </div>
    </div>
  );
}
