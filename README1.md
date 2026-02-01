┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (UI)                            │
│                    React/Next.js + Wallet                        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                            │
│              (Axum/Express - Routing & Auth)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Rate Limiting    • Authentication   • Request Validation│  │
│  │ • CORS             • Logging          • Error Handling    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                          │
│                   (Service Layer - Rust)                         │
│                                                                   │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │   Order      │  │  OrderBook  │  │    Trade             │  │
│  │   Service    │  │   Service   │  │    Service           │  │
│  └──────────────┘  └─────────────┘  └──────────────────────┘  │
│                                                                   │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │   User       │  │   Market    │  │   Settlement         │  │
│  │   Service    │  │   Service   │  │   Service            │  │
│  └──────────────┘  └─────────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Matching     │  │  PostgreSQL │  │      Redis           │  │
│  │ Engine Core  │  │  Database   │  │      Cache           │  │
│  └──────────────┘  └─────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘



  1. API Gateway 
 Off-chain
Build a Rust API Gateway using Axum framework with the following requirements:

LOCATION: OFF-CHAIN (runs on your server)

FEATURES:
1. HTTP REST API endpoints
   - POST /api/v1/orders (place order)
   - DELETE /api/v1/orders/:id (cancel order)
   - GET /api/v1/orders (get user orders)
   - GET /api/v1/orderbook/:market (get order book)
   - GET /api/v1/trades/:market (get recent trades)
   - GET /api/v1/users/:id/balance (get user balance)
   - GET /api/v1/markets (list markets)
   - GET /api/v1/settlements/:id (get settlement status)

2. WebSocket server on /ws endpoint
   - Handle subscriptions to: orders, orderbook, trades, balance, settlement
   - Broadcast updates to subscribers
   - Handle authentication

3. Middleware
   - CORS (allow all origins for MVP)
   - Authentication (API key validation)
   - Rate limiting (100 requests/minute per user)
   - Request logging
   - Error handling

4. Dependencies
   - axum = "0.7"
   - tokio = { version = "1.35", features = ["full"] }
   - tower-http = { version = "0.5", features = ["cors"] }
   - tokio-tungstenite = "0.21" (for WebSocket)
   - serde = { version = "1.0", features = ["derive"] }
   - serde_json = "1.0"

TECHNOLOGY STACK:
- Rust with Axum
- Tokio async runtime
- WebSocket via tokio-tungstenite


DELIVERABLE:
- src/api/gateway.rs - Main API Gateway implementation
- src/api/routes.rs - Route definitions
- src/api/handlers.rs - Request handlers
- src/api/websocket.rs - WebSocket handler
- src/api/middleware.rs - Auth, rate limiting, CORS    2. Order Service OffCahin
Build an Order Service in Rust with the following requirements:

LOCATION: OFF-CHAIN (runs on your server, stores in PostgreSQL)

FEATURES:
1. Place Order Function
   - Accept: user_id, market, side (buy/sell), price, quantity
   - Validate order parameters (price > 0, quantity > 0)
   - Check user balance via UserService
   - Lock user funds via UserService
   - Submit order to MatchingEngine
   - Store order in PostgreSQL
   - Return order_id and status
   - Publish order event to WebSocket

2. Cancel Order Function
   - Verify order exists and belongs to user
   - Remove order from MatchingEngine
   - Unlock user funds via UserService
   - Update order status in PostgreSQL to "cancelled"
   - Publish cancel event to WebSocket

3. Get User Orders Function
   - Query PostgreSQL for user's orders
   - Filter by status (open, filled, cancelled)
   - Return list of orders

4. Integration Points
   - MatchingEngine: Submit/cancel orders
   - UserService: Check/lock/unlock balances
   - TradeService: Record trades when matched
   - SettlementService: Queue trades for on-chain settlement
   - Database: PostgreSQL for persistence

