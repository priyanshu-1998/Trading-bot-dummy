import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const stocks = [
  { symbol: "RELIANCE", name: "Reliance Industries", exchange: "NSE", price: 2948.40, change: 38.25, changePct: 1.31 },
  { symbol: "TCS", name: "Tata Consultancy Services", exchange: "NSE", price: 4240.20, change: -24.10, changePct: -0.56 },
  { symbol: "HDFCBANK", name: "HDFC Bank", exchange: "NSE", price: 1688.65, change: 12.55, changePct: 0.75 },
  { symbol: "INFY", name: "Infosys", exchange: "NSE", price: 1524.80, change: 18.30, changePct: 1.21 },
  { symbol: "ICICIBANK", name: "ICICI Bank", exchange: "NSE", price: 1392.10, change: -8.45, changePct: -0.60 },
  { symbol: "SBIN", name: "State Bank of India", exchange: "NSE", price: 825.30, change: 7.80, changePct: 0.95 },
  { symbol: "ITC", name: "ITC Limited", exchange: "NSE", price: 461.75, change: 3.25, changePct: 0.71 },
  { symbol: "TATAMOTORS", name: "Tata Motors", exchange: "NSE", price: 982.50, change: -6.20, changePct: -0.63 }
];

let orders = [
  {
    id: crypto.randomUUID(),
    symbol: "RELIANCE",
    side: "BUY",
    qty: 5,
    orderType: "MARKET",
    price: 2948.40,
    status: "COMPLETE",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    symbol: "INFY",
    side: "SELL",
    qty: 2,
    orderType: "LIMIT",
    price: 1524.80,
    status: "OPEN",
    createdAt: new Date(Date.now() - 60000).toISOString()
  },
];

function makeChart(symbol) {
  const stock = stocks.find(s => s.symbol === symbol) || stocks[0];
  let price = stock.price * 0.985;

  return Array.from({ length: 40 }, (_, i) => {
    const drift = Math.sin(i / 3) * stock.price * 0.0025;
    const noise = ((i * 17) % 11 - 5) * stock.price * 0.0008;
    const open = price;
    const close = price + drift + noise;
    const high = Math.max(open, close) + stock.price * 0.0018;
    const low = Math.min(open, close) - stock.price * 0.0018;
    price = close;
    return {
      time: `${9 + Math.floor((i * 5) / 60)}:${String((15 + i * 5) % 60).padStart(2, "0")}`,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2))
    };
  });
}

app.get("/api/stocks", (req, res) => {
  res.json(stocks);
});

app.get("/api/quote/:symbol", (req, res) => {
  const stock = stocks.find(s => s.symbol === req.params.symbol.toUpperCase());
  if (!stock) return res.status(404).json({ message: "Stock not found" });
  res.json({ ...stock, chart: makeChart(stock.symbol) });
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { symbol, side, qty, orderType, price } = req.body;

  if (!symbol || !["BUY", "SELL"].includes(side)) {
    return res.status(400).json({ message: "Invalid order details" });
  }

  const quantity = Number(qty);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive integer" });
  }

  const stock = stocks.find(s => s.symbol === symbol);
  if (!stock) return res.status(400).json({ message: "Unknown symbol" });

  const order = {
    id: crypto.randomUUID(),
    symbol,
    side,
    qty: quantity,
    orderType: orderType === "LIMIT" ? "LIMIT" : "MARKET",
    price: Number(price) || stock.price,
    status: orderType === "LIMIT" ? "OPEN" : "COMPLETE",
    createdAt: new Date().toISOString()
  };

  orders.unshift(order);
  orders = orders.slice(0, 50);

  res.status(201).json(order);
});

app.listen(PORT, () => {
  console.log(`Dummy trading server running at http://localhost:${PORT}`);
});
