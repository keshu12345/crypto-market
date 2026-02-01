import React from 'react';
import { useOrderBook } from '../hooks/useOrderBook';
import { useStore } from '../store/useStore';

export const OrderBook: React.FC = () => {
  const { selectedMarket } = useStore();
  const { orderBook } = useOrderBook(selectedMarket);

  if (!orderBook) {
    return <div className="p-4 text-center">Loading order book...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Order Book - {selectedMarket}</h3>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <h4 className="text-green-400 mb-2">Bids</h4>
          <div className="space-y-1">
            {orderBook.bids.slice(0, 10).map((bid, index) => (
              <div key={index} className="flex justify-between text-green-400">
                <span>{bid.price.toFixed(2)}</span>
                <span>{bid.quantity.toFixed(2)}</span>
                <span>{bid.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {orderBook.asks[0]?.price.toFixed(2) || '--'}
          </div>
          <div className="text-sm text-gray-400">Spread</div>
        </div>

        <div>
          <h4 className="text-red-400 mb-2">Asks</h4>
          <div className="space-y-1">
            {orderBook.asks.slice(0, 10).map((ask, index) => (
              <div key={index} className="flex justify-between text-red-400">
                <span>{ask.price.toFixed(2)}</span>
                <span>{ask.quantity.toFixed(2)}</span>
                <span>{ask.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};