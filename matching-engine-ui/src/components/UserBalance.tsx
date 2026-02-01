import React from 'react';
import { useBalance } from '../hooks/useBalance';
import { useStore } from '../store/useStore';

export const UserBalance: React.FC = () => {
  const { userId } = useStore();
  const { balances } = useBalance(userId, 'SOL'); // Default to SOL

  if (!userId) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Balance</h3>
        <div className="text-center text-gray-400 py-8">Please connect your wallet to view balance</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Balance</h3>

      <div className="space-y-3">
        {balances.map((balance) => (
          <div key={balance.asset} className="flex justify-between items-center">
            <div>
              <div className="text-white font-medium">{balance.asset}</div>
              <div className="text-sm text-gray-400">Available: {balance.available.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-white">{(balance.available + balance.locked).toFixed(2)}</div>
              <div className="text-sm text-gray-400">Locked: {balance.locked.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      {balances.length === 0 && (
        <div className="text-center text-gray-400 py-8">No balance data</div>
      )}
    </div>
  );
};