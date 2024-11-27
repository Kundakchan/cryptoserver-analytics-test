import { SETTINGS } from "..";
import { market } from "../market";
import {
  AnalyzeData,
  AnalyzeDataDirection,
  AnalyzeOrderBook,
  Orderbook,
} from "./interface";

const _data: Orderbook[] = [];
let _analyzeData: AnalyzeData[] = [];

const _getWSParams = () => {
  try {
    const args = market
      .getAllSymbol()
      .slice(0, 120)
      .map((symbol) => `orderbook.1.${symbol}`);
    const subscribe = {
      op: "subscribe",
      args: [`orderbook.500.${SETTINGS.symbol}`],
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
    if (result?.b.length && result?.a.length && result?.s) {
      const analysis = analyzeOrderBook({ b: result.b, a: result.a });

      analyzeDataAdd({
        ...analysis,
        symbol: result.s,
        createdAt: new Date(),
      });
    }
  };
};

const analyzeDataAdd = (data: AnalyzeData) => {
  _analyzeData.push(data);
  _analyzeData = _analyzeData.filter(
    (item) => item.createdAt > new Date(new Date().getTime() - 5000)
  );
};

export interface GetAnalyzeDataBySymbol {
  (symbol: string): AnalyzeData[];
}
const getAnalyzeDataBySymbol: GetAnalyzeDataBySymbol = (symbol) =>
  _analyzeData.filter((item) => item.symbol === symbol);

// Вариант 1
// function analyzeOrderBook(bids, asks) {
//   // 1. Кумулятивные объемы бидов и асков
//   function calculateCumulativeVolumes(bids, asks) {
//     const totalBids = bids.reduce(
//       (sum, [_, volume]) => sum + parseFloat(volume),
//       0
//     );
//     const totalAsks = asks.reduce(
//       (sum, [_, volume]) => sum + parseFloat(volume),
//       0
//     );
//     return { totalBids, totalAsks };
//   }

//   // 2. Анализ первых уровней
//   function analyzeTopLevels(bids, asks, levels = 5) {
//     const topBids = bids.slice(0, levels);
//     const topAsks = asks.slice(0, levels);
//     const topBidsVolume = topBids.reduce(
//       (sum, [_, volume]) => sum + parseFloat(volume),
//       0
//     );
//     const topAsksVolume = topAsks.reduce(
//       (sum, [_, volume]) => sum + parseFloat(volume),
//       0
//     );
//     return { topBidsVolume, topAsksVolume };
//   }

//   // 3. Дисбаланс ликвидности
//   function findLiquidityImbalance(bids, asks) {
//     const maxBid = Math.max(...bids.map(([_, volume]) => parseFloat(volume)));
//     const maxAsk = Math.max(...asks.map(([_, volume]) => parseFloat(volume)));
//     return { maxBid, maxAsk };
//   }

//   // 4. Анализ "стен" ликвидности
//   function detectWalls(bids, asks, threshold = 1.5) {
//     const bidWalls = bids.filter(
//       ([_, volume]) => parseFloat(volume) >= threshold
//     );
//     const askWalls = asks.filter(
//       ([_, volume]) => parseFloat(volume) >= threshold
//     );
//     return { bidWalls, askWalls };
//   }

//   // Расчеты
//   const { totalBids, totalAsks } = calculateCumulativeVolumes(bids, asks);
//   const { topBidsVolume, topAsksVolume } = analyzeTopLevels(bids, asks);
//   const { maxBid, maxAsk } = findLiquidityImbalance(bids, asks);
//   const { bidWalls, askWalls } = detectWalls(bids, asks);

//   // Прогнозируем направление движения цены
//   let predictedDirection = "neutral"; // по умолчанию нейтральное
//   let priceChange = 0; // изменение цены
//   const midPrice = (parseFloat(bids[0][0]) + parseFloat(asks[0][0])) / 2;

//   if (totalBids > totalAsks) {
//     predictedDirection = "up";
//     priceChange = Math.abs(((maxBid - midPrice) / midPrice) * 100);
//   } else if (totalBids < totalAsks) {
//     predictedDirection = "down";
//     priceChange = Math.abs(((midPrice - maxAsk) / midPrice) * 100);
//   } else {
//     // Анализируем топовые уровни
//     if (topBidsVolume > topAsksVolume) {
//       predictedDirection = "up";
//       priceChange = Math.abs(
//         ((midPrice - parseFloat(bids[0][0])) / midPrice) * 100
//       );
//     } else if (topAsksVolume > topBidsVolume) {
//       predictedDirection = "down";
//       priceChange = Math.abs(
//         ((parseFloat(asks[0][0]) - midPrice) / midPrice) * 100
//       );
//     }
//   }

//   return {
//     predictedDirection,
//     priceChange,
//   };
// }

// Вариант 2
// function analyzeOrderBook(orderBook) {
//   const { b: bids, a: asks } = orderBook;

//   // Вспомогательные функции
//   const calculateMidPrice = () =>
//     (parseFloat(bids[0][0]) + parseFloat(asks[0][0])) / 2;
//   const sumVolumes = (levels) =>
//     levels.reduce((sum, [_, volume]) => sum + parseFloat(volume), 0);
//   const calculateWeightedPrice = (levels) =>
//     levels.reduce(
//       (sum, [price, volume]) => sum + parseFloat(price) * parseFloat(volume),
//       0
//     ) / sumVolumes(levels);
//   const calculateAverageDensity = (levels) =>
//     sumVolumes(levels) / levels.length;

//   // Алгоритм 1: Дисбаланс объемов
//   const bidVolume = sumVolumes(bids);
//   const askVolume = sumVolumes(asks);
//   const volumeDisbalance = (bidVolume - askVolume) / (bidVolume + askVolume);

//   // Алгоритм 2: Глубинный дисбаланс
//   const depthLevels = 10;
//   const bidDepthVolume = sumVolumes(bids.slice(0, depthLevels));
//   const askDepthVolume = sumVolumes(asks.slice(0, depthLevels));
//   const depthDisbalance =
//     (bidDepthVolume - askDepthVolume) / (bidDepthVolume + askDepthVolume);

//   // Алгоритм 3: Анализ текущего баланса
//   const nearestBidVolume = sumVolumes(bids.slice(0, 5));
//   const nearestAskVolume = sumVolumes(asks.slice(0, 5));
//   const currentBalance = nearestBidVolume - nearestAskVolume;

//   // Алгоритм 4: Плотность ликвидности
//   const bidDensity = calculateAverageDensity(bids);
//   const askDensity = calculateAverageDensity(asks);
//   const densityDisbalance = bidDensity - askDensity;

//   // Алгоритм 5: Взвешенная средняя цена
//   const weightedBidPrice = calculateWeightedPrice(bids);
//   const weightedAskPrice = calculateWeightedPrice(asks);
//   const weightedMidPrice = (weightedBidPrice + weightedAskPrice) / 2;

//   // Алгоритм 6: Анализ спреда
//   const bestBid = parseFloat(bids[0][0]);
//   const bestAsk = parseFloat(asks[0][0]);
//   const spread = bestAsk - bestBid;

//   // Прогнозирование
//   const midPrice = calculateMidPrice();
//   let direction = "neutral";
//   let priceChange = 0;

//   // Логика определения направления и изменения цены
//   if (volumeDisbalance > 0.1 || depthDisbalance > 0.1) {
//     direction = "up";
//     priceChange = Math.max(weightedMidPrice - midPrice, spread / 2);
//   } else if (volumeDisbalance < -0.1 || depthDisbalance < -0.1) {
//     direction = "down";
//     priceChange = Math.max(midPrice - weightedMidPrice, spread / 2);
//   } else if (currentBalance > 0) {
//     direction = "up";
//     priceChange = spread / 2;
//   } else if (currentBalance < 0) {
//     direction = "down";
//     priceChange = spread / 2;
//   }

//   // Возврат результата
//   return {
//     direction,
//     priceChange,
//     // details: {
//     //   volumeDisbalance,
//     //   depthDisbalance,
//     //   currentBalance,
//     //   densityDisbalance,
//     //   weightedMidPrice,
//     //   spread,
//     // },
//   };
// }

// Вариант 3
const analyzeOrderBook: AnalyzeOrderBook = (orderBook) => {
  const { b: bids, a: asks } = orderBook;

  // Вспомогательные функции
  const sumVolumes = (levels) =>
    levels.reduce((sum, [_, volume]) => sum + parseFloat(volume), 0);
  const calculateVolumeChanges = (levels) =>
    levels.map(([price, volume], index, array) =>
      index === 0 ? 0 : parseFloat(volume) - parseFloat(array[index - 1][1])
    );

  // Шаг 1: Анализ объемов и изменений на ближайших уровнях
  const bidChanges = calculateVolumeChanges(bids);
  const askChanges = calculateVolumeChanges(asks);

  // Выбираем уровни ближе всего к текущей цене
  const closestBidChange = bidChanges[0]; // Изменение объема на лучшем бид уровне
  const closestAskChange = askChanges[0]; // Изменение объема на лучшем аск уровне

  // Шаг 2: Общий анализ объемов
  const totalBidVolume = sumVolumes(bids);
  const totalAskVolume = sumVolumes(asks);
  const volumeDisbalance =
    (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume);

  // Шаг 3: Расчет направления
  let direction: AnalyzeDataDirection = "neutral";
  let priceChange: number = 0;

  if (closestBidChange > 0 && closestAskChange <= 0) {
    direction = "up";
    priceChange = Math.abs(closestBidChange) * 0.1; // Пропорциональное изменение
  } else if (closestAskChange > 0 && closestBidChange <= 0) {
    direction = "down";
    priceChange = Math.abs(closestAskChange) * 0.1; // Пропорциональное изменение
  } else if (volumeDisbalance > 0.1) {
    direction = "up";
    priceChange = volumeDisbalance * 10; // Пропорционально дисбалансу
  } else if (volumeDisbalance < -0.1) {
    direction = "down";
    priceChange = Math.abs(volumeDisbalance) * 10;
  }

  // Возврат результата
  return {
    direction,
    priceChange,
    details: {
      closestBidChange,
      closestAskChange,
      totalBidVolume,
      totalAskVolume,
      volumeDisbalance,
    },
  };
};
export const orderbook = { watch, getAnalyzeDataBySymbol };
