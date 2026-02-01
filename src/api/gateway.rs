use std::sync::Arc;
use axum::{
    routing::{get, post, delete},
    Router,
};
use tower_http::cors::CorsLayer;
use tokio::net::TcpListener;

use crate::services::order_service::OrderService;

pub async fn start_gateway(order_service: Arc<OrderService>) {
    let app = Router::new()
        .route("/api/v1/orders", post(crate::api::handlers::place_order))
        .route("/api/v1/orders/:id", delete(crate::api::handlers::cancel_order))
        .route("/api/v1/orders", get(crate::api::handlers::get_user_orders))
        .route("/api/v1/orderbook/:market", get(crate::api::handlers::get_orderbook))
        .route("/api/v1/trades/:market", get(crate::api::handlers::get_trades))
        .route("/api/v1/users/:id/balance", get(crate::api::handlers::get_user_balance))
        .route("/api/v1/markets", get(crate::api::handlers::get_markets))
        .route("/api/v1/settlements/:id", get(crate::api::handlers::get_settlement_status))
        .route("/ws", get(crate::api::websocket::handle_websocket))
        .layer(CorsLayer::permissive())  // Allow all origins for MVP
        .layer(crate::api::middleware::auth_layer())
        .layer(crate::api::middleware::rate_limit_layer())
        .layer(crate::api::middleware::logging_layer())
        .with_state(order_service);

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("API Gateway listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}