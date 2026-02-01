mod api;
mod services;
mod engine;

use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    // Initialize services
    let matching_engine = Arc::new(Mutex::new(engine::matching_engine::MatchingEngine::new("SOL-USDC".to_string())));
    let order_service = Arc::new(services::order_service::OrderService::new(matching_engine.clone()));
    // TODO: initialize other services

    // Start API Gateway
    api::gateway::start_gateway(order_service).await;
}