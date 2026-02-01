import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getTrades, subscribeToTrades } from '../lib/websocket';
import { Trade } from '../types';

export const useTrades = (market: string) => {
  const { trades, setTrades, addTrade, setIsLoading } = useStore();

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setIsLoading(true);
        const data = await getTrades(market);
        setTrades(data);
      } catch (error) {
        console.error('Failed to fetch trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();

    // Subscribe to real-time trade updates
    const handleTradeUpdate = (trade: Trade) => {
      addTrade(trade);
    };

    subscribeToTrades(market, handleTradeUpdate);

    return () => {
      // Cleanup subscription if needed
    };
  }, [market, setTrades, addTrade, setIsLoading]);

  return { trades };
};