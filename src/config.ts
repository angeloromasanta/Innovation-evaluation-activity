import { GameConfig } from './types';

export const gameConfig: GameConfig = {
  rounds: [
    {
      consultants: [70, 80, 70, 60, 70],
      profit: 500,
    },
    {
      consultants: [40, 60, 40, 90, 60],
      profit: 300,
    },
    {
      consultants: [80, 20, 20, 30, 0],
      profit: 400,
    },
    {
      consultants: [30, 40, 80, 80, 90],
      profit: 200,
    },
    {
      consultants: [60, 60, 20, 20, 10],
      profit: 100,
    },
  ],
  consultantCost: 100,
  investmentAmount: 300,
};