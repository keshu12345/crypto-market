export interface Order {
  id: string;
  user_id: string;
  market: string;
  side: 'buy' | 'sell';
  order_type: 'limit' | 'market';
  price: number;
  quantity: number;
  filled_quantity: number;
  status: 'open' | 'filled' | 'cancelled' | 'partial';
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  market: string;
  maker_order_id: string;
  taker_order_id: string;
  maker_user_id: string;
  taker_user_id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

export interface PriceLevel {
  price: number;
  quantity: number;
  count: number;
}

export interface OrderBook {
  bids: PriceLevel[];
  asks: PriceLevel[];
}

export interface Balance {
  asset: string;
  available: number;
  locked: number;
}

export interface User {
  id: string;
  balances: Balance[];
}

export interface Market {
  symbol: string;
  base_asset: string;
  quote_asset: string;
  tick_size: number;
  min_order_size: number;
  maker_fee_bps: number;
  taker_fee_bps: number;
}

export interface PlaceOrderRequest {
  user_id: string;
  market: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
}

export interface PlaceOrderResponse {
  order_id: string;
  status: string;
}