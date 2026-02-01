import React, { useEffect } from 'react';
import { getUserOrders, cancelOrder } from '../lib/api';
import { useStore } from '../store/useStore';
import { Order } from '../types';

export const UserOrders: React.FC = () => {
  const { userId, userOrders, setUserOrders } = useStore();

  useEffect(() => {
    if (userId) {
      const fetchUserOrders = async () => {
        try {
          const orders = await getUserOrders(userId);
          setUserOrders(orders);
        } catch (error) {
          console.error('Failed to fetch user orders:', error);
        }
      };

      fetchUserOrders();
    }
  }, [userId, setUserOrders]);

  const handleCancelOrder = async (orderId: string) => {
    if (!userId) return;

    try {
      await cancelOrder(orderId, userId);
      // Update local state
      setUserOrders(userOrders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order');
    }
  };

  if (!userId) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Your Orders</h3>
        <div className="text-center text-gray-400 py-8">Please connect your wallet to view orders</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Your Orders</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 text-gray-300">Market</th>
              <th className="text-left py-2 text-gray-300">Side</th>
              <th className="text-left py-2 text-gray-300">Type</th>
              <th className="text-left py-2 text-gray-300">Price</th>
              <th className="text-left py-2 text-gray-300">Quantity</th>
              <th className="text-left py-2 text-gray-300">Status</th>
              <th className="text-left py-2 text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userOrders.map((order) => (
              <tr key={order.id} className="border-b border-gray-700">
                <td className="py-2 text-white">{order.market}</td>
                <td className={`py-2 ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {order.side.toUpperCase()}
                </td>
                <td className="py-2 text-white">{order.order_type}</td>
                <td className="py-2 text-white">{order.price.toFixed(2)}</td>
                <td className="py-2 text-white">{order.quantity.toFixed(2)}</td>
                <td className="py-2 text-white">{order.status}</td>
                <td className="py-2">
                  {order.status === 'open' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userOrders.length === 0 && (
        <div className="text-center text-gray-400 py-8">No orders found</div>
      )}
    </div>
  );
};