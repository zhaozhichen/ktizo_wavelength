import { useGame } from '../../contexts/GameContext';
import { useCardGenerator } from '../../hooks/useCardGenerator';
import { CardSelector } from '../CardSelector';
import { WavelengthDial } from './WavelengthDial';

// UI text translations
const UI_TEXT = {
    en: {
        title: 'Psychic View',
        subtitle: 'Only YOU can see the target!',
        instruction: 'Give a clue that helps your team guess the target position',
        ready: "I'm Ready",
        noCard: 'Draw a card first',
    },
    zh: {
        title: 'Psychic 视角',
        subtitle: '只有你能看到目标位置！',
        instruction: '给出一个线索，帮助队友猜测目标位置',
        ready: '准备好了',
        noCard: '先抽一张卡',
    },
};

export function PsychicView() {
    const { state, setCard, psychicReady } = useGame();
    const { language, currentCard, targetPosition } = state;
    const t = UI_TEXT[language];

    const cardGenerator = useCardGenerator({
        onCardGenerated: setCard,
    });

    const cardDisplay = currentCard ? (
        language === 'en'
            ? { left: currentCard.englishL, right: currentCard.englishR }
            : { left: currentCard.chineseL, right: currentCard.chineseR }
    ) : null;

    return (
        <div className="game-phase psychic-view animate-fadeIn">
            <h2 className="phase-title">{t.title}</h2>
            <p className="phase-subtitle">{t.subtitle}</p>

            {/* 1. Card selector (draw buttons & category) */}
            <CardSelector
                language={language}
                currentCard={null}  // Don't show card here, show below
                loading={cardGenerator.loading}
                error={cardGenerator.error}
                selectedCategory={cardGenerator.selectedCategory}
                customCategory={cardGenerator.customCategory}
                cardsLoaded={cardGenerator.cardsLoaded}
                onCategoryChange={cardGenerator.setSelectedCategory}
                onCustomCategoryChange={cardGenerator.setCustomCategory}
                onDrawCard={cardGenerator.drawCard}
                onGenerateAI={cardGenerator.generateAICard}
            />

            {/* 2. Current card display */}
            {currentCard ? (
                <div className="game-card animate-scaleIn" style={{ marginTop: 16 }}>
                    <div className="spectrum">
                        <span className="left">{cardDisplay?.left}</span>
                        <span className="divider">⟷</span>
                        <span className="right">{cardDisplay?.right}</span>
                    </div>
                </div>
            ) : (
                <p className="phase-subtitle" style={{ margin: '16px 0', opacity: 0.6 }}>{t.noCard}</p>
            )}

            {/* 3. Dial - only show target after card is selected */}
            <WavelengthDial
                targetPosition={targetPosition}
                showTarget={!!currentCard}
                guessPosition={90}
                interactive={false}
                leftLabel={cardDisplay?.left}
                rightLabel={cardDisplay?.right}
            />

            {/* 4. Instruction */}
            <p className="phase-instruction" style={{
                marginTop: 8,
                fontSize: '0.9rem',
                opacity: 0.7,
                textAlign: 'center',
                maxWidth: 300,
            }}>
                {t.instruction}
            </p>

            {/* 5. Ready button */}
            <div className="action-buttons">
                <button
                    className="btn btn-primary"
                    onClick={psychicReady}
                    disabled={!currentCard}
                >
                    {t.ready}
                </button>
            </div>
        </div>
    );
}

export default PsychicView;
