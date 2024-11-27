/**
 *
 * @param numbers Принимает массив чисел
 * @returns Возвращается средняя медиальное значение
 */
export const calculateMedian = (numbers: number[]) => {
  // Сортируем массив по возрастанию
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  // Если количество элементов нечётное, возвращаем средний элемент
  if (sorted.length % 2 !== 0) {
    return sorted[middle];
  } else {
    // Если чётное, возвращаем среднее значение двух центральных элементов
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
};