DATABASE SCHEMA:
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    market VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL,
    price BIGINT NOT NULL,
    quantity BIGINT NOT NULL,
    filled_quantity BIGINT DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_orders ON orders(user_id, status);
CREATE INDEX idx_market_orders ON orders(market, status);

TECHNOLOGY:
- Rust
- SQLx for PostgreSQL
- UUID for order IDs
- Async/await with Tokio

DELIVERABLE:
- src/services/order_service.rs
- Database migration files    3. Order Book Service   Off chain  
Build an OrderBook Service in Rust with the following requirements:

LOCATION: OFF-CHAIN (runs in-memory on your server, cached in Redis)

FEATURES:
1. Get Order Book Snapshot
   - Accept: market, depth (default 20 levels)
   - Return: { bids: [{price, quantity, count}], asks: [{price, quantity, count}] }
   - Aggregate orders at same price level
   - Sort bids descending, asks ascending
   - Cache in Redis with 100ms TTL

2. Subscribe to Order Book Updates (WebSocket)
   - Broadcast full snapshot every 100ms
   - Send differential updates on changes
   - Support multiple subscribers per market

3. Data Source
   - Read from MatchingEngine's in-memory order book
   - No database queries (too slow)
   - Cache snapshots in Redis

REDIS CACHING:
Key: "orderbook:{market}:{depth}"
Value: JSON snapshot
TTL: 100ms

OPTIMIZATION:
- Only lock MatchingEngine briefly to get snapshot
- Pre-compute aggregated levels
- Reuse snapshots within TTL window

TECHNOLOGY:
- Rust
- Redis for caching
- Arc<Mutex<MatchingEngine>> for safe concurrent access

DELIVERABLE:
- src/services/orderbook_service.rs    4.     Trade Service Off Chain 
Build a Trade Service in Rust with the following requirements:

LOCATION: OFF-CHAIN (runs on your server, stores in PostgreSQL)

FEATURES:
1. Record Trade Function
   - Accept: Trade object from MatchingEngine
   - Insert into PostgreSQL
   - Publish trade event to WebSocket subscribers
   - Update market statistics (last price, volume)

2. Get Recent Trades Function
   - Accept: market, limit (default 50)
   - For recent trades (< 100): Get from MatchingEngine (in-memory)
   - For older trades: Query PostgreSQL
   - Return: [{ id, price, quantity, side, timestamp }]

3. Get User Trades Function
   - Accept: user_id, filters (market, date range)
   - Query PostgreSQL where user is maker or taker
   - Return user's trade history

4. WebSocket Streaming
   - Broadcast new trades in real-time
   - Support per-market subscriptions

DATABASE SCHEMA:
CREATE TABLE trades (
    id UUID PRIMARY KEY,
    market VARCHAR(20) NOT NULL,
    maker_order_id UUID NOT NULL,
    taker_order_id UUID NOT NULL,
    maker_user_id VARCHAR(100) NOT NULL,
    taker_user_id VARCHAR(100) NOT NULL,
    price BIGINT NOT NULL,
    quantity BIGINT NOT NULL,
    side VARCHAR(4) NOT NULL,
    settlement_id UUID,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_market_trades ON trades(market, timestamp DESC);
CREATE INDEX idx_user_trades ON trades(maker_user_id, timestamp DESC);
CREATE INDEX idx_user_trades2 ON trades(taker_user_id, timestamp DESC);

TECHNOLOGY:
- Rust
- SQLx for PostgreSQL
- Integration with MatchingEngine

DELIVERABLE:
- src/services/trade_service.rs   5.  User Service  Off Chain    PROMPT:
Build a User Service in Rust with the following requirements:

LOCATION: OFF-CHAIN (runs on your server, stores in PostgreSQL)

FEATURES:
1. Get User Balance Function
   - Accept: user_id, asset
   - Return: { available, locked }
   - Cache in Redis for fast access

2. Check and Lock Balance Function
   - Accept: user_id, market, amount, side
   - Determine asset based on side (buy=quote, sell=base)
   - Check if available balance >= amount
   - If yes: available -= amount, locked += amount
   - Update PostgreSQL and Redis cache
   - Return success/failure

3. Unlock Balance Function
   - Accept: user_id, market, amount, side
   - locked -= amount, available += amount
   - Update PostgreSQL and Redis cache

4. Settle Trade Function
   - Accept: Trade object
   - For maker: locked -= sent_amount, available += received_amount
   - For taker: locked -= sent_amount, available += received_amount
   - Update both users' balances
   - Publish balance update events to WebSocket

DATABASE SCHEMA:
CREATE TABLE user_balances (
    user_id VARCHAR(100) NOT NULL,
    asset VARCHAR(10) NOT NULL,
    available BIGINT DEFAULT 0,
    locked BIGINT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, asset)
);

