use std::sync::Arc;
use tokio::sync::Mutex;
use redis::AsyncCommands;
use serde_json;

use crate::engine::matching_engine::MatchingEngine;
use crate::engine::types::OrderBookSnapshot;

pub struct OrderBookService {
    matching_engine: Arc<Mutex<MatchingEngine>>,
    redis_client: redis::Client,
}

impl OrderBookService {
    pub fn new(matching_engine: Arc<Mutex<MatchingEngine>>) -> Self {
        let redis_client = redis::Client::open("redis://127.0.0.1/").unwrap();
        Self {
            matching_engine,
            redis_client,
        }
    }

    pub async fn get_order_book(&self, market: &str, depth: usize) -> Result<OrderBookSnapshot, Box<dyn std::error::Error>> {
        let cache_key = format!("orderbook:{}:{}", market, depth);

        let mut conn = self.redis_client.get_async_connection().await?;
        if let Ok(cached) = conn.get::<_, String>(&cache_key).await {
            let snapshot: OrderBookSnapshot = serde_json::from_str(&cached)?;
            return Ok(snapshot);
        }

        // Get from engine
        let engine = self.matching_engine.lock().await;
        let snapshot = engine.get_order_book_snapshot(depth);

        // Cache
        let json = serde_json::to_string(&snapshot)?;
        let _: () = conn.set_ex(&cache_key, json, 100).await?;

        Ok(snapshot)
    }
}