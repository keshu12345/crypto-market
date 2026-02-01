const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use(express.json());

// Mock data
let orders = [];
let trades = [];
let orderBook = {
  bids: [
    { price: 100.50, quantity: 10.5, count: 2 },
    { price: 100.25, quantity: 25.0, count: 1 },
    { price: 100.00, quantity: 15.2, count: 3 }
  ],
  asks: [
    { price: 101.00, quantity: 8.3, count: 1 },
    { price: 101.25, quantity: 12.1, count: 2 },
    { price: 101.50, quantity: 20.0, count: 1 }
  ]
};

let userBalances = {
  'user_1': {
    SOL: { available: 1000.0, locked: 0.0 },
    USDC: { available: 50000.0, locked: 0.0 }
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Crypto Market API Gateway' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Markets
app.get('/api/v1/markets', (req, res) => {
  res.json([
    {
      symbol: 'SOL-USDC',
      base_asset: 'SOL',
      quote_asset: 'USDC',
      tick_size: 0.01,
      min_order_size: 0.1,
      maker_fee_bps: 10,
      taker_fee_bps: 20
    }
  ]);
});

// Order Book
app.get('/api/v1/orderbook/:market', (req, res) => {
  res.json(orderBook);
});

// Trades
app.get('/api/v1/trades/:market', (req, res) => {
  res.json(trades);
});

// User Balance
app.get('/api/v1/users/:id/balance', (req, res) => {
  const userId = req.params.id;
  const asset = req.query.asset || 'SOL';

  if (!userBalances[userId] || !userBalances[userId][asset]) {
    return res.json({ available: 0, locked: 0 });
  }

  res.json(userBalances[userId][asset]);
});

// User Orders
app.get('/api/v1/orders', (req, res) => {
  const userId = req.query.user_id;
  const userOrders = orders.filter(order => order.user_id === userId);
  res.json(userOrders);
});

// Place Order
app.post('/api/v1/orders', (req, res) => {
  const { user_id, market, side, price, quantity } = req.body;

  const order = {
    id: `order_${Date.now()}`,
    user_id,
    market,
    side,
    order_type: 'limit',
    price: parseFloat(price),
    quantity: parseFloat(quantity),
    filled_quantity: 0,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  orders.push(order);

  // Create a mock trade
  const trade = {
    id: `trade_${Date.now()}`,
    market,
    maker_order_id: 'maker_order_1',
    taker_order_id: order.id,
    maker_user_id: 'maker_user',
    taker_user_id: user_id,
    price: parseFloat(price),
    quantity: parseFloat(quantity),
    side,
    timestamp: new Date().toISOString()
  };

  trades.push(trade);

  res.json({
    order_id: order.id,
    status: 'placed'
  });
});

// Cancel Order
app.delete('/api/v1/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const orderIndex = orders.findIndex(order => order.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[orderIndex].status = 'cancelled';
  orders[orderIndex].updated_at = new Date().toISOString();

  res.json({ status: 'cancelled' });
});

// Settlement Status
app.get('/api/v1/settlements/:id', (req, res) => {
  res.json({ status: 'confirmed', settlement_id: req.params.id });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Crypto Market API Server running on http://localhost:${PORT}`);
});