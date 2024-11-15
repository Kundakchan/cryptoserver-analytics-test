import { market } from "../market";
import { GetKline, Ticker } from "./interface";

const _data: Partial<Record<string, Ticker[]>> = {};

const _getWSParams = () => {
  try {
    const args = market.getAllSymbol().map((symbol) => `tickers.${symbol}`);
    const subscribe = {
      op: "subscribe",
      args: args,
    };
    return JSON.stringify(subscribe);
  } catch (error) {
    throw new Error("НЕ УДАЛОСЬ ПОЛУЧИТЬ ПАРАМЕТРЫ СОЕДИНЕНИЯ");
  }
};

const watch = () => {
  if (!process.env.API_PUBLIC_WEBSOCKET) {
    throw new Error(
      `Некорректный адрес веб-сокета: ${process.env.API_PUBLIC_WEBSOCKET}`
    );
  }
  const ws = new WebSocket(process.env.API_PUBLIC_WEBSOCKET);

  ws.onopen = () => {
    console.warn("Соединение ws tickers открыто!");
    ws.send(_getWSParams());
  };

  ws.onclose = () => {
    throw new Error(`Соединение ws tickers закрыто!`);
  };

  ws.onerror = (error: any) => {
    throw new Error(`Ошибка Соединение ws tickers ${error}`);
  };

  ws.onmessage = (event: any) => {
    const result = JSON.parse(event.data).data as Ticker;
    if (!result?.symbol) return;

    if (!_data[result.symbol]) {
      _data[result.symbol] = [{ ...result, createdAt: new Date() }];
    } else {
      _data[result.symbol]?.push({ ...result, createdAt: new Date() });
    }
  };
};

const getKline: GetKline = ({ symbol, interval }) => {
  if (!_data[symbol]) return [];
  return groupByTimeInterval({ data: _data[symbol], intervale: interval });
};

type GroupedData = {
  items: Ticker[];
  oldestTime: string; // Самое старое время в группе
  newestTime: string; // Самое новое время в группе
};

export interface GroupByTimeInterval {
  (params: { data: Ticker[]; intervale: number }): GroupedData[];
}

export const ticker = { watch, getKline };
