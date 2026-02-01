# Crypto Market Trading Interface

A comprehensive React-based frontend for a cryptocurrency trading platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Real-time Trading Interface**: Live order book, trade history, and balance tracking
- **Order Management**: Place buy/sell orders, cancel active orders
- **Market Data**: View order book depth and recent trades
- **Responsive Design**: Mobile-friendly dark theme interface
- **API Integration**: Complete REST API client with error handling

## 🛠 Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React 18** - Modern React with hooks and concurrent features

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with dark theme
│   ├── page.tsx           # Main trading dashboard
│   └── globals.css        # Tailwind CSS imports
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and API clients
├── providers/             # Context providers
└── types/                 # TypeScript type definitions
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on port 3000

### Installation & Setup

```bash
# Install dependencies
cd matching-engine-ui
npm install

# Start development server
npm run dev

# Open in browser
# React UI: http://localhost:3001
# HTML Test: http://localhost:8080/test.html
```

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All API requests require the `x-api-key` header:
```
x-api-key: secret-key
```

---

## 📊 Markets API

### Get All Markets
Returns list of available trading markets.

**Endpoint:** `GET /markets`

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/v1/markets" \
  -H "Content-Type: application/json"
```

**Response Body:**
```json
[
  {
    "symbol": "SOL-USDC",
    "base_asset": "SOL",
    "quote_asset": "USDC",
    "tick_size": 0.01,
    "min_order_size": 0.1,
    "maker_fee_bps": 10,
    "taker_fee_bps": 20
  }
]
```

---

## 📈 Order Book API

### Get Order Book
Returns the current order book for a specific market.

**Endpoint:** `GET /orderbook/{market}`

**Parameters:**
- `market` (path): Market symbol (e.g., "SOL-USDC")

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/v1/orderbook/SOL-USDC" \
  -H "Content-Type: application/json"
```

**Response Body:**
```json
{
  "bids": [
    {
      "price": 100.50,
      "quantity": 10.5,
      "count": 2
    },
    {
      "price": 100.25,
      "quantity": 25.0,
      "count": 1
    }
  ],
  "asks": [
    {
      "price": 101.00,
      "quantity": 8.3,
      "count": 1
    },
    {
      "price": 101.25,
      "quantity": 12.1,
      "count": 2
    }
  ]
}
```

---

## 💱 Trades API

### Get Recent Trades
Returns recent trades for a specific market.

**Endpoint:** `GET /trades/{market}`

**Parameters:**
- `market` (path): Market symbol (e.g., "SOL-USDC")

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/v1/trades/SOL-USDC" \
  -H "Content-Type: application/json"
```

**Response Body:**
```json
[
  {
    "id": "trade_1734567890123",
    "market": "SOL-USDC",
    "maker_order_id": "order_1734567890001",
    "taker_order_id": "order_1734567890002",
    "maker_user_id": "maker_user",
    "taker_user_id": "user_1",
    "price": 100.50,
    "quantity": 1.5,
    "side": "buy",
    "timestamp": "2024-01-15T10:30:00.123Z"
  }
]
```

---

## 👤 User Balance API

### Get User Balance
Returns user's balance for a specific asset.

**Endpoint:** `GET /users/{user_id}/balance`

**Parameters:**
- `user_id` (path): User identifier
- `asset` (query): Asset symbol (e.g., "SOL", "USDC")

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/v1/users/user_1/balance?asset=SOL" \
  -H "Content-Type: application/json"
```

**Response Body:**
```json
{
  "available": 950.5,
  "locked": 49.5
}
```

---

## 📋 Orders API

### Get User Orders
Returns all orders for a specific user.

**Endpoint:** `GET /orders`

**Parameters:**
- `user_id` (query): User identifier

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/v1/orders?user_id=user_1" \
  -H "Content-Type: application/json"
```

**Response Body:**
```json
[
  {
    "id": "order_1734567890123",
    "user_id": "user_1",
    "market": "SOL-USDC",
    "side": "buy",
    "order_type": "limit",
    "price": 100.50,
    "quantity": 1.5,
    "filled_quantity": 0.0,
    "status": "open",
    "created_at": "2024-01-15T10:30:00.123Z",
    "updated_at": "2024-01-15T10:30:00.123Z"
  }
]
```

### Place Order
Creates a new order for the user.

**Endpoint:** `POST /orders`

**Request Body:**
```json
{
  "user_id": "user_1",
  "market": "SOL-USDC",
  "side": "buy",
  "price": 100.50,
  "quantity": 1.5
}
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/v1/orders" \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-key" \
  -d '{
    "user_id": "user_1",
    "market": "SOL-USDC",
    "side": "buy",
    "price": 100.50,
    "quantity": 1.5
  }'
