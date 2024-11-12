// types.ts
export interface GameState {
  currentRound: number;
  phase: 'registration' | 'phase1' | 'phase2' | 'results';
  showConsultantsHired: boolean;
  showInvestmentDecisions: boolean;
  showProbabilities: boolean;
  showResults: boolean;
  roundOutcome: boolean | null;
}

export interface TeamData {
  teamName: string;
  totalMoney: number;
  currentRound: {
    consultantsHired: number;
    invested: boolean;
    roundProfit: number;
  };
}

export interface GameConfig {
  rounds: Array<{
    consultants: number[];
    profit: number;
  }>;
  consultantCost: number;
  investmentAmount: number;
}
