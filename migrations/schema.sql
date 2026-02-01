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