// components/StudentView.tsx
import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { gameConfig } from '../config';
import { TeamData, GameState, RoundData } from '../types'; // Import RoundData

const StudentView = () => {
  const [teamName, setTeamName] = useState('');
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [consultantsHired, setConsultantsHired] = useState(0); // Number of consultants
  const [hasHiredConsultants, setHasHiredConsultants] = useState(false);
  const [hasInvested, setHasInvested] = useState(false);
  
  // Store consultant insights (comment + probability)
  const [consultantInsights, setConsultantInsights] = useState<
    { probability: number; comment: string }[]
  >([]);
  const [currentCosts, setCurrentCosts] = useState(0); // Total costs accumulated in the round by this team
  const [currentDrugData, setCurrentDrugData] = useState<RoundData | null>(null);

  useEffect(() => {
    const unsubGameState = onSnapshot(
      doc(db, 'gameState', 'current'),
      (docSnap) => {
        if (docSnap.exists()) {
          const newGameState = docSnap.data() as GameState;
          setGameState(newGameState);

          if (newGameState.currentRound > 0 && newGameState.currentRound <= gameConfig.rounds.length) {
            setCurrentDrugData(gameConfig.rounds[newGameState.currentRound - 1]);
          } else {
            setCurrentDrugData(null); // Or handle end of game/invalid round
          }

          // Reset local state when new round starts (phase1)
          if (newGameState.phase === 'phase1') {
            setConsultantsHired(0);
            setHasHiredConsultants(false);
            setHasInvested(false);
            setConsultantInsights([]);
            setCurrentCosts(0);
          }
        }
      }
    );
    return () => unsubGameState();
  }, []);

  useEffect(() => {
    if (gameState?.phase === 'registration') {
      setTeamData(null);
      setTeamName('');
      // Reset other states as well, similar to phase1 reset
      setConsultantsHired(0);
      setHasHiredConsultants(false);
      setHasInvested(false);
      setConsultantInsights([]);
      setCurrentCosts(0);
      setCurrentDrugData(null);
    }
  }, [gameState?.phase]);

  useEffect(() => {
    if (!teamName) return;
    const unsubTeam = onSnapshot(doc(db, 'teams', teamName), (docSnap) => {
      if (docSnap.exists()) {
        setTeamData(docSnap.data() as TeamData);
      }
    });
    return () => unsubTeam();
  }, [teamName]);

  const handleRegistration = async () => {
    if (!teamName.trim()) {
        alert("Please enter a team name.");
        return;
    }
    try {
      await setDoc(doc(db, 'teams', teamName), {
        teamName,
        totalMoney: 5000000, // Example starting capital for a pharma company
        currentRound: {
          consultantsHired: null,
          invested: null,
          roundProfit: 0,
        },
      });
      // setTeamData might not be immediately necessary if onSnapshot catches it
    } catch (error) {
      console.error('Error registering team:', error);
      alert('Error registering team. The name might be taken or there was a network issue.');
    }
  };

  const handleHireConsultants = async () => {
    if (!teamName || !gameState || hasHiredConsultants || !currentDrugData || consultantsHired <= 0) return;

    const hiredOpinions = currentDrugData.consultants
      .slice(0, consultantsHired)
      .map((prob, index) => ({
        probability: prob,
        comment: currentDrugData.consultantComments[index],
      }));
    
    const costOfConsultants = consultantsHired * currentDrugData.consultantCost;

    setConsultantInsights(hiredOpinions);
    setCurrentCosts(costOfConsultants);
    setHasHiredConsultants(true);

    try {
      await setDoc(
        doc(db, 'teams', teamName),
        {
          currentRound: {
            consultantsHired,
            invested: null, // Still undecided on investment
            roundProfit: -costOfConsultants, // Initial expenditure
          },
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error hiring consultants:', error);
    }
  };

  const handleInvestmentDecision = async (willInvest: boolean) => {
    if (!teamName || !gameState || hasInvested || !currentDrugData) return;

    // currentCosts should already reflect consultant costs from handleHireConsultants
    let totalRoundExpenditure = currentCosts; 

    if (willInvest) {
      totalRoundExpenditure += currentDrugData.investmentAmount;
    }
    
    setCurrentCosts(totalRoundExpenditure); // Update UI display of total committed costs for the round
    setHasInvested(true);

    try {
      await setDoc(
        doc(db, 'teams', teamName),
        {
          currentRound: {
            // consultantsHired is already merged from previous step
            invested: willInvest,
            roundProfit: -totalRoundExpenditure, // This is the total cost for the round (always negative)
          },
        },
        { merge: true } 
      );
    } catch (error) {
      console.error('Error submitting investment decision:', error);
    }
  };

  if (!gameState) return <div className="p-4">Loading game state...</div>;
  // During active game phases, currentDrugData should be available
  if (gameState.phase !== 'registration' && gameState.phase !== 'gameOver' && !currentDrugData) {
    return <div className="p-4">Loading drug information for round {gameState.currentRound}...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Registration Phase */}
      {gameState.phase === 'registration' && !teamData && (
        <div className="bg-white p-6 rounded shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Pharma Company Registration</h1>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your Company Name"
              className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRegistration}
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-700 transition duration-150 w-full sm:w-auto"
            >
              Register Company
            </button>
          </div>
           {teamData && <p className="mt-4 text-green-600">Company {teamData.teamName} registered successfully! Waiting for game to start.</p>}
        </div>
      )}
      
      {gameState.phase === 'gameOver' && teamData && (
        <div className="bg-white p-6 rounded shadow-lg text-center">
            <h1 className="text-3xl font-bold mb-4 text-blue-600">Game Over!</h1>
            <p className="text-xl">Thank you for playing, {teamData.teamName}.</p>
            <p className="text-2xl mt-4">Final Company Valuation: ${teamData.totalMoney.toLocaleString()}</p>
        </div>
      )}


      {/* Game View (when team is registered and game is not over) */}
      {teamData && currentDrugData && gameState.phase !== 'registration' && gameState.phase !== 'gameOver' && (
        <div className="space-y-6">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold">Company: {teamData.teamName}</h1>
            <div className="text-lg mt-2">
              <div>Current Portfolio Value: ${teamData.totalMoney.toLocaleString()}</div>
              <div className="mt-1">Round {gameState.currentRound}: Drug Candidate <span className="font-semibold">{currentDrugData.drugName}</span></div>
              <p className="text-sm text-gray-300 mt-1">{currentDrugData.drugDescription}</p>
              <div className={`mt-2 font-semibold ${currentCosts > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                Current Round Expenditures: -${currentCosts.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Phase 1: Hire Consultants/Get Expert Opinions */}
          {gameState.phase === 'phase1' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-3 text-gray-700">Phase 1: Seek Expert Opinions on {currentDrugData.drugName}</h2>
              <p className="mb-1">Cost per expert opinion: ${currentDrugData.consultantCost.toLocaleString()}</p>
              <p className="mb-4 text-sm text-gray-600">You can request opinions from up to {currentDrugData.consultants.length} experts.</p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="number"
                  min="0" // Allow 0 if they want to skip
                  max={currentDrugData.consultants.length}
                  value={consultantsHired}
                  onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 0 && val <= currentDrugData.consultants.length) {
                          setConsultantsHired(val);
                      } else if (e.target.value === "") {
                          setConsultantsHired(0);
                      }
                  }}
                  disabled={hasHiredConsultants}
                  className="border p-3 rounded w-full sm:w-24 text-center focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleHireConsultants}
                  disabled={
                    hasHiredConsultants || consultantsHired < 0 // Allow 0 hires
                  }
                  className={`px-6 py-3 rounded text-white font-medium transition duration-150 w-full sm:w-auto ${
                    hasHiredConsultants || consultantsHired < 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-500 hover:bg-indigo-700'
                  }`}
                >
                  {hasHiredConsultants ? (consultantsHired > 0 ? 'Opinions Acquired' : 'Skipped Opinions') : 'Confirm Opinions'}
                </button>
              </div>
              {consultantsHired > 0 && <div className="mt-3 text-sm">
                Total Cost for Opinions: ${ (consultantsHired * currentDrugData.consultantCost).toLocaleString() }
              </div>}
            </div>
          )}

          {/* Phase 2: Investment Decision */}
          {gameState.phase === 'phase2' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-3 text-gray-700">Phase 2: Investment Decision for {currentDrugData.drugName}</h2>
              <p className="mb-1">Cost to proceed with current development phase (e.g., clinical trial): ${currentDrugData.investmentAmount.toLocaleString()}</p>
              
              {consultantInsights.length > 0 && (
                <div className="mb-6 mt-4">
                  <h3 className="font-bold text-lg text-gray-600">Acquired Expert Opinions:</h3>
                  <ul className="list-none mt-2 space-y-2">
                    {consultantInsights.map((insight, index) => (
                      <li key={index} className="bg-gray-100 p-3 rounded shadow-sm">
                        <p className="text-gray-800">{insight.comment}</p>
                        <p className="text-xs text-blue-500 mt-1">Reported Success Chance: {insight.probability}%</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {consultantsHired === 0 && hasHiredConsultants && (
                <p className="text-gray-600 my-4 italic">You chose not to seek expert opinions for this drug candidate.</p>
              )}


              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  onClick={() => handleInvestmentDecision(true)}
                  disabled={hasInvested}
                  className={`px-8 py-4 rounded-lg text-white font-bold transition duration-150 w-full ${
                    hasInvested
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-700'
                  }`}
                >
                  Invest ${currentDrugData.investmentAmount.toLocaleString()}
                </button>
                <button
                  onClick={() => handleInvestmentDecision(false)}
                  disabled={hasInvested}
                  className={`px-8 py-4 rounded-lg text-white font-bold transition duration-150 w-full ${
                    hasInvested
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-700'
                  }`}
                >
                  Do Not Invest (Abandon Drug)
                </button>
              </div>
              {hasInvested && (
                <div className="mt-4 text-center text-gray-700 font-medium">
                  Investment decision has been submitted. Waiting for trial outcome...
                </div>
              )}
            </div>
          )}

          {/* Results Phase */}
          {gameState.phase === 'results' && teamData.currentRound && (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Round {gameState.currentRound} Results: {currentDrugData.drugName}</h2>
              {gameState.roundOutcome !== null && (
                <div
                  className={`text-4xl font-bold my-4 ${
                    gameState.roundOutcome ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {currentDrugData.drugName} Development Phase {gameState.roundOutcome ? 'SUCCEEDED!' : 'FAILED!'}
                </div>
              )}
              <div className="mt-2 text-xl">
                Net Change in Portfolio Value: 
                <span className={`font-bold ${teamData.currentRound.roundProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                   ${teamData.currentRound.roundProfit >= 0 ? '+' : ''}{teamData.currentRound.roundProfit.toLocaleString()}
                </span>
              </div>
              <p className="mt-4 text-gray-600">Waiting for the next drug candidate evaluation or game conclusion...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentView;