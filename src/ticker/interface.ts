import { TickerLinearInverseV5 } from "bybit-api";

export interface Ticker extends Partial<TickerLinearInverseV5> {
  tickDirection?: "PlusTick" | "ZeroPlusTick" | "MinusTick" | "ZeroMinusTick";
  createdAt: Date;
}
