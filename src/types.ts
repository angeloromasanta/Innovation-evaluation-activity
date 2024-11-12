export interface GameConfig {
  rounds: {
    consultants: number[];
    profit: number;
  }[];
  consultantCost: number;
  investmentAmount: number;
}

export interface TeamData {
  teamName: string;
  totalMoney: number;
  currentRound: {
    consultantsHired: number;
    invested: boolean;
    roundProfit: number;
  };
  roundHistory?: {
    [key: number]: {
      consultantsHired: number;
      invested: boolean;
      roundProfit: number;
      totalAfterRound: number;
    };
  };
}

export interface GameState {
  currentRound: number;
  phase: 'registration' | 'phase1' | 'phase2' | 'results';
  showConsultantsHired: boolean;
  showInvestmentDecisions: boolean;
  showProbabilities: boolean;
  showResults: boolean;
  roundOutcome: boolean | null;
}
