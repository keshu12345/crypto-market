import React, { useState } from 'react';
import { placeOrder } from '../lib/api';
import { useStore } from '../store/useStore';
import { PlaceOrderRequest } from '../types';

export const OrderForm: React.FC = () => {
  const { selectedMarket, userId, addUserOrder } = useStore();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData: PlaceOrderRequest = {
        user_id: userId,
        market: selectedMarket,
        side,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
      };

      const response = await placeOrder(orderData);
      alert(`Order placed successfully! Order ID: ${response.order_id}`);

      // Reset form
      setPrice('');
      setQuantity('');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Place Order</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Side selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Side</label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`px-4 py-2 rounded ${side === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`px-4 py-2 rounded ${side === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Order type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setOrderType('limit')}
              className={`px-4 py-2 rounded ${orderType === 'limit' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              Limit
            </button>
            <button
              type="button"
              onClick={() => setOrderType('market')}
              className={`px-4 py-2 rounded ${orderType === 'market' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              Market
            </button>
          </div>
        </div>

        {/* Price */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="Enter price"
              required
            />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
          <input
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            placeholder="Enter quantity"
            required
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded font-medium ${
            side === 'buy'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } text-white disabled:opacity-50`}
        >
          {isSubmitting ? 'Placing Order...' : `${side.toUpperCase()} ${selectedMarket.split('-')[0]}`}
        </button>
      </form>
    </div>
  );
};