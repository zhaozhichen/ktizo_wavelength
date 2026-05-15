import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { GameState, GameAction, GameMode, Language, Card } from '../types/game';
import { calculateScore, MAX_ROUNDS } from '../types/game';

// Initial state
const initialState: GameState = {
    phase: 'menu',
    mode: 'single',
    language: 'zh',
    currentCard: null,
    targetPosition: 90,
    guessPosition: 90,
    scores: { team1: 0, team2: 0 },
    currentTeam: 1,
    roundNumber: 0,
    lastRoundScore: 0,
};

// Generate random target position across the full semicircle, inclusive.
function generateTargetPosition(): number {
    return Math.floor(Math.random() * 181);
}

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'SET_MODE':
            return { ...state, mode: action.mode };

        case 'SET_LANGUAGE':
            return { ...state, language: action.language };

        case 'START_GAME':
            return {
                ...state,
                phase: 'psychic',
                roundNumber: 1,
                scores: { team1: 0, team2: 0 },
                currentTeam: 1,
                targetPosition: generateTargetPosition(),
                guessPosition: 90,
                lastRoundScore: 0,
            };

        case 'SET_CARD':
            // Regenerate target position when a new card is drawn
            return {
                ...state,
                currentCard: action.card,
                targetPosition: generateTargetPosition(),
            };

        case 'SET_TARGET':
            return { ...state, targetPosition: action.position };

        case 'PSYCHIC_READY':
            return { ...state, phase: 'guess' };

        case 'SET_GUESS':
            return { ...state, guessPosition: action.position };

        case 'SUBMIT_GUESS': {
            const score = calculateScore(state.targetPosition, state.guessPosition);
            const newScores = { ...state.scores };

            if (state.currentTeam === 1) {
                newScores.team1 += score;
            } else {
                newScores.team2 += score;
            }

            return {
                ...state,
                phase: 'reveal',
                scores: newScores,
                lastRoundScore: score,
            };
        }

        case 'NEXT_ROUND': {
            // Check for winner (max rounds)
            if (state.roundNumber >= MAX_ROUNDS) {
                return { ...state, phase: 'complete' };
            }

            // Next round
            const nextTeam = state.mode === 'versus'
                ? (state.currentTeam === 1 ? 2 : 1) as 1 | 2
                : 1;

            return {
                ...state,
                phase: 'psychic',
                roundNumber: state.roundNumber + 1,
                currentTeam: nextTeam,
                targetPosition: generateTargetPosition(),
                guessPosition: 90,
                currentCard: null,
                lastRoundScore: 0,
            };
        }

        case 'RESET_GAME':
            return initialState;

        default:
            return state;
    }
}

// Context
interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    setMode: (mode: GameMode) => void;
    setLanguage: (language: Language) => void;
    startGame: () => void;
    setCard: (card: Card) => void;
    psychicReady: () => void;
    setGuess: (position: number) => void;
    submitGuess: () => void;
    nextRound: () => void;
    resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

// Provider
interface GameProviderProps {
    children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const value: GameContextType = {
        state,
        dispatch,
        setMode: (mode) => dispatch({ type: 'SET_MODE', mode }),
        setLanguage: (language) => dispatch({ type: 'SET_LANGUAGE', language }),
        startGame: () => dispatch({ type: 'START_GAME' }),
        setCard: (card) => dispatch({ type: 'SET_CARD', card }),
        psychicReady: () => dispatch({ type: 'PSYCHIC_READY' }),
        setGuess: (position) => dispatch({ type: 'SET_GUESS', position }),
        submitGuess: () => dispatch({ type: 'SUBMIT_GUESS' }),
        nextRound: () => dispatch({ type: 'NEXT_ROUND' }),
        resetGame: () => dispatch({ type: 'RESET_GAME' }),
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

// Hook
export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}

export { GameContext };
