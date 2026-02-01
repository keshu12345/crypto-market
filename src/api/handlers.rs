use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    Form,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::services::order_service::OrderService;
use crate::engine::types::{Side, Order};

#[derive(Deserialize)]
pub struct PlaceOrderRequest {
    pub user_id: String,
    pub market: String,
    pub side: String,
    pub price: u64,
    pub quantity: u64,
}

#[derive(Serialize)]
pub struct PlaceOrderResponse {
    pub order_id: Uuid,
    pub status: String,
}

pub async fn place_order(
    State(order_service): State<Arc<OrderService>>,
    Form(req): Form<PlaceOrderRequest>,
) -> Result<Json<PlaceOrderResponse>, StatusCode> {
    let side = match req.side.as_str() {
        "buy" => Side::Buy,
        "sell" => Side::Sell,
        _ => return Err(StatusCode::BAD_REQUEST),
    };

    let order = order_service.place_order(req.user_id, req.market, side, req.price, req.quantity)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(PlaceOrderResponse {
        order_id: order.id,
        status: format!("{:?}", order.status),
    }))
}

pub async fn cancel_order(
    State(order_service): State<Arc<OrderService>>,
    Path(order_id): Path<Uuid>,
    // Assume user_id from auth middleware
) -> Result<StatusCode, StatusCode> {
    // For MVP, assume user_id is "user_1"
    let user_id = "user_1".to_string();

    order_service.cancel_order(order_id, user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}

pub async fn get_user_orders(
    State(order_service): State<Arc<OrderService>>,
    // user_id from auth
) -> Result<Json<Vec<Order>>, StatusCode> {
    let user_id = "user_1".to_string();

    let orders = order_service.get_user_orders(user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(orders))
}

pub async fn get_orderbook(
    Path(market): Path<String>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // TODO: implement
    Ok(Json(serde_json::json!({"bids": [], "asks": []})))
}

pub async fn get_trades(
    Path(market): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // TODO: implement
    Ok(Json(serde_json::json!([])))
}

pub async fn get_user_balance(
    Path(user_id): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // TODO: implement
    Ok(Json(serde_json::json!({"available": 0, "locked": 0})))
}

pub async fn get_markets() -> Result<Json<serde_json::Value>, StatusCode> {
    // TODO: implement
    Ok(Json(serde_json::json!([])))
}

pub async fn get_settlement_status(
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // TODO: implement
    Ok(Json(serde_json::json!({"status": "pending"})))
}