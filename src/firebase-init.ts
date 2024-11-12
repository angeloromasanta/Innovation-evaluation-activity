// firebase-init.ts
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

export const resetGame = async () => {
  try {
    // 1. Delete all existing teams
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    const deletePromises = teamsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // 2. Reset game state
    await setDoc(doc(db, 'gameState', 'current'), {
      currentRound: 1,
      phase: 'registration',
      showProbabilities: false,
      showDecisions: false,
      showResults: false,
      roundOutcome: null,
    });

    console.log('Game reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting game:', error);
    return false;
  }
};

// Initial setup for first time
export const initializeGame = async () => {
  try {
    // Set initial game state
    await setDoc(doc(db, 'gameState', 'current'), {
      currentRound: 1,
      phase: 'registration',
      showProbabilities: false,
      showDecisions: false,
      showResults: false,
      roundOutcome: null,
    });

    console.log('Game initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing game:', error);
    return false;
  }
};
