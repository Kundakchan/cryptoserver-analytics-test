import { market } from "../market";
import { GetKline, GroupByTimeInterval, Ticker } from "./interface";

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
  return groupByTimeInterval({ data: _data[symbol], interval: interval });
};

const groupByTimeInterval: GroupByTimeInterval = ({ data, interval }) => {
  const dataList = data.reverse();
  let timeCurrentGroup = new Date(
    dataList[0].createdAt.getTime() - interval * 1000
  );
  const groups: Record<string, Ticker[]> = {
    [timeCurrentGroup.toLocaleTimeString("ru")]: [],
  };
  for (const ticker of dataList) {
    if (ticker.createdAt >= timeCurrentGroup) {
      groups[timeCurrentGroup.toLocaleTimeString("ru")].push(ticker);
    } else {
      timeCurrentGroup = new Date(ticker.createdAt.getTime() - interval * 1000);
      groups[timeCurrentGroup.toLocaleTimeString("ru")] = [ticker];
    }
  }
  return Object.values(groups)
    .map((group) => {
      const tickers = group.reverse();
      return {
        tickers,
        start: tickers[0].createdAt,
        end: tickers[tickers.length - 1].createdAt,
      };
    })
    .reverse();
};

export const ticker = { watch, getKline, groupByTimeInterval };
