use sqlx::PgPool;
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Market {
    pub symbol: String,
    pub base_asset: String,
    pub quote_asset: String,
    pub tick_size: u64,
    pub min_order_size: u64,
    pub maker_fee_bps: u16,
    pub taker_fee_bps: u16,
}

pub struct MarketService {
    db_pool: PgPool,
    redis_client: redis::Client,
}

impl MarketService {
    pub fn new() -> Self {
        let db_pool = todo!();
        let redis_client = redis::Client::open("redis://127.0.0.1/").unwrap();
        Self { db_pool, redis_client }
    }

    pub async fn get_all_markets(&self) -> Result<Vec<Market>, Box<dyn std::error::Error>> {
        let cache_key = "markets";

        let mut conn = self.redis_client.get_async_connection().await?;
        if let Ok(cached) = conn.get::<_, String>(cache_key).await {
            let markets: Vec<Market> = serde_json::from_str(&cached)?;
            return Ok(markets);
        }

        let rows = sqlx::query!(
            "SELECT symbol, base_asset, quote_asset, tick_size, min_order_size, maker_fee_bps, taker_fee_bps FROM markets"
        )
        .fetch_all(&self.db_pool)
        .await?;

        let markets = rows.into_iter().map(|row| Market {
            symbol: row.symbol,
            base_asset: row.base_asset,
            quote_asset: row.quote_asset,
            tick_size: row.tick_size as u64,
            min_order_size: row.min_order_size as u64,
            maker_fee_bps: row.maker_fee_bps as u16,
            taker_fee_bps: row.taker_fee_bps as u16,
        }).collect::<Vec<_>>();

        let json = serde_json::to_string(&markets)?;
        let _: () = conn.set_ex(cache_key, json, 300).await?;

        Ok(markets)
    }
}