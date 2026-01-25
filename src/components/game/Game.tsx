import { useGame } from '../../contexts/GameContext';
import { LanguageToggle } from '../LanguageToggle';
import { PsychicView } from './PsychicView';
import { TeamGuessView } from './TeamGuessView';
import { ScoreReveal } from './ScoreReveal';
import { GameComplete } from './GameComplete';

// UI text translations
const UI_TEXT = {
    en: {
        round: 'Round',
        score: 'Total Score',
        back: '← Back',
    },
    zh: {
        round: '回合',
        score: '总分',
        back: '← 返回',
    },
};

interface GameProps {
    onBack: () => void;
}

export function Game({ onBack }: GameProps) {
    const { state, startGame, setLanguage, resetGame } = useGame();
    const { phase, language, scores, roundNumber } = state;
    const t = UI_TEXT[language];

    // Start game on mount if in setup phase
    if (phase === 'menu' || phase === 'setup') {
        startGame();
        return null;
    }

    const handleBack = () => {
        resetGame();
        onBack();
    };

    // Toggle language
    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'zh' : 'en');
    };

    return (
        <div className="game-wrapper">
            {/* Header */}
            <header className="game-header">
                <div className="header-top">
                    <div className="header-left"></div>
                    <button className="back-btn-centered" onClick={handleBack}>
                        {t.back}
                    </button>
                    <LanguageToggle
                        language={language}
                        onToggle={toggleLanguage}
                        className="header-lang-toggle"
                    />
                </div>

                <div className="header-bottom">
                    <div className="game-stats">
                        <span className="round-count">{t.round} {roundNumber}</span>
                        <span className="separator">|</span>
                        <span className="total-score">{t.score}: {scores.team1}</span>
                    </div>
                </div>
            </header>

            {/* Game content based on phase */}
            <div className="game-content">
                {phase === 'psychic' && <PsychicView />}
                {phase === 'guess' && <TeamGuessView />}
                {phase === 'reveal' && <ScoreReveal />}
                {phase === 'complete' && <GameComplete />}
            </div>
        </div>
    );
}

export default Game;
