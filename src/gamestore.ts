import { create } from 'zustand';
import { GameState } from './types';

interface GameStore extends GameState {
  setPhase: (phase: GameState['phase']) => void;
  setCurrentRound: (round: number) => void;
  toggleConsultantsHired: () => void;
  toggleInvestmentDecisions: () => void;
  toggleProbabilities: () => void;
  toggleResults: () => void;
  setRoundOutcome: (outcome: boolean | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentRound: 1,
  phase: 'registration',
  showConsultantsHired: false,
  showInvestmentDecisions: false,
  showProbabilities: false,
  showResults: false,
  roundOutcome: null,
  setPhase: (phase: GameState['phase']) => set({ phase }),
  setCurrentRound: (round: number) => set({ currentRound: round }),
  toggleConsultantsHired: () =>
    set((state) => ({ showConsultantsHired: !state.showConsultantsHired })),
  toggleInvestmentDecisions: () =>
    set((state) => ({
      showInvestmentDecisions: !state.showInvestmentDecisions,
    })),
  toggleProbabilities: () =>
    set((state) => ({ showProbabilities: !state.showProbabilities })),
  toggleResults: () => set((state) => ({ showResults: !state.showResults })),
  setRoundOutcome: (outcome: boolean | null) => set({ roundOutcome: outcome }),
}));