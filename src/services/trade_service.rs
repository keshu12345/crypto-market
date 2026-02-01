use sqlx::PgPool;
use uuid::Uuid;

use crate::engine::types::Trade;

pub struct TradeService {
    db_pool: PgPool,
    // matching_engine: Arc<Mutex<MatchingEngine>>,
}

impl TradeService {
    pub fn new() -> Self {
        // TODO: db_pool
        let db_pool = todo!();
        Self { db_pool }
    }

    pub async fn record_trade(&self, trade: Trade) -> Result<(), Box<dyn std::error::Error>> {
        sqlx::query!(
            "INSERT INTO trades (id, market, maker_order_id, taker_order_id, maker_user_id, taker_user_id, price, quantity, side, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
            trade.id,
            trade.market,
            trade.maker_order_id,
            trade.taker_order_id,
            trade.maker_user_id,
            trade.taker_user_id,
            trade.price as i64,
            trade.quantity as i64,
            format!("{:?}", trade.side),
            trade.timestamp
        )
        .execute(&self.db_pool)
        .await?;

        // Publish to WS
        Ok(())
    }

    pub async fn get_recent_trades(&self, market: &str, limit: usize) -> Result<Vec<Trade>, Box<dyn std::error::Error>> {
        // TODO: implement
        Ok(vec![])
    }
}