use std::collections::{BTreeMap, HashMap, VecDeque};
use uuid::Uuid;
use chrono::Utc;

use super::types::{Order, Trade, Side, OrderType, OrderStatus, MatchResult, PriceLevel, OrderBookSnapshot};

pub struct MatchingEngine {
    pub market: String,
    bids: BTreeMap<u64, VecDeque<Order>>,  // price -> orders (FIFO)
    asks: BTreeMap<u64, VecDeque<Order>>,  // price -> orders (FIFO)
    order_lookup: HashMap<Uuid, (Side, u64)>,  // order_id -> (side, price)
    recent_trades: Vec<Trade>,  // keep last 1000 trades
}

impl MatchingEngine {
    pub fn new(market: String) -> Self {
        Self {
            market,
            bids: BTreeMap::new(),
            asks: BTreeMap::new(),
            order_lookup: HashMap::new(),
            recent_trades: Vec::new(),
        }
    }

    pub fn process_order(&mut self, mut order: Order) -> MatchResult {
        order.status = OrderStatus::Open;
        let mut trades = Vec::new();

        match order.order_type {
            OrderType::Limit => {
                trades = self.match_limit_order(&mut order);
                if order.filled_quantity < order.quantity {
                    self.add_to_book(order.clone());
                } else {
                    order.status = OrderStatus::Filled;
                }
            }
            OrderType::Market => {
                trades = self.match_market_order(&mut order);
                if order.filled_quantity < order.quantity {
                    // Market order partially filled, but for simplicity, cancel remaining
                    order.status = OrderStatus::Cancelled;
                } else {
                    order.status = OrderStatus::Filled;
                }
            }
        }

        MatchResult {
            order,
            trades: trades.clone(),
            status: OrderStatus::Open,  // or appropriate status
        }
    }

    fn match_limit_order(&mut self, order: &mut Order) -> Vec<Trade> {
        let mut trades = Vec::new();
        let opposite_side = match order.side {
            Side::Buy => &mut self.asks,
            Side::Sell => &mut self.bids,
        };

        let mut remaining_quantity = order.quantity - order.filled_quantity;

        while remaining_quantity > 0 {
            let best_price = match order.side {
                Side::Buy => opposite_side.keys().next().cloned(),
                Side::Sell => opposite_side.keys().rev().next().cloned(),
            };

            if let Some(price) = best_price {
                if !self.price_matches(order, price) {
                    break;
                }

                if let Some(orders) = opposite_side.get_mut(&price) {
                    if orders.is_empty() {
                        opposite_side.remove(&price);
                        continue;
                    }

                    let mut resting_order = orders.front_mut().unwrap();
                    let trade_quantity = std::cmp::min(remaining_quantity, resting_order.quantity - resting_order.filled_quantity);

                    resting_order.filled_quantity += trade_quantity;
                    order.filled_quantity += trade_quantity;
                    remaining_quantity -= trade_quantity;

                    let trade = Trade {
                        id: Uuid::new_v4(),
                        market: self.market.clone(),
                        maker_order_id: resting_order.id,
                        taker_order_id: order.id,
                        maker_user_id: resting_order.user_id.clone(),
                        taker_user_id: order.user_id.clone(),
                        price,
                        quantity: trade_quantity,
                        side: order.side.clone(),
                        timestamp: Utc::now(),
                    };

                    trades.push(trade.clone());
                    self.recent_trades.push(trade);

                    if resting_order.filled_quantity >= resting_order.quantity {
                        let completed_order = orders.pop_front().unwrap();
                        self.order_lookup.remove(&completed_order.id);
                    }

                    if orders.is_empty() {
                        opposite_side.remove(&price);
                    }
                }
            } else {
                break;
            }
        }

        // Keep only last 1000 trades
        if self.recent_trades.len() > 1000 {
            self.recent_trades.drain(0..self.recent_trades.len() - 1000);
        }

        trades
    }

    fn match_market_order(&mut self, order: &mut Order) -> Vec<Trade> {
        // Similar to limit order, but accept any price
        self.match_limit_order(order)
    }

    fn price_matches(&self, order: &Order, price: u64) -> bool {
        match order.side {
            Side::Buy => order.price >= price,
            Side::Sell => order.price <= price,
        }
    }

    fn add_to_book(&mut self, order: Order) {
        let price_levels = match order.side {
            Side::Buy => &mut self.bids,
            Side::Sell => &mut self.asks,
        };

        price_levels.entry(order.price).or_insert_with(VecDeque::new).push_back(order.clone());
        self.order_lookup.insert(order.id, (order.side, order.price));
    }

    pub fn cancel_order(&mut self, order_id: Uuid) -> Option<Order> {
        if let Some((side, price)) = self.order_lookup.remove(&order_id) {
            let price_levels = match side {
                Side::Buy => &mut self.bids,
                Side::Sell => &mut self.asks,
            };

            if let Some(orders) = price_levels.get_mut(&price) {
                if let Some(pos) = orders.iter().position(|o| o.id == order_id) {
                    let mut order = orders.remove(pos).unwrap();
                    order.status = OrderStatus::Cancelled;
                    order.updated_at = Utc::now();

                    if orders.is_empty() {
                        price_levels.remove(&price);
                    }

                    return Some(order);
                }
            }
        }
        None
    }

    pub fn get_order_book_snapshot(&self, depth: usize) -> OrderBookSnapshot {
        let bids: Vec<PriceLevel> = self.bids.iter().rev().take(depth).map(|(price, orders)| {
            let total_quantity = orders.iter().map(|o| o.quantity - o.filled_quantity).sum();
            PriceLevel {
                price: *price,
                total_quantity,
                order_count: orders.len(),
            }
        }).collect();

        let asks: Vec<PriceLevel> = self.asks.iter().take(depth).map(|(price, orders)| {
            let total_quantity = orders.iter().map(|o| o.quantity - o.filled_quantity).sum();
            PriceLevel {
                price: *price,
                total_quantity,
                order_count: orders.len(),
            }
        }).collect();

        OrderBookSnapshot { bids, asks }
    }

    pub fn get_recent_trades(&self, limit: usize) -> Vec<Trade> {
        self.recent_trades.iter().rev().take(limit).cloned().collect()
    }
}