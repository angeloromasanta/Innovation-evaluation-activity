import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { gameConfig } from '../config';
import RNGAnimation from './RNGAnimation';
import { resetGame, initializeGame } from '../firebase-init';
import { calculateAverageProbability } from '../utils';

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

  useEffect(() => {
    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      const teamsData: TeamData[] = [];
      snapshot.forEach((doc) => {
        teamsData.push(doc.data() as TeamData);
      });
      setTeams(teamsData);
    });

    const unsubGameState = onSnapshot(
      doc(db, 'gameState', 'current'),
      (doc) => {
        if (doc.exists()) {
          setGameState(doc.data() as GameState);
        }
      }
    );

    return () => {
      unsubTeams();
      unsubGameState();
    };
  }, []);

  const startGame = async () => {
    await setDoc(doc(db, 'gameState', 'current'), {
      ...gameState,
      phase: 'phase1',
    });
  };

  const startInvestmentRound = async () => {
    await updateDoc(doc(db, 'gameState', 'current'), {
      phase: 'phase2',
      showConsultantsHired: true,
    });
  };

  const revealInvestmentDecisions = async () => {
    await updateDoc(doc(db, 'gameState', 'current'), {
      showInvestmentDecisions: true,
    });
  };

  const revealProbabilities = async () => {
    await updateDoc(doc(db, 'gameState', 'current'), {
      showProbabilities: true,
    });
  };

  const handleRollComplete = async (result: boolean) => {
    setIsRolling(false);
    const roundData = gameConfig.rounds[gameState.currentRound - 1];

    // Update team results
    const updates = teams.map(async (team) => {
      const consultantCosts =
        team.currentRound.consultantsHired * gameConfig.consultantCost;
      let totalRoundProfit = -consultantCosts; // Start with consultant costs as base loss

      if (team.currentRound.invested) {
        // If team invested, add investment result
        totalRoundProfit -= gameConfig.investmentAmount; // Subtract investment cost
        if (result) {
          totalRoundProfit += roundData.profit; // Add profit if successful
        }
      }

      // Log the calculation details
      console.log(
        `Team ${team.teamName} Round ${gameState.currentRound} Summary:`
      );
      console.log(`Previous Total: ${team.totalMoney}`);
      console.log(`Round Profit/Loss: ${totalRoundProfit}`);
      console.log(`New Total: ${team.totalMoney + totalRoundProfit}`);

      // Ensure we don't have any NaN or undefined values
      const newTotalMoney = team.totalMoney + totalRoundProfit;
      if (isNaN(newTotalMoney)) {
        console.error('Invalid calculation detected:', {
          previousTotal: team.totalMoney,
          roundProfit: totalRoundProfit,
          team: team.teamName,
        });
        return; // Skip update if invalid
      }

      await updateDoc(doc(db, 'teams', team.teamName), {
        totalMoney: newTotalMoney,
        'currentRound.roundProfit': totalRoundProfit,
        // Add round history to track all rounds
        [`roundHistory.${gameState.currentRound}`]: {
          consultantsHired: team.currentRound.consultantsHired,
          invested: team.currentRound.invested,
          roundProfit: totalRoundProfit,
          totalAfterRound: newTotalMoney,
        },
      });
    });

    await Promise.all(updates);

    await updateDoc(doc(db, 'gameState', 'current'), {
      phase: 'results',
      roundOutcome: result,
      showResults: true,
    });
  };

  const startNextRound = async () => {
    if (gameState.currentRound >= gameConfig.rounds.length) {
      // Game over
      return;
    }

    // Reset all teams' current round data
    const updates = teams.map(async (team) => {
      await updateDoc(doc(db, 'teams', team.teamName), {
        currentRound: {
          consultantsHired: 0,
          invested: false,
          roundProfit: 0,
        },
      });
    });

    await Promise.all(updates);

    // Start next round
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

  // Calculate teams that have submitted their decisions
  const teamsWithConsultants = teams.filter(
    (team) => team.currentRound.consultantsHired > 0
  ).length;
  const teamsWithInvestmentDecision = teams.filter(
    (team) => team.currentRound.invested !== null // Changed condition to check for non-null
  ).length;

  const currentRoundProfit =
    gameConfig.rounds[gameState.currentRound - 1]?.profit || 0;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Game Control Panel</h1>
          <div className="text-xl mt-2">
            Potential Profit This Round: ${currentRoundProfit}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={initializeGame}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Initialize Game
          </button>
          <button
            onClick={resetGame}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reset Game
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xl">Round {gameState.currentRound}</div>
        <div className="text-lg">Phase: {gameState.phase}</div>
      </div>

      {/* Game Control Buttons */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {gameState.phase === 'registration' && (
          <button
            onClick={startGame}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Start Game
          </button>
        )}

        {gameState.phase === 'phase1' && (
          <button
            onClick={startInvestmentRound}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go to Investment Round ({teamsWithConsultants}/{teams.length})
          </button>
        )}

        {gameState.phase === 'phase2' && (
          <>
            <button
              onClick={revealInvestmentDecisions}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={gameState.showInvestmentDecisions}
            >
              Reveal Investment Decisions ({teamsWithInvestmentDecision}/
              {teams.length})
            </button>
            <button
              onClick={revealProbabilities}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={
                !gameState.showInvestmentDecisions ||
                gameState.showProbabilities
              }
            >
              Reveal All Probabilities
            </button>
            <button
              onClick={() => setIsRolling(true)}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={!gameState.showProbabilities || isRolling}
            >
              Roll Outcome
            </button>
          </>
        )}

        {gameState.phase === 'results' && (
          <button
            onClick={startNextRound}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next Round
          </button>
        )}
      </div>

      {/* RNG Animation Modal */}
      {isRolling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <RNGAnimation
              onComplete={handleRollComplete}
              probability={calculateAverageProbability(
                gameConfig.rounds[gameState.currentRound - 1].consultants
              )}
            />
          </div>
        </div>
      )}

      {/* Teams Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Metric</th>
              {teams.map((team) => (
                <th key={team.teamName} className="border p-2">
                  {team.teamName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-bold">Total Money</td>
              {teams.map((team) => (
                <td key={`${team.teamName}-total`} className="border p-2">
                  ${team.totalMoney}
                </td>
              ))}
            </tr>

            {gameState.showConsultantsHired && (
              <tr>
                <td className="border p-2 font-bold">Consultants Hired</td>
                {teams.map((team) => (
                  <td
                    key={`${team.teamName}-consultants`}
                    className="border p-2"
                  >
                    {team.currentRound.consultantsHired}
                  </td>
                ))}
              </tr>
            )}

            {gameState.showInvestmentDecisions && (
              <>
                <tr>
                  <td className="border p-2 font-bold">Investment Decision</td>
                  {teams.map((team) => (
                    <td
                      key={`${team.teamName}-decision`}
                      className="border p-2"
                    >
                      {team.currentRound.invested ? 'Yes' : 'No'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border p-2 font-bold">Current Costs</td>
                  {teams.map((team) => {
                    const costs = -(
                      team.currentRound.consultantsHired *
                        gameConfig.consultantCost +
                      (team.currentRound.invested
                        ? gameConfig.investmentAmount
                        : 0)
                    );
                    return (
                      <td
                        key={`${team.teamName}-costs`}
                        className="border p-2 text-red-500"
                      >
                        ${costs}
                      </td>
                    );
                  })}
                </tr>
              </>
            )}

            {gameState.showResults && (
              <tr>
                <td className="border p-2 font-bold">Round Profit/Loss</td>
                {teams.map((team) => {
                  const profit = team.currentRound.roundProfit;
                  return (
                    <td
                      key={`${team.teamName}-profit`}
                      className={`border p-2 ${
                        profit >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      ${profit}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Consultant Probabilities Display */}
      {gameState.showProbabilities && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">
            All Consultant Probabilities
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {gameConfig.rounds[gameState.currentRound - 1].consultants.map(
              (prob, index) => (
                <div
                  key={index}
                  className="bg-gray-100 p-4 rounded text-center"
                >
                  <div className="font-bold">Consultant {index + 1}</div>
                  <div className="text-2xl">{prob}%</div>
                </div>
              )
            )}
          </div>
          {gameState.roundOutcome !== null && (
            <div
              className={`mt-4 text-2xl font-bold text-center ${
                gameState.roundOutcome ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {gameState.roundOutcome ? 'Success!' : 'Failed!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TallyView;
