import React from 'react';
import { useTrades } from '../hooks/useTrades';
import { useStore } from '../store/useStore';

export const TradeHistory: React.FC = () => {
  const { selectedMarket } = useStore();
  const { trades } = useTrades(selectedMarket);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Recent Trades - {selectedMarket}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 text-gray-300">Price</th>
              <th className="text-left py-2 text-gray-300">Quantity</th>
              <th className="text-left py-2 text-gray-300">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 20).map((trade) => (
              <tr key={trade.id} className="border-b border-gray-700">
                <td className={`py-2 ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.price.toFixed(2)}
                </td>
                <td className="py-2 text-white">{trade.quantity.toFixed(2)}</td>
                <td className="py-2 text-gray-400">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trades.length === 0 && (
        <div className="text-center text-gray-400 py-8">No recent trades</div>
      )}
    </div>
  );
};