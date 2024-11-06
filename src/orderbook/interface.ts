import { OrderbookResponseV5 } from "bybit-api";

export interface Orderbook extends OrderbookResponseV5 {
  createdAt: Date;
}
