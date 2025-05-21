// components/TallyView.tsx
import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs, // For resetGame to fetch all teams
  writeBatch // For resetGame batch delete/update
} from 'firebase/firestore';
import { db } from '../firebase';
import { gameConfig } from '../config';
// import RNGAnimation from './RNGAnimation'; // Assuming this is used or can be adapted
import { initializeGame as fbInitializeGame, resetGame as fbResetGame } from '../firebase-init'; // Assuming these are defined
import { calculateAverageProbability } from '../utils'; // Ensure this exists and works
import { TeamData, GameState, RoundData } from '../types';
import ProbabilityLine from './ProbabilityLine'; // Ensure this component can handle new data if needed

const TallyView = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    phase: 'registration',
    showConsultantsHired: false,
    showInvestmentDecisions: false,
    showProbabilities: false,
    showResults: false,
    roundOutcome: null,
  });
  const [isRolling, setIsRolling] = useState(false);
  const [rollPercentage, setRollPercentage] = useState<number | null>(null);
  const [currentDrugData, setCurrentDrugData] = useState<RoundData | null>(null);

  // Initialize Game function (if not using firebase-init.ts one directly)
  const initializeGame = async () => {
    await fbInitializeGame(); // Call the function from firebase-init
     // Optionally, set initial money for all registered teams if desired at this point
  };

  // Reset Game function
  const resetGame = async () => {
    if (window.confirm("Are you sure you want to reset the entire game? This will clear all team data and scores.")) {
        await fbResetGame(); // Call the function from firebase-init
        setTeams([]); // Clear local state
        // GameState will be reset by onSnapshot from fbResetGame
    }
  };


  useEffect(() => {
    const unsubGameState = onSnapshot(doc(db, 'gameState', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        const newGameState = docSnap.data() as GameState;
        setGameState(newGameState);
        if (newGameState.currentRound > 0 && newGameState.currentRound <= gameConfig.rounds.length) {
          setCurrentDrugData(gameConfig.rounds[newGameState.currentRound - 1]);
        } else {
          setCurrentDrugData(null); // Handles end of game or invalid round
        }
      } else {
        // If gameState doesn't exist, maybe initialize it? Or show an error.
        console.log("No game state found. Consider initializing the game.");
      }
    });

    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      const teamsData: TeamData[] = snapshot.docs.map(doc => doc.data() as TeamData);
      setTeams(teamsData.sort((a, b) => (b.totalMoney || 0) - (a.totalMoney || 0))); // Sort by money
    });

    return () => {
      unsubTeams();
      unsubGameState();
    };
  }, []);

  // Effect for handling the dice roll animation and outcome
  useEffect(() => {
    if (isRolling && currentDrugData) {
      const timeout = setTimeout(() => {
        const finalPercentage = Math.floor(Math.random() * 100) + 1; // 1 to 100
        setRollPercentage(finalPercentage);
        
        const averageProb = calculateAverageProbability(currentDrugData.consultants);
        const result = finalPercentage <= averageProb; // Success if roll is <= average probability
        
        setIsRolling(false); // Stop animation
        handleRollComplete(result); // Process results
      }, 2000); // Animation duration
  
      return () => clearTimeout(timeout);
    }
  }, [isRolling, currentDrugData, gameState.currentRound]); // gameState.currentRound ensures correct drug data for prob calc

  const startGame = async () => {
    if (teams.length === 0) {
        alert("No teams have registered yet. Please wait for teams to register.");
        return;
    }
    await updateDoc(doc(db, 'gameState', 'current'), {
      phase: 'phase1',
      currentRound: 1, // Ensure starting at round 1
      // Reset other fields if necessary from a previous game over state
      showConsultantsHired: false,
      showInvestmentDecisions: false,
      showProbabilities: false,
      showResults: false,
      roundOutcome: null,
    });
  };

  const startInvestmentRound = async () => {
    await updateDoc(doc(db, 'gameState', 'current'), {
      phase: 'phase2',
      showConsultantsHired: true, // Now show what they hired
    });
  };

  const revealInvestmentDecisions = async () => {
    await updateDoc(doc(db, 'gameState', 'current'), {
      showInvestmentDecisions: true,
    });
  };

  const revealProbabilities = async () => { // Or "revealExpertInsightsSummary"
    await updateDoc(doc(db, 'gameState', 'current'), {
      showProbabilities: true,
    });
  };

  const handleRollComplete = async (result: boolean) => {
    if (!currentDrugData) return;

    const batch = writeBatch(db);

    teams.forEach((team) => {
      // team.currentRound.roundProfit currently holds -(consultantCost + optionalInvestmentCost)
      let finalRoundProfitForTeam = team.currentRound.roundProfit; // This is the total expenses (negative value)

      if (team.currentRound.invested && result) { // If they invested AND the trial was a success
        finalRoundProfitForTeam += currentDrugData.profit; // Add the drug's profit potential
      }
      // If they invested and it failed, finalRoundProfitForTeam remains just the expenses.
      // If they didn't invest, finalRoundProfitForTeam remains consultant costs (or 0 if no consultants).

      const newTotalMoney = (team.totalMoney || 0) + finalRoundProfitForTeam;

      const teamRef = doc(db, 'teams', team.teamName);
      batch.update(teamRef, {
        totalMoney: newTotalMoney,
        'currentRound.roundProfit': finalRoundProfitForTeam, // This is now the NET profit/loss for the round
        [`roundHistory.${gameState.currentRound}`]: { // Store detailed history
          drugName: currentDrugData.drugName,
          consultantsHired: team.currentRound.consultantsHired,
          invested: team.currentRound.invested,
          initialExpenses: team.currentRound.roundProfit, // Expenses before outcome
          roundProfit: finalRoundProfitForTeam,          // Net outcome
          totalAfterRound: newTotalMoney,
        },
      });
    });

    await batch.commit();

    await updateDoc(doc(db, 'gameState', 'current'), {
      phase: 'results',
      roundOutcome: result,
      showResults: true,
    });
  };

  const startNextRound = async () => {
    if (!currentDrugData) return; // Should have current drug data

    if (gameState.currentRound >= gameConfig.rounds.length) {
      // Game over
      await updateDoc(doc(db, 'gameState', 'current'), { phase: 'gameOver' });
      alert("All drug candidates evaluated. Game Over!");
      return;
    }
  
    setRollPercentage(null); // Reset visual roll percentage

    const batch = writeBatch(db);
    teams.forEach(team => {
        const teamRef = doc(db, 'teams', team.teamName);
        batch.update(teamRef, {
            currentRound: { // Reset for the new round
              consultantsHired: 0,
              invested: null, // CRITICAL: reset to null
              roundProfit: 0,
            }
        });
    });
    await batch.commit();

    await updateDoc(doc(db, 'gameState', 'current'), {
      currentRound: gameState.currentRound + 1,
      phase: 'phase1',
      showConsultantsHired: false,
      showInvestmentDecisions: false,
      showProbabilities: false,
      showResults: false,
      roundOutcome: null,
    });
  };
  
  const teamsWithConsultants = teams.filter(
    (team) => team.currentRound && team.currentRound.consultantsHired >= 0 // student can hire 0
  ).length;
  const teamsWithInvestmentDecision = teams.filter(
    (team) => team.currentRound && team.currentRound.invested !== null 
  ).length;

  // Display variables
  const drugDisplayInfo = currentDrugData ? 
    `Drug: ${currentDrugData.drugName} (Potential Profit: $${currentDrugData.profit.toLocaleString()}, Investment: $${currentDrugData.investmentAmount.toLocaleString()})` 
    : "N/A";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pharma Development - Game Control</h1>
            {currentDrugData && (
                <>
                    <p className="text-xl mt-2 text-blue-600">Current Candidate: <span className="font-semibold">{currentDrugData.drugName}</span></p>
                    <p className="text-sm text-gray-600">{currentDrugData.drugDescription}</p>
                    <p className="text-md mt-1">Potential Valuation Uplift (on success): <span className="font-semibold">${currentDrugData.profit.toLocaleString()}</span></p>
                    <p className="text-md">Phase Investment Cost: <span className="font-semibold">${currentDrugData.investmentAmount.toLocaleString()}</span></p>
                    <p className="text-md">Cost per Expert Opinion: <span className="font-semibold">${currentDrugData.consultantCost.toLocaleString()}</span></p>
                </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={initializeGame}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Initialize Game State
            </button>
            <button
              onClick={resetGame}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Reset Full Game
            </button>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xl font-medium">Round {gameState.currentRound} / {gameConfig.rounds.length}</div>
          <div className="text-lg capitalize">Phase: <span className="font-semibold text-indigo-600">{gameState.phase.replace('phase', 'Phase ')}</span></div>
        </div>
      </div>

      {/* Game Control Buttons */}
      <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-wrap gap-3">
        {gameState.phase === 'registration' && (
          <button onClick={startGame} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded transition">
            Start Game (Begin Phase 1)
          </button>
        )}

        {gameState.phase === 'phase1' && (
          <button onClick={startInvestmentRound} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded transition">
            Advance to Investment Decisions ({teamsWithConsultants}/{teams.length} teams submitted opinions)
          </button>
        )}

        {gameState.phase === 'phase2' && currentDrugData && (
          <>
            <button onClick={revealInvestmentDecisions} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded transition disabled:opacity-50" disabled={gameState.showInvestmentDecisions}>
              Reveal Investment Choices ({teamsWithInvestmentDecision}/{teams.length} teams decided)
            </button>
            <button onClick={revealProbabilities} className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded transition disabled:opacity-50" disabled={!gameState.showInvestmentDecisions || gameState.showProbabilities}>
              Reveal Overall Expert Summary
            </button>
            <button onClick={() => setIsRolling(true)} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded transition disabled:opacity-50" disabled={!gameState.showProbabilities || isRolling || !currentDrugData}>
              Determine Trial Outcome
            </button>
          </>
        )}

        {gameState.phase === 'results' && (
          <button onClick={startNextRound} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded transition">
            {gameState.currentRound >= gameConfig.rounds.length ? 'Conclude Game' : `Proceed to Next Drug Candidate (Round ${gameState.currentRound + 1})`}
          </button>
        )}
         {gameState.phase === 'gameOver' && (
            <p className="text-xl font-semibold text-center text-blue-700 p-4">Game Over! Please reset to play again.</p>
        )}
      </div>

      {/* Teams Table */}
      {teams.length > 0 && gameState.phase !== 'registration' && (
        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Company Standings</h2>
          <table className="w-full border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3 text-left">Metric</th>
                {teams.map((team) => {
                  const hasMadeDecisionThisPhase = 
                    (gameState.phase === 'phase1' && team.currentRound?.consultantsHired >= 0) || // Can hire 0
                    (gameState.phase === 'phase2' && team.currentRound?.invested !== null);
                  
                  return (
                    <th key={team.teamName} className={`border p-3 ${(gameState.phase === 'phase1' || gameState.phase === 'phase2') ? (hasMadeDecisionThisPhase ? 'bg-green-100' : 'bg-red-100') : ''}`}>
                      {team.teamName}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border p-3 font-bold">Portfolio Value</td>
                {teams.map((team) => (
                  <td key={`${team.teamName}-total`} className="border p-3 text-center">
                    ${(team.totalMoney || 0).toLocaleString()}
                  </td>
                ))}
              </tr>

              {gameState.showConsultantsHired && currentDrugData && (
                <tr className="hover:bg-gray-50">
                  <td className="border p-3 font-bold">Experts Consulted</td>
                  {teams.map((team) => (
                    <td key={`${team.teamName}-consultants`} className="border p-3 text-center">
                      {team.currentRound?.consultantsHired ?? 'N/A'}
                    </td>
                  ))}
                </tr>
              )}

              {gameState.showInvestmentDecisions && currentDrugData && (
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="border p-3 font-bold">Investment Decision</td>
                    {teams.map((team) => (
                      <td key={`${team.teamName}-decision`} className="border p-3 text-center">
                        {team.currentRound?.invested === null ? 'Pending' : (team.currentRound?.invested ? <span className="text-green-600 font-semibold">INVEST</span> : <span className="text-red-600 font-semibold">NO INVEST</span>)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border p-3 font-bold">Round Expenditures (Pre-Outcome)</td>
                    {teams.map((team) => {
                      // Display the initial expenditure before outcome is applied
                      // This is - (consultant costs + investment if made)
                      const initialExpenses = team.roundHistory?.[gameState.currentRound]?.initialExpenses ?? team.currentRound?.roundProfit ?? 0;
                      return (
                        <td key={`${team.teamName}-costs`} className={`border p-3 text-center font-semibold ${initialExpenses < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                          ${initialExpenses.toLocaleString()} 
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}

              {gameState.showResults && currentDrugData && (
                <tr className="hover:bg-gray-50">
                  <td className="border p-3 font-bold">Net Round Result</td>
                  {teams.map((team) => {
                    const profit = team.currentRound?.roundProfit ?? 0; // This is final net profit/loss
                    return (
                      <td key={`${team.teamName}-profit`} className={`border p-3 text-center font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Consultant Probabilities / Expert Summary Display */}
      {gameState.showProbabilities && currentDrugData && (
        <div className="mt-6 p-4 bg-white shadow rounded-lg">
          <h2 className="text-2xl font-semibold mb-3 text-gray-700">Overall Expert Summary for {currentDrugData.drugName}</h2>
          <p className="mb-2 text-sm text-gray-600">This shows the full spectrum of expert opinions available for this drug candidate. Individual teams may have acquired a subset of these.</p>
          <div className="mb-6">
            <ProbabilityLine 
              probabilities={currentDrugData.consultants}
              averageProbability={calculateAverageProbability(currentDrugData.consultants)}
              rollResult={isRolling ? null : (gameState.roundOutcome !== null ? rollPercentage : null)}
              isAnimating={isRolling}
            />
          </div>
          {gameState.roundOutcome !== null && (
            <div className={`mt-4 text-3xl font-bold text-center ${gameState.roundOutcome ? 'text-green-600' : 'text-red-600'}`}>
              {currentDrugData.drugName} Clinical Trial {gameState.roundOutcome ? 'SUCCESS!' : 'FAILURE!'}
              {rollPercentage !== null && ` (Outcome Roll: ${rollPercentage}%)`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TallyView;