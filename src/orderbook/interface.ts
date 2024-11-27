import { OrderbookResponseV5 } from "bybit-api";

export interface Orderbook extends OrderbookResponseV5 {
  createdAt: Date;
}

export type AnalyzeDataDirection = "down" | "up" | "neutral";
export interface AnalyzeData extends AnalyzeOrderBookResponse {
  createdAt: Date;
  symbol: string;
}

export interface AnalyzeOrderBookParams {
  a: OrderbookResponseV5["a"];
  b: OrderbookResponseV5["b"];
}
export interface AnalyzeOrderBookResponse {
  direction: AnalyzeDataDirection;
  priceChange: number;
  details: {
    closestBidChange: number;
    closestAskChange: number;
    totalBidVolume: number;
    totalAskVolume: number;
    volumeDisbalance: number;
  };
}
export interface AnalyzeOrderBook {
  (params: AnalyzeOrderBookParams): AnalyzeOrderBookResponse;
}
