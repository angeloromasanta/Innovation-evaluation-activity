import { GameConfig } from './types';

export const gameConfig: GameConfig = {
  rounds: [
    {

      consultants: [30, 40, 35, 45, 10],
      profit: 1000,
    },
    {

      consultants: [60, 55, 60, 70, 60],
      profit: 1000,
    },
    {

      consultants: [20, 95, 5, 5, 5],
      profit: 1300,
    },
    {

      consultants: [10, 30, 95, 95, 95],
      profit: 1500,
    },
    {

      consultants: [95, 15, 10, 10, 5],
      profit: 1800,
    },
  ],
  consultantCost: 100,
  investmentAmount: 300,
};