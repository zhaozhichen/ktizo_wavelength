import { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { WavelengthDial } from './WavelengthDial';

// UI text translations
const UI_TEXT = {
    en: {
        points: 'points',
        perfect: 'PERFECT!',
        great: 'Great!',
        good: 'Good!',
        miss: 'Missed!',
        totalScore: 'Total Score',
        next: 'Next Round',
    },
    zh: {
        points: '分',
        perfect: '完美！',
        great: '很棒！',
        good: '不错！',
        miss: '没中！',
        totalScore: '总分',
        next: '下一轮',
    },
};

function getScoreMessage(score: number, t: typeof UI_TEXT['en']) {
    switch (score) {
        case 4: return t.perfect;
        case 3: return t.great;
        case 2: return t.good;
        default: return t.miss;
    }
}

function getScoreClass(score: number) {
    switch (score) {
        case 4: return 'gold';
        case 3: return 'orange';
        case 2: return 'red';
        default: return 'zero';
    }
}

export function ScoreReveal() {
    const { state, nextRound } = useGame();
    const { language, currentCard, targetPosition, guessPosition, lastRoundScore, scores } = state;
    const t = UI_TEXT[language];
    const [revealed, setRevealed] = useState(false);

    // Trigger reveal animation after mount
    useEffect(() => {
        const timer = setTimeout(() => setRevealed(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const cardDisplay = currentCard ? (
        language === 'en'
            ? { left: currentCard.englishL, right: currentCard.englishR }
            : { left: currentCard.chineseL, right: currentCard.chineseR }
    ) : null;

    return (
        <div className="game-phase reveal-view animate-fadeIn">
            {/* Dial with both pointers */}
            <WavelengthDial
                targetPosition={targetPosition}
                showTarget={true}
                revealTarget={revealed}
                guessPosition={guessPosition}
                interactive={false}
                showGuess={true}
                leftLabel={cardDisplay?.left}
                rightLabel={cardDisplay?.right}
            />

            {/* Score display */}
            <div className="score-reveal animate-scaleIn" style={{ marginTop: 24 }}>
                <div className={`points ${getScoreClass(lastRoundScore)}`}>
                    +{lastRoundScore}
                </div>
                <div className="label">
                    {getScoreMessage(lastRoundScore, t)}
                </div>
            </div>

            {/* Total score */}
            <div className="total-score" style={{
                marginTop: 24,
                textAlign: 'center',
                opacity: 0.8,
            }}>
                <div style={{ fontSize: '0.875rem', marginBottom: 4 }}>{t.totalScore}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{scores.team1}</div>
            </div>

            {/* Action buttons */}
            <div className="action-buttons">
                <button
                    className="btn btn-primary"
                    onClick={nextRound}
                >
                    {t.next}
                </button>
            </div>
        </div>
    );
}

export default ScoreReveal;
