use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
use chrono::Utc;
use sqlx::PgPool;

use crate::engine::types::{Order, OrderStatus, OrderType, Side, MatchResult};
use crate::engine::matching_engine::MatchingEngine;

pub struct OrderService {
    db_pool: PgPool,
    matching_engine: Arc<Mutex<MatchingEngine>>,
    // user_service: Arc<UserService>, etc.
}

impl OrderService {
    pub fn new(matching_engine: Arc<Mutex<MatchingEngine>>) -> Self {
        // TODO: initialize db_pool
        let db_pool = todo!();
        Self {
            db_pool,
            matching_engine,
        }
    }

    pub async fn place_order(
        &self,
        user_id: String,
        market: String,
        side: Side,
        price: u64,
        quantity: u64,
    ) -> Result<Order, Box<dyn std::error::Error>> {
        // Validate
        if price == 0 || quantity == 0 {
            return Err("Invalid price or quantity".into());
        }

        // Check balance via UserService
        // TODO: integrate user_service.check_and_lock_balance

        // Create order
        let order = Order {
            id: Uuid::new_v4(),
            user_id,
            market,
            side,
            order_type: OrderType::Limit,  // for now
            price,
            quantity,
            filled_quantity: 0,
            status: OrderStatus::Open,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // Store in DB
        let side_str = match order.side { Side::Buy => "Buy", Side::Sell => "Sell" };
        let type_str = match order.order_type { OrderType::Limit => "Limit", OrderType::Market => "Market" };
        let status_str = match order.status { OrderStatus::Open => "Open", OrderStatus::Filled => "Filled", OrderStatus::Cancelled => "Cancelled", OrderStatus::Partial => "Partial" };

        sqlx::query!(
            "INSERT INTO orders (id, user_id, market, side, order_type, price, quantity, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
            order.id,
            order.user_id,
            order.market,
            side_str,
            type_str,
            order.price as i64,
            order.quantity as i64,
            status_str,
            order.created_at,
            order.updated_at
        )
        .execute(&self.db_pool)
        .await?;

        // Submit to MatchingEngine
        let mut engine = self.matching_engine.lock().await;
        let result = engine.process_order(order);

        // Update DB with filled quantity
        let status_str = match result.order.status { OrderStatus::Open => "Open", OrderStatus::Filled => "Filled", OrderStatus::Cancelled => "Cancelled", OrderStatus::Partial => "Partial" };
        sqlx::query!(
            "UPDATE orders SET filled_quantity = $1, status = $2, updated_at = $3 WHERE id = $4",
            result.order.filled_quantity as i64,
            status_str,
            Utc::now(),
            result.order.id
        )
        .execute(&self.db_pool)
        .await?;

        // Publish order event to WebSocket
        // TODO: websocket broadcast

        Ok(result.order)
    }

    pub async fn cancel_order(&self, order_id: Uuid, user_id: String) -> Result<(), Box<dyn std::error::Error>> {
        // Fetch order
        let row = sqlx::query!(
            "SELECT id, user_id, market, side, order_type, price, quantity, filled_quantity, status, created_at, updated_at FROM orders WHERE id = $1 AND user_id = $2",
            order_id,
            user_id
        )
        .fetch_optional(&self.db_pool)
        .await?
        .ok_or("Order not found")?;

        let side = match row.side.as_str() { "Buy" => Side::Buy, "Sell" => Side::Sell, _ => panic!() };
        let order_type = match row.order_type.as_str() { "Limit" => OrderType::Limit, "Market" => OrderType::Market, _ => panic!() };
        let status = match row.status.as_str() { "Open" => OrderStatus::Open, "Filled" => OrderStatus::Filled, "Cancelled" => OrderStatus::Cancelled, "Partial" => OrderStatus::Partial, _ => panic!() };
        let order = Order {
            id: row.id,
            user_id: row.user_id,
            market: row.market,
            side,
            order_type,
            price: row.price as u64,
            quantity: row.quantity as u64,
            filled_quantity: row.filled_quantity as u64,
            status,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };

        if order.status != OrderStatus::Open {
            return Err("Order not open".into());
        }

        // Cancel in engine
        let mut engine = self.matching_engine.lock().await;
        engine.cancel_order(order_id);

        // Update DB
        sqlx::query!(
            "UPDATE orders SET status = 'Cancelled', updated_at = $1 WHERE id = $2",
            Utc::now(),
            order_id
        )
        .execute(&self.db_pool)
        .await?;

        // Unlock funds
        // TODO: user_service.unlock_balance

        // Publish cancel event
        // TODO: websocket

        Ok(())
    }

    pub async fn get_user_orders(&self, user_id: String) -> Result<Vec<Order>, Box<dyn std::error::Error>> {
        let rows = sqlx::query!(
            "SELECT id, user_id, market, side, order_type, price, quantity, filled_quantity, status, created_at, updated_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
            user_id
        )
        .fetch_all(&self.db_pool)
        .await?;

        let orders = rows.into_iter().map(|row| {
            let side = match row.side.as_str() { "Buy" => Side::Buy, "Sell" => Side::Sell, _ => panic!() };
            let order_type = match row.order_type.as_str() { "Limit" => OrderType::Limit, "Market" => OrderType::Market, _ => panic!() };
            let status = match row.status.as_str() { "Open" => OrderStatus::Open, "Filled" => OrderStatus::Filled, "Cancelled" => OrderStatus::Cancelled, "Partial" => OrderStatus::Partial, _ => panic!() };
            Order {
                id: row.id,
                user_id: row.user_id,
                market: row.market,
                side,
                order_type,
                price: row.price as u64,
                quantity: row.quantity as u64,
                filled_quantity: row.filled_quantity as u64,
                status,
                created_at: row.created_at,
                updated_at: row.updated_at,
            }
        }).collect();

        Ok(orders)
    }
}