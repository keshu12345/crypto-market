use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::{Response, IntoResponse},
};
use tower_http::cors::CorsLayer;
use tower::{ServiceBuilder, Layer};
use governor::{Quota, RateLimiter, clock::DefaultClock};
use std::sync::Arc;
use std::net::SocketAddr;

// Auth middleware (simple API key for MVP)
pub async fn auth<B>(req: Request<B>, next: Next<B>) -> impl IntoResponse {
    // Check API key in headers
    let api_key = req.headers().get("x-api-key");
    if api_key.is_none() || api_key.unwrap() != "secret-key" {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    next.run(req).await
}

pub fn auth_layer() -> tower::layer::layer_fn::LayerFn<impl tower::Service<axum::http::Request<axum::body::Body>, Response = axum::response::Response, Error = axum::Error> + Clone> {
    tower::layer::layer_fn(auth)
}

// Rate limiting (simplified)
pub async fn rate_limit<B>(req: Request<B>, next: Next<B>) -> impl IntoResponse {
    // For MVP, no rate limiting
    next.run(req).await
}

pub fn rate_limit_layer() -> tower::layer::layer_fn::LayerFn<impl tower::Service<axum::http::Request<axum::body::Body>, Response = axum::response::Response, Error = axum::Error> + Clone> {
    tower::layer::layer_fn(rate_limit)
}

// Logging
pub async fn logging<B>(req: Request<B>, next: Next<B>) -> Response {
    tracing::info!("{} {} {}", req.method(), req.uri(), req.headers().get("user-agent").unwrap_or(&"".parse().unwrap()).to_str().unwrap_or(""));
    next.run(req).await
}

pub fn logging_layer() -> tower::layer::layer_fn::LayerFn<impl tower::Service<axum::http::Request<axum::body::Body>, Response = axum::response::Response, Error = axum::Error> + Clone> {
    tower::layer::layer_fn(logging)
}