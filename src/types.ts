// types.ts

export interface RoundData {
  drugName: string;
  drugDescription: string;
  consultants: number[]; // Probabilities of success from each consultant
  consultantComments: string[]; // Comments from each consultant
  profit: number; // Profit if investment is successful (i.e., drug passes phase)
  consultantCost: number; // Cost PER consultant hired for this drug
  investmentAmount: number; // Cost to invest in this drug's current development phase
}

export interface GameConfig {
  rounds: RoundData[];
  // Global consultantCost and investmentAmount are removed
}

export interface TeamData {
  teamName: string;
  totalMoney: number; // Represents company's total valuation/cash
  currentRound: {
    consultantsHired: number;
    invested: boolean | null; // null = no decision, true = invest, false = don't invest
    roundProfit: number; // Stores the net financial outcome of the round for the team
  };
  roundHistory?: {
    [roundNumber: number]: {
      drugName: string;
      consultantsHired: number;
      invested: boolean | null;
      initialExpenses: number; // Total expenses before outcome
      roundProfit: number;     // Net profit/loss for the round
      totalAfterRound: number;
    };
  };
}

export interface GameState {
  currentRound: number;
  phase: 'registration' | 'phase1' | 'phase2' | 'results' | 'gameOver'; // Added gameOver
  showConsultantsHired: boolean;
  showInvestmentDecisions: boolean;
  showProbabilities: boolean; // Or "showExpertInsightsSummary"
  showResults: boolean;
  roundOutcome: boolean | null; // True for success, false for failure of the drug phase
}