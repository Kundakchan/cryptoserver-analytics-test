import { TickerLinearInverseV5 } from "bybit-api";

export interface Ticker extends Partial<TickerLinearInverseV5> {
  tickDirection?: "PlusTick" | "ZeroPlusTick" | "MinusTick" | "ZeroMinusTick";
  createdAt: Date;
}

export interface GetKlineResponse extends ConvertingToCandlesResponse {
  start: Date;
  end: Date;
}
export interface GetKline {
  (params: {
    symbol: string;
    interval: number;
    type: ConvertingToCandlesParams["field"];
  }): GetKlineResponse[];
}

export interface GroupByTimeIntervalData {
  tickers: Ticker[];
  start: Date;
  end: Date;
}

export interface GroupByTimeInterval {
  (params: { data: Ticker[]; interval: number }): GroupByTimeIntervalData[];
}

export interface AggregateTickerPropertiesResponse
  extends Partial<Record<keyof Ticker, string[]>> {}
export interface AggregateTickerProperties {
  (tickers: Ticker[]): AggregateTickerPropertiesResponse;
}

export interface ConvertingToCandlesResponse {
  open?: number;
  close?: number;
  high?: number;
  low?: number;
  changes?: number;
}

export interface ConvertingToCandlesParams {
  tickers: AggregateTickerPropertiesResponse;
  field: Exclude<
    keyof AggregateTickerPropertiesResponse,
    "createdAt" | "tickDirection" | "symbol"
  >;
}

export interface ConvertingToCandles {
  (params: ConvertingToCandlesParams): ConvertingToCandlesResponse;
}
