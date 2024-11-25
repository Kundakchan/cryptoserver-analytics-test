import { market } from "../market";
import { Orderbook } from "./interface";

const _data: Orderbook[] = [];

const _getWSParams = () => {
  try {
    const args = market
      .getAllSymbol()
      .slice(0, 120)
      .map((symbol) => `orderbook.1.${symbol}`);
    const subscribe = {
      op: "subscribe",
      args: ["orderbook.500.TROYUSDT"],
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
    console.warn("Соединение ws orderbook открыто!");
    ws.send(_getWSParams());
  };

  ws.onclose = (event) => {
    throw new Error(`Соединение ws orderbook закрыто: ${event.code}`);
  };

  ws.onerror = (error: any) => {
    throw new Error(`Ошибка Соединение ws orderbook ${error}`);
  };

  ws.onmessage = (event: any) => {
    const result = JSON.parse(event.data).data as Orderbook;
    console.log({
      b: result?.b,
      a: result?.a,
    });
    _data.push({ ...result, createdAt: new Date() });
  };
};
export const orderbook = { watch };