-- For MVP, pre-populate with test balances
INSERT INTO user_balances VALUES
('user_1', 'SOL', 1000000000000, 0, NOW()),
('user_1', 'USDC', 10000000000, 0, NOW());

TECHNOLOGY:
- Rust
- SQLx for PostgreSQL
- Redis for caching
- Atomic balance updates (use transactions)

DELIVERABLE:
- src/services/user_service.rs    6. Market Service   Off Chain   PROMPT:
Build a Market Service in Rust with the following requirements:

LOCATION: OFF-CHAIN (runs on your server, stores in PostgreSQL)

FEATURES:
1. Get All Markets Function
   - Return list of all available markets
   - Include: symbol, base_asset, quote_asset, tick_size, min_order_size, fees
   - Add 24h statistics: last_price, volume, high, low, price_change
   - Cache in Redis with 5-minute TTL

2. Get Market Info Function
   - Accept: market symbol
   - Return detailed market configuration
   - Include trading rules and fees

3. Get 24h Statistics Function
   - Accept: market
   - Query trades from last 24 hours
   - Calculate: volume, high, low, price change
   - Cache results

DATABASE SCHEMA:
CREATE TABLE markets (
    symbol VARCHAR(20) PRIMARY KEY,
    base_asset VARCHAR(10) NOT NULL,
    quote_asset VARCHAR(10) NOT NULL,
    tick_size BIGINT NOT NULL,
    min_order_size BIGINT NOT NULL,
    max_order_size BIGINT NOT NULL,
    maker_fee_bps INTEGER DEFAULT 10,
    taker_fee_bps INTEGER DEFAULT 20,
    status VARCHAR(20) DEFAULT 'active'
);

-- Insert default market for MVP
INSERT INTO markets VALUES (
    'SOL-USDC',
    'SOL',
    'USDC',
    100,           -- tick_size (0.01 USDC)
    100000000,     -- min 0.1 SOL
    100000000000,  -- max 100 SOL
    10,            -- 0.1% maker fee
    20,            -- 0.2% taker fee
    'active'
);

TECHNOLOGY:
- Rust
- SQLx for PostgreSQL
- Redis for caching

DELIVERABLE:
- src/services/market_service.rs    7. Settlement Service  OffChain to onchain   PROMPT:
Build a Settlement Service in Rust with the following requirements:

LOCATION: OFF-CHAIN (runs on your server) + ON-CHAIN (calls Solana)

FEATURES:
1. Queue Settlement Function
   - Accept: array of Trade objects
   - Create PendingSettlement record
   - Add to pending queue (in-memory + PostgreSQL)
   - Return settlement_id

2. Batch Processor (runs every 1-5 seconds)
   - Collect trades from pending queue
   - Group trades by market
   - Create optimized batches (max 10 trades per batch)
   - Ensure total transaction size < 1232 bytes

3. Transaction Builder
   - Create Solana transaction
   - Add ComputeBudget instruction (priority fee)
   - Add Settlement Program instruction with trade data
   - Include all required accounts (user token accounts)
   - Sign with authority keypair

