import { useGame } from '../../contexts/GameContext';
import { WavelengthDial } from './WavelengthDial';

// UI text translations
const UI_TEXT = {
    en: {
        title: 'Make Your Guess!',
        subtitle: 'Drag the red pointer to where you think the target is',
        instruction: 'Discuss with your team, then confirm your guess',
        submit: 'Lock In Guess',
    },
    zh: {
        title: '猜一猜！',
        subtitle: '拖动红色指针到你认为目标所在的位置',
        instruction: '和队友讨论后，确认你的猜测',
        submit: '确认猜测',
    },
};

export function TeamGuessView() {
    const { state, setGuess, submitGuess } = useGame();
    const { language, currentCard, guessPosition } = state;
    const t = UI_TEXT[language];

    const cardDisplay = currentCard ? (
        language === 'en'
            ? { left: currentCard.englishL, right: currentCard.englishR }
            : { left: currentCard.chineseL, right: currentCard.chineseR }
    ) : null;

    return (
        <div className="game-phase guess-view animate-fadeIn">
            <h2 className="phase-title">{t.title}</h2>
            <p className="phase-subtitle">{t.subtitle}</p>

            {/* Card display */}
            {currentCard && (
                <div className="game-card animate-scaleIn">
                    <div className="spectrum">
                        <span className="left">{cardDisplay?.left}</span>
                        <span className="divider">⟷</span>
                        <span className="right">{cardDisplay?.right}</span>
                    </div>
                </div>
            )}

            {/* Dial for guessing - target hidden */}
            <WavelengthDial
                targetPosition={state.targetPosition}
                showTarget={false}
                guessPosition={guessPosition}
                onGuessChange={setGuess}
                interactive={true}
                leftLabel={cardDisplay?.left}
                rightLabel={cardDisplay?.right}
            />

            <p className="phase-instruction" style={{
                marginTop: 16,
                fontSize: '0.9rem',
                opacity: 0.7,
                textAlign: 'center',
            }}>
                {t.instruction}
            </p>

            {/* Action buttons */}
            <div className="action-buttons">
                <button
                    className="btn btn-primary"
                    onClick={submitGuess}
                >
                    {t.submit}
                </button>
            </div>
        </div>
    );
}

export default TeamGuessView;
