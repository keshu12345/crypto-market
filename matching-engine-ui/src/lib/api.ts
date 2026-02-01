import axios from 'axios';
import { Order, Trade, OrderBook, Balance, Market, PlaceOrderRequest, PlaceOrderResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'secret-key', // In production, get from secure storage
  },
});

// Markets
export const getMarkets = async (): Promise<Market[]> => {
  const response = await api.get('/api/v1/markets');
  return response.data;
};

// Order Book
export const getOrderBook = async (market: string): Promise<OrderBook> => {
  const response = await api.get(`/api/v1/orderbook/${market}`);
  return response.data;
};

// Trades
export const getTrades = async (market: string): Promise<Trade[]> => {
  const response = await api.get(`/api/v1/trades/${market}`);
  return response.data;
};

// User Balance
export const getUserBalance = async (userId: string, asset: string): Promise<Balance> => {
  const response = await api.get(`/api/v1/users/${userId}/balance?asset=${asset}`);
  return response.data;
};

// User Orders
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const response = await api.get('/api/v1/orders', {
    params: { user_id: userId },
  });
  return response.data;
};

// Place Order
export const placeOrder = async (order: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
  const response = await api.post('/api/v1/orders', order);
  return response.data;
};

// Cancel Order
export const cancelOrder = async (orderId: string, userId: string): Promise<void> => {
  await api.delete(`/api/v1/orders/${orderId}`, {
    data: { user_id: userId },
  });
};

// Settlement Status
export const getSettlementStatus = async (settlementId: string): Promise<any> => {
  const response = await api.get(`/api/v1/settlements/${settlementId}`);
  return response.data;
};