4. Solana Submission
   - Send transaction to Solana RPC
   - Wait for confirmation
   - On success: Mark settlement as confirmed
   - On failure: Move to retry queue

5. Retry Processor (runs every 2 seconds)
   - Get failed settlements from retry queue
   - Apply exponential backoff (2s, 4s, 8s)
   - Retry with higher priority fee (2x)
   - Max 3 retry attempts
   - Mark as failed after max retries

6. Confirmation Monitor (runs every 2 seconds)
   - Check status of submitted transactions
   - Handle dropped transactions (re-submit)
   - Update database on confirmation

DATABASE SCHEMA:
CREATE TABLE settlements (
    id UUID PRIMARY KEY,
    trades JSONB NOT NULL,
    status VARCHAR(20) NOT NULL,
    signature VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP
);

SOLANA INTEGRATION:
- RPC URL: https://api.mainnet-beta.solana.com (or Devnet)
- Program ID: Your deployed Settlement Program
- Authority Keypair: Funded with SOL for transaction fees
- Required Accounts: Market PDA, User token accounts

DEPENDENCIES:
- solana-client = "1.18"
- solana-sdk = "1.18"
- anchor-lang = "0.30"

TECHNOLOGY:
- Rust
- Solana SDK
- PostgreSQL for tracking
- Tokio for async background tasks

DELIVERABLE:
- src/services/settlement_service.rs
- Background task runners (batch, retry, confirmation)    8 . Matching Engine Off Chain 
Build a Matching Engine in Rust with the following requirements:

LOCATION: OFF-CHAIN (runs in-memory on your server)

FEATURES:
1. Order Book Data Structure
   - Use BTreeMap for price levels (sorted)
   - Use VecDeque for orders at same price (FIFO)
   - Separate order books for bids and asks
   - HashMap for quick order lookup by ID

2. Process Order Function
   - Accept: Order object
   - For limit orders:
     * Try to match against opposite side
     * Add remaining quantity to order book
   - For market orders:
     * Match until filled or no liquidity
   - Return: MatchResult { order, trades[], status }

3. Matching Algorithm
   - Price-time priority
   - Best price matched first
   - At same price, earliest order first (FIFO)
   - Generate Trade objects for each match
   - Update order filled quantities

4. Cancel Order Function
   - Accept: order_id
   - Remove from order book
   - Return cancelled Order

5. Get Order Book Snapshot Function
   - Accept: depth (number of levels)
   - Return aggregated price levels
   - Format: { bids: [{price, quantity, count}], asks: [...] }

6. Get Recent Trades Function
   - Accept: limit
   - Return last N trades from in-memory list

DATA STRUCTURES:
struct MatchingEngine {
    market: String,
    bids: OrderBookSide,  // BTreeMap<price, PriceLevel>
    asks: OrderBookSide,
    trades: Vec<Trade>,   // Keep last 1000 trades in memory
}

struct PriceLevel {
    price: u64,
    orders: VecDeque<Order>,
    total_quantity: u64,
}

PERFORMANCE:
- O(log n) order insertion
- O(m) matching (where m = orders matched)
- O(log n) order cancellation
- 100,000+ operations per second

TECHNOLOGY:
- Pure Rust
- No database I/O (all in-memory)
- Thread-safe with Arc<Mutex<MatchingEngine>>

DELIVERABLE:
- src/engine/matching_engine.rs
- src/engine/types.rs (Order, Trade, Side, OrderType)    9 . Order book program on chain   PROMPT:
Build a Solana Orderbook Program using Anchor with the following requirements:

LOCATION: ON-CHAIN (deployed to Solana blockchain)

NOTE: This is OPTIONAL for MVP. Skip this and implement later if you want full decentralization.

FEATURES:
1. Initialize Market Instruction
   - Create Market PDA
   - Create Base Vault (holds SOL)
   - Create Quote Vault (holds USDC)
   - Set authority (your settlement service)
   - Set fee rates

