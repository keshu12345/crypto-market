import { io, Socket } from 'socket.io-client';
import { Trade, OrderBook, Order, Balance } from '../types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      timeout: 5000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  unsubscribe(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsClient = new WebSocketClient();

// Helper functions for subscriptions
export const subscribeToOrderBook = (market: string, callback: (orderBook: OrderBook) => void) => {
  wsClient.subscribe(`orderbook:${market}`, callback);
};

export const subscribeToTrades = (market: string, callback: (trade: Trade) => void) => {
  wsClient.subscribe(`trades:${market}`, callback);
};

export const subscribeToUserOrders = (userId: string, callback: (order: Order) => void) => {
  wsClient.subscribe(`orders:${userId}`, callback);
};

export const subscribeToBalance = (userId: string, callback: (balance: Balance) => void) => {
  wsClient.subscribe(`balance:${userId}`, callback);
};