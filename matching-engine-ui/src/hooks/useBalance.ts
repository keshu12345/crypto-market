import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getUserBalance, subscribeToBalance } from '../lib/websocket';
import { Balance } from '../types';

export const useBalance = (userId: string | null, asset: string) => {
  const { balances, setBalances, setIsLoading } = useStore();

  useEffect(() => {
    if (!userId) return;

    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        const balance = await getUserBalance(userId, asset);
        setBalances([balance]); // For now, single asset
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Subscribe to real-time balance updates
    const handleBalanceUpdate = (updatedBalance: Balance) => {
      setBalances([updatedBalance]);
    };

    subscribeToBalance(userId, handleBalanceUpdate);

    return () => {
      // Cleanup subscription if needed
    };
  }, [userId, asset, setBalances, setIsLoading]);

  return { balances };
};