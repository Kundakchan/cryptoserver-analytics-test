import { TickerLinearInverseV5 } from "bybit-api";

export interface Ticker extends Partial<TickerLinearInverseV5> {
  tickDirection?: "PlusTick" | "ZeroPlusTick" | "MinusTick" | "ZeroMinusTick";
  createdAt: Date;
}

export interface GetKlineResponse {}
export interface GetKline {
  (params: { symbol: string; interval: number }): GetKlineResponse[];
}

export interface GroupByTimeIntervalData {
  tickers: Ticker[];
  start: Date;
  end: Date;
}

export interface GroupByTimeInterval {
  (params: { data: Ticker[]; interval: number }): GroupByTimeIntervalData[];
}
