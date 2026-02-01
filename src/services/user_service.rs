use sqlx::PgPool;
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Balance {
    pub available: u64,
    pub locked: u64,
}

pub struct UserService {
    db_pool: PgPool,
    redis_client: redis::Client,
}

impl UserService {
    pub fn new() -> Self {
        let db_pool = todo!();
        let redis_client = redis::Client::open("redis://127.0.0.1/").unwrap();
        Self { db_pool, redis_client }
    }

    pub async fn get_user_balance(&self, user_id: &str, asset: &str) -> Result<Balance, Box<dyn std::error::Error>> {
        let cache_key = format!("balance:{}:{}", user_id, asset);

        let mut conn = self.redis_client.get_async_connection().await?;
        if let Ok(cached) = conn.get::<_, String>(&cache_key).await {
            let balance: Balance = serde_json::from_str(&cached)?;
            return Ok(balance);
        }

        let row = sqlx::query!(
            "SELECT available, locked FROM user_balances WHERE user_id = $1 AND asset = $2",
            user_id,
            asset
        )
        .fetch_optional(&self.db_pool)
        .await?;

        let balance = if let Some(row) = row {
            Balance {
                available: row.available as u64,
                locked: row.locked as u64,
            }
        } else {
            Balance { available: 0, locked: 0 }
        };

        let json = serde_json::to_string(&balance)?;
        let _: () = conn.set_ex(&cache_key, json, 1).await?;

        Ok(balance)
    }
}