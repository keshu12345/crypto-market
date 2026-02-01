use sqlx::PgPool;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct TradeData {
    pub maker: String,
    pub taker: String,
    pub price: u64,
    pub quantity: u64,
}

pub struct SettlementService {
    db_pool: PgPool,
}

impl SettlementService {
    pub fn new() -> Self {
        let db_pool = todo!();
        Self { db_pool }
    }

    pub async fn queue_settlement(&self, trades: Vec<TradeData>) -> Result<Uuid, Box<dyn std::error::Error>> {
        let id = Uuid::new_v4();
        let trades_json = serde_json::to_value(trades)?;

        sqlx::query!(
            "INSERT INTO settlements (id, trades, status) VALUES ($1, $2, 'pending')",
            id,
            trades_json
        )
        .execute(&self.db_pool)
        .await?;

        Ok(id)
    }
}