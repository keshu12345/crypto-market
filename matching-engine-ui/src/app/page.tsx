import { PriceChart } from '../components/PriceChart';
import { OrderBook } from '../components/OrderBook';
import { OrderForm } from '../components/OrderForm';
import { TradeHistory } from '../components/TradeHistory';
import { UserOrders } from '../components/UserOrders';
import { UserBalance } from '../components/UserBalance';

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Charts and Order Book */}
      <div className="lg:col-span-8 space-y-6">
        <PriceChart />
        <OrderBook />
      </div>

      {/* Right Column - Trading Interface */}
      <div className="lg:col-span-4 space-y-6">
        <OrderForm />
        <UserBalance />
      </div>

      {/* Bottom Section - Orders and Trades */}
      <div className="lg:col-span-6 space-y-6">
        <UserOrders />
      </div>

      <div className="lg:col-span-6 space-y-6">
        <TradeHistory />
      </div>
    </div>
  );
}