2. Place Order Instruction
   - Accept: order_id, side, price, quantity
   - Create Order PDA for this order
   - Transfer tokens from user to vault (escrow)
   - Emit OrderPlaced event

3. Cancel Order Instruction
   - Close Order PDA
   - Return escrowed tokens to user
   - Emit OrderCancelled event

4. Withdraw Instruction
   - Allow users to withdraw available balance
   - Transfer from vault to user account

ACCOUNTS:
#[account]
pub struct Market {
    pub authority: Pubkey,
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub base_vault: Pubkey,
    pub quote_vault: Pubkey,
    pub fee_rate_bps: u16,
}

#[account]
pub struct Order {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub order_id: u64,
    pub side: Side,
    pub price: u64,
    pub quantity: u64,
    pub filled: u64,
    pub timestamp: i64,
}

DEPLOYMENT:
# Build
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Get program ID
solana address -k target/deploy/orderbook_program-keypair.json

TECHNOLOGY:
- Rust
- Anchor Framework 0.30
- Solana SDK

COST:
- Program deployment: ~0.01 SOL
- Market account rent: ~0.002 SOL
- Order account rent: ~0.002 SOL per order (refunded on cancel)

DELIVERABLE:
- programs/orderbook_program/src/lib.rs
- Anchor.toml configuration
- Deployment scripts   10 Settlement Service On chain  PROMPT:
Build a Solana Settlement Program using Anchor with the following requirements:

LOCATION: ON-CHAIN (deployed to Solana blockchain)

NOTE: This is REQUIRED. This program actually moves tokens between users.

FEATURES:
1. Initialize Market Instruction
   - Create Market PDA
   - Set authority (your settlement service keypair)
   - Set base/quote token mints
   - Set fee rates

2. Settle Trades Instruction
   - Accept: array of TradeData
   - Verify caller is authority
   - For each trade:
     * Transfer base tokens (maker → taker OR taker → maker)
     * Transfer quote tokens (opposite direction)
     * Collect trading fees
   - Emit TradeSettled events

3. Update Market Instruction
   - Allow authority to update market parameters
   - Update fee rates, status

PROGRAM CODE:
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[program]
pub mod settlement_program {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        base_mint: Pubkey,
        quote_mint: Pubkey,
        fee_rate_bps: u16,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.base_mint = base_mint;
        market.quote_mint = quote_mint;
        market.fee_rate_bps = fee_rate_bps;
        Ok(())
    }

    pub fn settle_trades(
        ctx: Context<SettleTrades>,
        trades: Vec<TradeData>,
    ) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.authority.key(),
            ctx.accounts.market.authority,
            ErrorCode::Unauthorized
        );

        for trade in trades {
            // Execute token transfers
            // Transfer base token
            // Transfer quote token
            // Collect fees
            
            emit!(TradeSettled {
                maker: trade.maker,
                taker: trade.taker,
                price: trade.price,
                quantity: trade.quantity,
            });
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SettleTrades<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    // Remaining accounts: user token accounts
}

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub fee_rate_bps: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct TradeData {
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub price: u64,
    pub quantity: u64,
    pub side: Side,
}

DEPLOYMENT:
# Build
anchor build

# Deploy to devnet
solana program deploy target/deploy/settlement_program.so \
  --keypair ~/.config/solana/id.json \
  --url devnet

# Initialize market
anchor run initialize-market

TECHNOLOGY:
- Rust
- Anchor Framework 0.30
- Solana SPL Token

COST:
- Program deployment: ~0.01 SOL
- Market PDA rent: ~0.002 SOL
- Per transaction fee: ~0.000005 SOL

DELIVERABLE:
- programs/settlement_program/src/lib.rs
- programs/settlement_program/src/state.rs
- programs/settlement_program/src/instructions/
- Deployment and initialization scripts    11 Postgres DB off chain  
Set up PostgreSQL database with the following schema:

LOCATION: OFF-CHAIN (separate database server or same VPS)

