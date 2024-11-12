// components/StudentView.tsx
import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { gameConfig } from '../config';
import { TeamData, GameState } from '../types';

const StudentView = () => {
  const [teamName, setTeamName] = useState('');
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [consultantsHired, setConsultantsHired] = useState(0);
  const [hasHiredConsultants, setHasHiredConsultants] = useState(false);
  const [hasInvested, setHasInvested] = useState(false);
  const [consultantProbabilities, setConsultantProbabilities] = useState<
    number[]
  >([]);
  const [currentCosts, setCurrentCosts] = useState(0);

  useEffect(() => {
    const unsubGameState = onSnapshot(
      doc(db, 'gameState', 'current'),
      (doc) => {
        if (doc.exists()) {
          const newGameState = doc.data() as GameState;
          setGameState(newGameState);

          // Reset local state when new round starts
          if (newGameState.phase === 'phase1') {
            setConsultantsHired(0);
            setHasHiredConsultants(false);
            setHasInvested(false);
            setConsultantProbabilities([]);
            setCurrentCosts(0);
          }
        }
      }
    );

    return () => unsubGameState();
  }, []);

  // Add this effect right after your other useEffect hooks in StudentView
  useEffect(() => {
    if (gameState?.phase === 'registration') {
      setTeamData(null);
      setTeamName('');
      setConsultantsHired(0);
      setHasHiredConsultants(false);
      setHasInvested(false);
      setConsultantProbabilities([]);
      setCurrentCosts(0);
    }
  }, [gameState?.phase]);

  useEffect(() => {
    if (!teamName) return;

    const unsubTeam = onSnapshot(doc(db, 'teams', teamName), (doc) => {
      if (doc.exists()) {
        setTeamData(doc.data() as TeamData);
      }
    });

    return () => unsubTeam();
  }, [teamName]);

  const handleRegistration = async () => {
    if (!teamName) return;

    try {
      await setDoc(doc(db, 'teams', teamName), {
        teamName,
        totalMoney: 0,
        currentRound: {
          consultantsHired: 0,
          invested: null, // Changed from false to null to indicate no decision made
          roundProfit: 0,
        },
      });
    } catch (error) {
      console.error('Error registering team:', error);
    }
  };

  const handleHireConsultants = async () => {
    if (!teamName || !gameState || hasHiredConsultants) return;

    const roundData = gameConfig.rounds[gameState.currentRound - 1];
    const probabilities = roundData.consultants.slice(0, consultantsHired);
    const consultantCost = consultantsHired * gameConfig.consultantCost;

    setConsultantProbabilities(probabilities);
    setCurrentCosts(consultantCost);
    setHasHiredConsultants(true);

    try {
      await setDoc(
        doc(db, 'teams', teamName),
        {
          currentRound: {
            consultantsHired,
            invested: null, // Changed from false to null
            roundProfit: -consultantCost,
          },
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error hiring consultants:', error);
    }
  };

  const handleInvestmentDecision = async (willInvest: boolean) => {
    if (!teamName || !gameState || hasInvested) return;

    const totalCost =
      currentCosts + (willInvest ? gameConfig.investmentAmount : 0);
    setCurrentCosts(totalCost);
    setHasInvested(true);

    try {
      await setDoc(
        doc(db, 'teams', teamName),
        {
          currentRound: {
            consultantsHired,
            invested: willInvest,
            roundProfit: -totalCost,
          },
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error submitting investment decision:', error);
    }
  };

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* Registration Phase */}
      {gameState.phase === 'registration' && !teamData && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Team Registration</h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="border p-2 rounded"
            />
            <button
              onClick={handleRegistration}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Register
            </button>
          </div>
        </div>
      )}

      {/* Game View */}
      {teamData && (
        <div>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h1 className="text-2xl font-bold">Team: {teamName}</h1>
            <div className="text-lg">
              <div>Total Money: ${teamData.totalMoney}</div>
              <div>Current Round: {gameState.currentRound}</div>
              <div className="text-red-500">
                Current Round Costs: -${currentCosts}
              </div>
            </div>
          </div>

          {/* Phase 1: Hire Consultants */}
          {gameState.phase === 'phase1' && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl mb-2">Phase 1: Hire Consultants</h2>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={consultantsHired}
                  onChange={(e) =>
                    setConsultantsHired(parseInt(e.target.value))
                  }
                  disabled={hasHiredConsultants}
                  className="border p-2 rounded w-20"
                />
                <button
                  onClick={handleHireConsultants}
                  disabled={
                    hasHiredConsultants ||
                    consultantsHired < 1 ||
                    consultantsHired > 5
                  }
                  className={`px-4 py-2 rounded ${
                    hasHiredConsultants
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {hasHiredConsultants
                    ? 'Consultants Hired'
                    : 'Hire Consultants'}
                </button>
              </div>
              <div className="mt-2">
                Cost: ${consultantsHired * gameConfig.consultantCost}
              </div>
            </div>
          )}

          {/* Phase 2: Investment Decision */}
          {gameState.phase === 'phase2' && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl mb-2">Phase 2: Investment Decision</h2>
              <div className="mb-4">
                <h3 className="font-bold">Your Consultant Probabilities:</h3>
                <div className="flex gap-2 mt-2">
                  {consultantProbabilities.map((prob, index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded">
                      {prob}%
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleInvestmentDecision(true)}
                  disabled={hasInvested}
                  className={`px-6 py-3 rounded-lg ${
                    hasInvested
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white font-bold`}
                >
                  Invest $300
                </button>
                <button
                  onClick={() => handleInvestmentDecision(false)}
                  disabled={hasInvested}
                  className={`px-6 py-3 rounded-lg ${
                    hasInvested
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white font-bold`}
                >
                  Don't Invest
                </button>
              </div>
              {hasInvested && (
                <div className="mt-4 text-gray-600">
                  Investment decision submitted
                </div>
              )}
            </div>
          )}

          {/* Results Phase */}
          {gameState.phase === 'results' && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl mb-2">Round Results</h2>
              {gameState.roundOutcome !== null && (
                <div
                  className={`text-2xl font-bold ${
                    gameState.roundOutcome ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {gameState.roundOutcome ? 'Success!' : 'Failed!'}
                </div>
              )}
              <div className="mt-2">
                Round Profit/Loss: ${teamData.currentRound.roundProfit}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentView;
