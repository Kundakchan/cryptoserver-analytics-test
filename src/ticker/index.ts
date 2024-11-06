import { market } from "../market";
import { Ticker } from "./interface";

const _data: Ticker[] = [];

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
    const result = JSON.parse(event.data).data;
    _data.push({ ...result, createdAt: new Date() });
  };
};
export const ticker = { watch };