SCHEMA:

-- Markets
CREATE TABLE markets (
    symbol VARCHAR(20) PRIMARY KEY,
    base_asset VARCHAR(10) NOT NULL,
    quote_asset VARCHAR(10) NOT NULL,
    tick_size BIGINT NOT NULL,
    min_order_size BIGINT NOT NULL,
    max_order_size BIGINT NOT NULL,
    maker_fee_bps INTEGER DEFAULT 10,
    taker_fee_bps INTEGER DEFAULT 20,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Balances
CREATE TABLE user_balances (
    user_id VARCHAR(100) NOT NULL,
    asset VARCHAR(10) NOT NULL,
    available BIGINT DEFAULT 0,
    locked BIGINT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, asset)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    market VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL,
    order_type VARCHAR(20) NOT NULL,
    price BIGINT NOT NULL,
    quantity BIGINT NOT NULL,
    filled_quantity BIGINT DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trades
CREATE TABLE trades (
    id UUID PRIMARY KEY,
    market VARCHAR(20) NOT NULL,
    maker_order_id UUID NOT NULL,
    taker_order_id UUID NOT NULL,
    maker_user_id VARCHAR(100) NOT NULL,
    taker_user_id VARCHAR(100) NOT NULL,
    price BIGINT NOT NULL,
    quantity BIGINT NOT NULL,
    side VARCHAR(4) NOT NULL,
    settlement_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Settlements
CREATE TABLE settlements (
    id UUID PRIMARY KEY,
    trades JSONB NOT NULL,
    status VARCHAR(20) NOT NULL,
    signature VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_orders ON orders(user_id, status);
CREATE INDEX idx_market_orders ON orders(market, status);
CREATE INDEX idx_market_trades ON trades(market, created_at DESC);
CREATE INDEX idx_user_trades_maker ON trades(maker_user_id, created_at DESC);
CREATE INDEX idx_user_trades_taker ON trades(taker_user_id, created_at DESC);
CREATE INDEX idx_settlement_status ON settlements(status);

-- Sample Data
INSERT INTO markets VALUES (
    'SOL-USDC', 'SOL', 'USDC', 
    100, 100000000, 100000000000, 
    10, 20, 'active', NOW()
);

INSERT INTO user_balances VALUES
('user_1', 'SOL', 10000000000, 0, NOW()),
('user_1', 'USDC', 100000000000, 0, NOW()),
('user_2', 'SOL', 10000000000, 0, NOW()),
('user_2', 'USDC', 100000000000, 0, NOW());

SETUP:
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
sudo -u postgres createdb matching_engine

# Run migrations
psql -U postgres -d matching_engine -f schema.sql

TECHNOLOGY:
- PostgreSQL 15+
- Connection pooling (SQLx)

DELIVERABLE:
- migrations/schema.sql
- migrations/seed_data.sql   12 Redis cache Off Chain 
Set up Redis cache with the following key patterns:

LOCATION: OFF-CHAIN (separate Redis server or same VPS)

KEY PATTERNS:

1. Order Book Cache
   Key: orderbook:{market}:{depth}
   Value: JSON snapshot of order book
   TTL: 100ms
   Example: orderbook:SOL-USDC:20

2. User Balance Cache
   Key: balance:{user_id}:{asset}
   Value: JSON { available, locked }
   TTL: 1s
   Example: balance:user_1:SOL

3. Market Stats Cache
   Key: market_stats:{market}
   Value: JSON { last_price, volume_24h, ... }
   TTL: 5 minutes
   Example: market_stats:SOL-USDC

4. Active Orders Cache
   Key: user_orders:{user_id}
   Value: List of order IDs
   TTL: 10s
   Example: user_orders:user_1

SETUP:
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis

# Configure
# In /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru

TECHNOLOGY:
- Redis 7+
- redis-rs crate in Rust

DELIVERABLE:
- Redis configuration
- Connection setup in services 
