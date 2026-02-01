import { create } from 'zustand';
import { Order, Trade, OrderBook, Balance, Market } from '../types';

interface Store {
  // Market data
  selectedMarket: string;
  markets: Market[];
  setSelectedMarket: (market: string) => void;
  setMarkets: (markets: Market[]) => void;

  // Order book
  orderBook: OrderBook | null;
  setOrderBook: (orderBook: OrderBook) => void;

  // Trades
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;

  // User data
  userId: string | null;
  balances: Balance[];
  userOrders: Order[];
  setUserId: (userId: string | null) => void;
  setBalances: (balances: Balance[]) => void;
  setUserOrders: (orders: Order[]) => void;
  addUserOrder: (order: Order) => void;
  updateUserOrder: (orderId: string, updates: Partial<Order>) => void;
  removeUserOrder: (orderId: string) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<Store>((set, get) => ({
  // Market data
  selectedMarket: 'SOL-USDC',
  markets: [],
  setSelectedMarket: (market) => set({ selectedMarket: market }),
  setMarkets: (markets) => set({ markets }),

  // Order book
  orderBook: null,
  setOrderBook: (orderBook) => set({ orderBook }),

  // Trades
  trades: [],
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades.slice(0, 49)] })),

  // User data
  userId: null,
  balances: [],
  userOrders: [],
  setUserId: (userId) => set({ userId }),
  setBalances: (balances) => set({ balances }),
  setUserOrders: (orders) => set({ userOrders: orders }),
  addUserOrder: (order) => set((state) => ({ userOrders: [order, ...state.userOrders] })),
  updateUserOrder: (orderId, updates) => set((state) => ({
    userOrders: state.userOrders.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    )
  })),
  removeUserOrder: (orderId) => set((state) => ({
    userOrders: state.userOrders.filter(order => order.id !== orderId)
  })),

  // UI state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));