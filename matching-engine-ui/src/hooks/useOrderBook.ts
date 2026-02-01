import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getOrderBook, subscribeToOrderBook } from '../lib/websocket';
import { OrderBook } from '../types';

export const useOrderBook = (market: string) => {
  const { orderBook, setOrderBook, setIsLoading } = useStore();

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        setIsLoading(true);
        const data = await getOrderBook(market);
        setOrderBook(data);
      } catch (error) {
        console.error('Failed to fetch order book:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderBook();

    // Subscribe to real-time updates
    const handleOrderBookUpdate = (updatedOrderBook: OrderBook) => {
      setOrderBook(updatedOrderBook);
    };

    subscribeToOrderBook(market, handleOrderBookUpdate);

    return () => {
      // Cleanup subscription if needed
    };
  }, [market, setOrderBook, setIsLoading]);

  return { orderBook };
};