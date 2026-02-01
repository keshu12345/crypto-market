# Solana DEX Trading Interface

A React-based frontend for a Solana decentralized exchange (DEX) built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Real-time Trading Interface**: Order book, price charts, and trade history
- **Wallet Integration**: Connect Solana wallets (Phantom, Solflare)
- **Order Management**: Place limit/market orders, view active orders
- **Balance Tracking**: Display user balances with real-time updates
- **WebSocket Integration**: Live data streaming for trades and order updates
- **Responsive Design**: Mobile-friendly trading interface

## Technology Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Solana Wallet Adapter** - Wallet connectivity
- **Zustand** - State management
- **Axios** - HTTP client for API calls
- **Socket.io-client** - WebSocket client
- **Recharts** - Chart visualization

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with wallet provider
│   ├── page.tsx           # Main trading page
│   └── globals.css        # Tailwind styles
├── components/
│   ├── OrderBook.tsx      # Order book display
│   ├── OrderForm.tsx      # Order placement form
│   ├── TradeHistory.tsx   # Recent trades table
│   ├── UserOrders.tsx     # User's active orders
│   ├── UserBalance.tsx    # Balance display
│   ├── PriceChart.tsx     # Price chart with Recharts
│   ├── Header.tsx         # Navigation header
│   └── WalletButton.tsx   # Wallet connection button
├── hooks/
│   ├── useWebSocket.ts    # WebSocket connection hook
│   ├── useOrderBook.ts    # Order book data hook
│   ├── useTrades.ts       # Trade data hook
│   └── useBalance.ts      # Balance data hook
├── store/
│   └── useStore.ts        # Zustand global state
├── lib/
│   ├── api.ts             # API client functions
│   └── websocket.ts       # WebSocket client
├── providers/
│   └── WalletProvider.tsx # Solana wallet provider
└── types/
    └── index.ts           # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

The frontend connects to the Rust API Gateway backend running on port 3000. Make sure the backend is running for full functionality.

## Wallet Setup

1. Install a Solana wallet (Phantom, Solflare)
2. Connect your wallet using the "Connect Wallet" button
3. The app will use your wallet address as the user ID

## Building for Production

```bash
npm run build
npm start
```

## Development

- Uses TypeScript for type safety
- Tailwind CSS for styling
- Hot reload enabled in development
- ESLint for code quality

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Follow Tailwind CSS conventions
4. Test wallet interactions thoroughly

## License

MIT
