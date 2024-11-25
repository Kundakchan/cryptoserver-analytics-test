import { market } from "../market";
import {
  AggregateTickerProperties,
  AggregateTickerPropertiesResponse,
  ConvertingToCandles,
  GetKline,
  GroupByTimeInterval,
  Ticker,
} from "./interface";

const _data: Partial<Record<string, Ticker[]>> = {};
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectInterval = 5000; // в миллисекундах

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
    reconnectAttempts = 0; // Сбрасываем счетчик попыток
  };

  ws.onclose = () => {
    console.error("Соединение ws tickers закрыто!");
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(
        `Попытка переподключения (${reconnectAttempts}/${maxReconnectAttempts})...`
      );
      setTimeout(() => {
        watch(); // Повторяем подключение
      }, reconnectInterval);
    } else {
      console.error("Превышено количество попыток переподключения.");
    }
  };

  ws.onerror = (error: any) => {
    console.error(`Ошибка соединения ws tickers: ${error.message}`);
    ws.close(); // Закрываем соединение для безопасного повторного подключения
  };

  ws.onmessage = (event: any) => {
    try {
      const result = JSON.parse(event.data).data as Ticker;
      if (!result?.symbol) return;

      if (!_data[result.symbol]) {
        _data[result.symbol] = [{ ...result, createdAt: new Date() }];
      } else {
        _data[result.symbol]?.push({ ...result, createdAt: new Date() });
      }
    } catch (error) {
      console.error("Ошибка обработки сообщения:", error);
    }
  };
};

const getKline: GetKline = ({ symbol, interval, type }) => {
  if (!_data[symbol]) return [];
  const groupBy = groupByTimeInterval({
    data: _data[symbol],
    interval: interval,
  });

  return groupBy.map((item) => ({
    start: item.start,
    end: item.end,
    ...convertingToCandles({
      tickers: aggregateTickerProperties(item.tickers),
      field: type,
    }),
  }));
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

const convertingToCandles: ConvertingToCandles = ({ tickers, field }) => {
  if (!tickers[field]) {
    console.error(`Свойство "${field}" не найдено в объекте.`);
    return {};
  }

  if (["createdAt", "tickDirection", "symbol"].includes(field)) {
    throw new Error(`Свойство "${field}" не допускается.`);
  }

  const values = tickers[field];

  // Проверяем, что массив содержит только строки или числа
  if (
    !Array.isArray(values) ||
    values.some((val) => typeof val !== "string" && typeof val !== "number")
  ) {
    throw new Error(
      `Свойство "${field}" должно содержать массив строк или чисел.`
    );
  }

  // Преобразуем строки в числа, если возможно
  const numericValues = values.map((val) =>
    typeof val === "string" ? parseFloat(val) : val
  );

  return {
    open: numericValues[0],
    close: numericValues[numericValues.length - 1],
    high: Math.max(...numericValues),
    low: Math.min(...numericValues),
    changes: numericValues.length,
  };
};

const aggregateTickerProperties: AggregateTickerProperties = (tickers) => {
  const result: AggregateTickerPropertiesResponse = {};

  tickers.forEach((ticker) => {
    Object.entries(ticker).forEach(([key, value]) => {
      if (!result[key]) {
        result[key] = [];
      }
      if (!result[key].includes(value)) {
        result[key].push(value);
      }
    });
  });

  return result;
};

export const ticker = { watch, getKline, groupByTimeInterval };
