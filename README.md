# Crypto Market

A Rust-based off-chain crypto market implementation with API Gateway, Matching Engine, and various services.

## Architecture

- **API Gateway**: Axum-based REST API and WebSocket server
- **Order Service**: Handles order placement and cancellation
- **Order Book Service**: Manages order book snapshots with Redis caching
- **Trade Service**: Records trades and provides trade history
- **User Service**: Manages user balances with Redis caching
- **Market Service**: Provides market information
- **Settlement Service**: Queues trades for on-chain settlement
- **Matching Engine**: In-memory order matching with price-time priority

## Database Setup

1. Install PostgreSQL
2. Create database: `createdb matching_engine`
3. Run migrations: `psql -d matching_engine -f migrations/schema.sql`
4. Seed data: `psql -d matching_engine -f migrations/seed.sql`

## Redis Setup

1. Install Redis
2. Start Redis server
3. Configure as needed

## Building

```bash
cargo build --release
```

## Running

```bash
cargo run
```

The API will be available at http://localhost:3000

## API Endpoints

- POST /api/v1/orders - Place order
- DELETE /api/v1/orders/:id - Cancel order
- GET /api/v1/orders - Get user orders
- GET /api/v1/orderbook/:market - Get order book
- GET /api/v1/trades/:market - Get recent trades
- GET /api/v1/users/:id/balance - Get user balance
- GET /api/v1/markets - List markets
- GET /api/v1/settlements/:id - Get settlement status

WebSocket at /ws for real-time updates.

## Note

This is a basic implementation. Production use would require proper error handling, security, and testing.