// Card type (from the original CSV/AI generation)
export interface Card {
    chineseL: string;
    chineseR: string;
    englishL: string;
    englishR: string;
}

// Game phases
export type GamePhase = 'menu' | 'setup' | 'psychic' | 'guess' | 'reveal' | 'complete';

// Team type
export type Team = 1 | 2;

// Game mode
export type GameMode = 'single' | 'versus';

// Language
export type Language = 'en' | 'zh';

// Score zones (degrees from center)
export interface ScoreZone {
    points: number;
    maxAngle: number; // degrees from center
    color: string;
}

// Game state interface
export interface GameState {
    phase: GamePhase;
    mode: GameMode;
    language: Language;
    currentCard: Card | null;
    targetPosition: number;    // 0-180 degrees (0 = left edge, 180 = right edge)
    guessPosition: number;     // team's guess position
    scores: { team1: number; team2: number };
    currentTeam: Team;
    roundNumber: number;
    lastRoundScore: number;
}

// Game actions
export type GameAction =
    | { type: 'SET_MODE'; mode: GameMode }
    | { type: 'SET_LANGUAGE'; language: Language }
    | { type: 'START_GAME' }
    | { type: 'SET_CARD'; card: Card }
    | { type: 'SET_TARGET'; position: number }
    | { type: 'PSYCHIC_READY' }
    | { type: 'SET_GUESS'; position: number }
    | { type: 'SUBMIT_GUESS' }
    | { type: 'NEXT_ROUND' }
    | { type: 'RESET_GAME' };

// Score zones configuration (from center bullseye outward)
export const SCORE_ZONES: ScoreZone[] = [
    { points: 4, maxAngle: 8, color: '#FFD700' },   // Gold - bullseye
    { points: 3, maxAngle: 16, color: '#FF8C00' },  // Orange
    { points: 2, maxAngle: 24, color: '#FF4500' },  // Red-orange
];

// Calculate score based on distance from target
export function calculateScore(targetPosition: number, guessPosition: number): number {
    const distance = Math.abs(targetPosition - guessPosition);

    for (const zone of SCORE_ZONES) {
        if (distance <= zone.maxAngle) {
            return zone.points;
        }
    }
    return 0;
}

// Game settings
export const MAX_ROUNDS = 5;