```

**Response Body:**
```json
{
  "order_id": "order_1734567890123",
  "status": "placed"
}
```

### Cancel Order
Cancels an existing order.

**Endpoint:** `DELETE /orders/{order_id}`

**Parameters:**
- `order_id` (path): Order identifier

**Request Body:**
```json
{
  "user_id": "user_1"
}
```

**cURL:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/orders/order_1734567890123" \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-key" \
  -d '{
    "user_id": "user_1"
  }'
```

**Response Body:**
```json
{
  "status": "cancelled"
}
```

---

## 🔄 Settlement API

### Get Settlement Status
Returns the status of a settlement.

**Endpoint:** `GET /settlements/{settlement_id}`

**Parameters:**
- `settlement_id` (path): Settlement identifier

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/v1/settlements/settlement_123" \
  -H "Content-Type: application/json"
```

**Response Body:**
```json
{
  "status": "confirmed",
  "settlement_id": "settlement_123"
}
```

---

## 🏥 Health Check API

### Get Health Status
Returns the health status of the API.

**Endpoint:** `GET /health`

**cURL:**
```bash
curl -X GET "http://localhost:3000/health" \
  -H "Content-Type: application/json"
```

**Response Body:**
```json
{
  "status": "OK"
}
```

---

## 🎮 Testing the APIs

### 1. Place a Buy Order
```bash
curl -X POST "http://localhost:3000/api/v1/orders" \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-key" \
  -d '{
    "user_id": "user_1",
    "market": "SOL-USDC",
    "side": "buy",
    "price": 100.50,
    "quantity": 1.0
  }'
```

### 2. Check Order Book
```bash
curl -X GET "http://localhost:3000/api/v1/orderbook/SOL-USDC"
```

### 3. View Recent Trades
```bash
curl -X GET "http://localhost:3000/api/v1/trades/SOL-USDC"
```

### 4. Check User Orders
```bash
curl -X GET "http://localhost:3000/api/v1/orders?user_id=user_1"
```

### 5. Check Balance
```bash
curl -X GET "http://localhost:3000/api/v1/users/user_1/balance?asset=SOL"
curl -X GET "http://localhost:3000/api/v1/users/user_1/balance?asset=USDC"
```

### 6. Cancel an Order
```bash
curl -X DELETE "http://localhost:3000/api/v1/orders/order_1734567890123" \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-key" \
  -d '{"user_id": "user_1"}'
```

---

## 🎨 UI Features

### Trading Interface
- **Order Book**: Real-time bid/ask prices and quantities
- **Order Form**: Place buy/sell orders with price and quantity
- **Trade History**: Recent market trades with timestamps
- **User Orders**: Active orders with cancel functionality
- **Balance Display**: Available and locked balances

### Responsive Design
- Mobile-friendly layout
- Dark theme optimized for trading
- Real-time data updates

---

## 🔧 Development

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### API Error Handling
The UI includes comprehensive error handling for:
- Network failures
- Invalid API responses
- Authentication errors
- Rate limiting

---

## 📱 Mobile Support

The interface is fully responsive and works on:
- Desktop browsers
- Tablet devices
- Mobile phones
- Touch interfaces

---

## 🔒 Security

- API key authentication required
- CORS properly configured
- Input validation on frontend
- Secure HTTPS in production

---

## 🐛 Troubleshooting

### Common Issues

**UI not loading data:**
- Check if backend API is running on port 3000
- Verify CORS configuration
- Check browser console for errors

**Orders not placing:**
- Verify API key in request headers
- Check user balance is sufficient
- Validate price and quantity formats

**Real-time updates not working:**
- Check WebSocket connection
- Verify backend WebSocket server is running

---

## 📞 Support

For issues or questions:
1. Check the API documentation above
2. Test endpoints with curl commands
3. Check browser developer tools for errors
4. Verify backend services are running

---

## 🎯 Next Steps

- [ ] Add WebSocket real-time updates
- [ ] Implement price charts
- [ ] Add order book depth visualization
- [ ] Integrate Solana wallet connection
- [ ] Add trade notifications
- [ ] Implement advanced order types (stop-loss, etc.)

---

**🚀 Happy Trading!**
