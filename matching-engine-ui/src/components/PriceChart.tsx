import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTrades } from '../hooks/useTrades';
import { useStore } from '../store/useStore';

export const PriceChart: React.FC = () => {
  const { selectedMarket } = useStore();
  const { trades } = useTrades(selectedMarket);

  // Process trades data for chart
  const chartData = trades
    .slice()
    .reverse()
    .slice(0, 50) // Last 50 trades
    .map((trade, index) => ({
      time: new Date(trade.timestamp).toLocaleTimeString(),
      price: trade.price,
      volume: trade.quantity,
    }));

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Price Chart - {selectedMarket}</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#F9FAFB',
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {chartData.length === 0 && (
        <div className="text-center text-gray-400 py-8">No chart data available</div>
      )}
    </div>
  );
};