import type { Card } from '../types/game';
import { getCategories } from '../hooks/useCardGenerator';

// UI text translations for card selector
const UI_TEXT = {
    en: {
        random: '🎲 Draw Card',
        ai: '🤖 AI Card',
        category: 'Category:',
        customCategory: 'Custom category...',
        categoryNote: '(AI only)',
    },
    zh: {
        random: '🎲 抽卡',
        ai: '🤖 AI生成',
        category: '类别：',
        customCategory: '自定义类别...',
        categoryNote: '（仅AI）',
    },
};

interface CardSelectorProps {
    language: 'en' | 'zh';
    currentCard: Card | null;
    loading: boolean;
    error: string | null;
    selectedCategory: string;
    customCategory: string;
    cardsLoaded: boolean;
    onCategoryChange: (category: string) => void;
    onCustomCategoryChange: (custom: string) => void;
    onDrawCard: () => void;
    onGenerateAI: () => void;
    showCategorySelector?: boolean;
}

export function CardSelector({
    language,
    currentCard,
    loading,
    error,
    selectedCategory,
    customCategory,
    cardsLoaded,
    onCategoryChange,
    onCustomCategoryChange,
    onDrawCard,
    onGenerateAI,
    showCategorySelector = true,
}: CardSelectorProps) {
    const t = UI_TEXT[language];

    const cardDisplay = currentCard ? (
        language === 'en'
            ? { left: currentCard.englishL, right: currentCard.englishR }
            : { left: currentCard.chineseL, right: currentCard.chineseR }
    ) : null;

    return (
        <div className="card-selector">
            {/* 1. Buttons first */}
            <div className="card-buttons" style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
            }}>
                <button
                    className="btn btn-secondary"
                    onClick={onDrawCard}
                    disabled={!cardsLoaded}
                >
                    {t.random}
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={onGenerateAI}
                    disabled={loading}
                >
                    {loading ? '...' : t.ai}
                </button>
            </div>

            {/* 2. Category selection below buttons */}
            {showCategorySelector && (
                <div className="category-selector" style={{
                    marginTop: 12,
                    padding: 10,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 8,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                        {t.category}
                    </span>
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'inherit',
                            fontSize: '0.8rem',
                        }}
                    >
                        {getCategories(language).map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                    {selectedCategory === 'custom' && (
                        <input
                            type="text"
                            placeholder={t.customCategory}
                            value={customCategory}
                            onChange={(e) => onCustomCategoryChange(e.target.value)}
                            style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'inherit',
                                fontSize: '0.8rem',
                                minWidth: '100px',
                            }}
                        />
                    )}
                    <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{t.categoryNote}</span>
                </div>
            )}

            {/* 3. Card display */}
            {currentCard && (
                <div className="game-card animate-scaleIn" style={{ marginTop: 16 }}>
                    <div className="spectrum">
                        <span className="left">{cardDisplay?.left}</span>
                        <span className="divider">⟷</span>
                        <span className="right">{cardDisplay?.right}</span>
                    </div>
                </div>
            )}

            {/* Error display */}
            {error && (
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: 8, textAlign: 'center' }}>
                    {error}
                </p>
            )}
        </div>
    );
}

export default CardSelector;
