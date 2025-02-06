import { GameConfig } from './types';

export const gameConfig: GameConfig = {
  rounds: [
    {
      // Round 1: First consultants are pessimistic, later ones reveal it's good
      // Strategy: Hiring more consultants is better
      consultants: [40, 50, 85, 90, 95],
      profit: 1000,
    },
    {
      // Round 2: Early consultants very optimistic, later ones reveal high risk
      // Strategy: Fewer consultants might lead to overconfident investment
      consultants: [95, 90, 45, 10, 20],
      profit: 1000,
    },
    {
      // Round 3: Highly varied, middle consultant most accurate
      // Strategy: Medium number of consultants optimal
      consultants: [20, 95, 60, 60, 60],
      profit: 1300,
    },
    {
      // Round 4: Gets worse with more info, but high reward
      // Strategy: Less information might be better
      consultants: [10, 30, 95, 95, 95],
      profit: 1500,
    },
    {
      // Round 5: First consultant accurate, others misleading
      // Strategy: One consultant could be optimal
      consultants: [95, 15, 10, 10, 10],
      profit: 1800,
    },
  ],
  consultantCost: 100,
  investmentAmount: 300,
};