import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Order from './Order.jsx';

import {
  BarChart3,
  Bell,
  ChevronDown,
  LineChart,
  Plus,
  Search,
  Settings,
  Star,
  Wallet
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const API = "http://localhost:5000/api";

function money(value) {
  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function App() {
  const [stocks, setStocks] = useState([]);
  const [selected, setSelected] = useState("RELIANCE");
  const [quote, setQuote] = useState(null);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState(1);
  const [orderType, setOrderType] = useState("MARKET");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
 
  

  const handleorderpage =() =>{
 <Order/>
  }

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/stocks`),
      axios.get(`${API}/orders`)
    ]).then(([stocksRes, ordersRes]) => {
      setStocks(stocksRes.data);
      setOrders(ordersRes.data);
    });
  }, []);

  useEffect(() => {
    axios.get(`${API}/quote/${selected}`).then(res => {
      setQuote(res.data);
      setPrice(res.data.price.toFixed(2));
    });
  }, [selected]);

  const filteredStocks = useMemo(() => {
    const q = search.toLowerCase();
    return stocks.filter(s =>
      `${s.symbol} ${s.name}`.toLowerCase().includes(q)
    );
  }, [stocks, search]);

  const submitOrder = async () => {
    try {
      const response = await axios.post(`${API}/orders`, {
        symbol: selected,
        side,
        qty,
        orderType,
        price: orderType === "MARKET" ? quote.price : Number(price)
      });

      setOrders(prev => [response.data, ...prev]);
      setMessage(`${side} order placed for ${qty} ${selected}`);
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Order failed");
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div>
            <div className="brand-name">TradeDesk</div>
            <div className="brand-sub">Dummy NSE Trading</div>
          </div>
        </div>

        <nav className="main-nav">
          <button className="nav-active">Dashboard</button>
          <button onClick={handleorderpage}>Orders</button>
          <button>Positions</button>
          <button>Funds</button>
        </nav>

        <div className="top-actions">
          <button className="icon-btn"><Bell size={18} /></button>
          <button className="icon-btn"><Settings size={18} /></button>
          <div className="profile">SK</div>
        </div>
      </header>

      <main className="workspace">
        <aside className="watchlist-panel">
          <div className="panel-header">
            <div>
              <h2>Market Watch</h2>
              <span>NSE • Live demo</span>
            </div>
            <button className="small-icon"><Plus size={17} /></button>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stocks"
            />
          </div>

          <div className="watch-tabs">
            <button className="tab-active">Watchlist 1</button>
            <button>All</button>
          </div>

          <div className="watchlist">
            {filteredStocks.map(stock => (
              <button
                key={stock.symbol}
                className={`watch-row ${selected === stock.symbol ? "selected" : ""}`}
                onClick={() => setSelected(stock.symbol)}
              >
                <div className="stock-logo">{stock.symbol.slice(0, 2)}</div>
                <div className="stock-info">
                  <strong>{stock.symbol}</strong>
                  <span>{stock.name}</span>
                </div>
                <div className="stock-price">
                  <strong>{money(stock.price)}</strong>
                  <span className={stock.change >= 0 ? "positive" : "negative"}>
                    {stock.change >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="main-panel">
          <div className="quote-header">
            <div>
              <div className="instrument-line">
                <h1>{quote?.symbol || selected}</h1>
                <span className="exchange-pill">NSE</span>
              </div>
              <p>{quote?.name || "Loading..."}</p>
            </div>

            <div className="quote-price">
              <strong>{quote ? money(quote.price) : "—"}</strong>
              <span className={quote?.change >= 0 ? "positive" : "negative"}>
                {quote?.change >= 0 ? "+" : ""}{quote?.change?.toFixed(2)} ({quote?.changePct?.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="chart-toolbar">
            <div className="range-buttons">
              {["1D", "1W", "1M", "3M", "1Y"].map((r, i) => (
                <button className={i === 0 ? "range-active" : ""} key={r}>{r}</button>
              ))}
            </div>
            <div className="chart-actions">
              <button><LineChart size={15} /> Line</button>
              <button><BarChart3 size={15} /> Indicators</button>
            </div>
          </div>

          <div className="chart-card">
            {quote?.chart && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quote.chart} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#28c76f" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#28c76f" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222a38" />
                  <XAxis dataKey="time" tick={{ fill: "#7f8ba3", fontSize: 11 }} />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fill: "#7f8ba3", fontSize: 11 }}
                    tickFormatter={v => `₹${v}`}
                    width={65}
                  />
                  <Tooltip
                    contentStyle={{ background: "#151b26", border: "1px solid #2b3445", borderRadius: 8 }}
                    labelStyle={{ color: "#aab4c6" }}
                    formatter={(value) => [money(value), "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#28c76f"
                    fill="url(#priceFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="stats-grid">
            <Stat label="Open" value={quote?.chart?.[0]?.open} />
            <Stat label="High" value={quote?.chart ? Math.max(...quote.chart.map(x => x.high)) : null} />
            <Stat label="Low" value={quote?.chart ? Math.min(...quote.chart.map(x => x.low)) : null} />
            <Stat label="Prev. close" value={quote?.price ? quote.price - quote.change : null} />
          </div>

          <section className="orders-section">
            <div className="section-title">
              <h2>Recent Orders</h2>
              <button>View all</button>
            </div>

            <div className="orders-table">
              <div className="order-head">
                <span>Symbol</span>
                <span>Side</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Type</span>
                <span>Status</span>
              </div>

              {orders.slice(0, 5).map(order => (
                <div className="order-row" key={order.id}>
                  <strong>{order.symbol}</strong>
                  <span className={order.side === "BUY" ? "buy-text" : "sell-text"}>{order.side}</span>
                  <span>{order.qty}</span>
                  <span>{money(order.price)}</span>
                  <span>{order.orderType}</span>
                  <span>
                    <em className={`status ${order.status.toLowerCase()}`}>{order.status}</em>
                  </span>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="empty-orders">No orders yet</div>
              )}
            </div>
          </section>
        </section>

        <aside className="order-panel">
          <div className="order-panel-header">
            <div>
              <span>Place Order</span>
              <h2>{selected}</h2>
            </div>
            <Wallet size={20} />
          </div>

          <div className="side-toggle">
            <button className={side === "BUY" ? "buy-active" : ""} onClick={() => setSide("BUY")}>BUY</button>
            <button className={side === "SELL" ? "sell-active" : ""} onClick={() => setSide("SELL")}>SELL</button>
          </div>

          <label>Quantity</label>
          <div className="input-box">
            <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} />
            <span>Qty</span>
          </div>

          <label>Order type</label>
          <div className="select-box">
            <select value={orderType} onChange={e => setOrderType(e.target.value)}>
              <option value="MARKET">Market</option>
              <option value="LIMIT">Limit</option>
            </select>
            <ChevronDown size={15} />
          </div>

          <label>Price</label>
          <div className="input-box">
            <input
              type="number"
              step="0.05"
              disabled={orderType === "MARKET"}
              value={orderType === "MARKET" ? (quote?.price?.toFixed(2) || "") : price}
              onChange={e => setPrice(e.target.value)}
            />
            <span>INR</span>
          </div>

          <div className="order-summary">
            <div><span>Estimated value</span><strong>{quote ? money(quote.price * qty) : "—"}</strong></div>
            <div><span>Available margin</span><strong>₹2,50,000.00</strong></div>
          </div>

          <button className={`place-order ${side.toLowerCase()}`} onClick={submitOrder}>
            {side === "BUY" ? "Buy" : "Sell"} {selected}
          </button>

          {message && <div className="order-message">{message}</div>}

          <div className="demo-note">
            <strong>Demo mode</strong>
            <p>This order is stored only in the Node.js demo server. It does not reach NSE or any broker.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value == null ? "—" : money(value)}</strong>
    </div>
  );
}

export default App;
