// utils.ts
export const calculateRoundOutcome = (probability: number): boolean => {
  const randomNum = Math.random() * 100;
  return randomNum <= probability;
};

export const calculateAverageProbability = (
  probabilities: number[]
): number => {
  return (
    probabilities.reduce((acc, val) => acc + val, 0) / probabilities.length
  );
};
