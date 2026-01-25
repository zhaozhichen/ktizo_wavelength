import { useCardGenerator, getCategories } from '../hooks/useCardGenerator';

// UI text translations
const UI_TEXT = {
    en: {
        title: 'Wavelength Card Generator',
        random: '🎲 Random Card',
        ai: '🤖 Generate with AI',
        noCard: 'No card selected yet.',
        category: 'Category:',
        customCategory: 'Custom category...',
        categoryNote: '(Only applies to AI generation)',
        back: '← Back',
    },
    zh: {
        title: '心电感应卡牌生成器',
        random: '🎲 随机卡牌',
        ai: '🤖 用人工智能生成',
        noCard: '尚未选择卡牌。',
        category: '类别：',
        customCategory: '自定义类别...',
        categoryNote: '（仅适用于人工智能生成）',
        back: '← 返回',
    },
};

interface CardGeneratorProps {
    onBack?: () => void;
    language?: 'en' | 'zh';
}

export function CardGenerator({ onBack, language = 'zh' }: CardGeneratorProps) {
    const cardGen = useCardGenerator();
    const { currentCard, loading, error, selectedCategory, customCategory, cardsLoaded } = cardGen;

    const t = UI_TEXT[language];

    const cardDisplay = currentCard ? (
        language === 'en'
            ? { left: currentCard.englishL, right: currentCard.englishR }
            : { left: currentCard.chineseL, right: currentCard.chineseR }
    ) : null;

    return (
        <div className="card-generator">
            {onBack && (
                <button className="back-btn-clean" onClick={onBack}>
                    {t.back}
                </button>
            )}
            <h1>{t.title}</h1>

            {/* Buttons only - no language toggle here */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={cardGen.drawCard} disabled={!cardsLoaded}>
                    {t.random}
                </button>
                <button onClick={cardGen.generateAICard} disabled={loading}>
                    {loading ? '...' : t.ai}
                </button>
            </div>

            {/* Category selection for AI generation */}
            <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                <div style={{ marginBottom: 12, fontSize: '0.9rem', fontWeight: 500 }}>
                    {t.category} <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.7 }}>{t.categoryNote}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <select
                        value={selectedCategory}
                        onChange={(e) => cardGen.setSelectedCategory(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'inherit',
                            fontSize: '0.9rem',
                            minWidth: '140px'
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
                            onChange={(e) => cardGen.setCustomCategory(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'inherit',
                                fontSize: '0.9rem',
                                minWidth: '150px'
                            }}
                        />
                    )}
                </div>
            </div>

            {cardDisplay ? (
                <div className="card-display">
                    <div className="spectrum">
                        <span className="left">{cardDisplay.left}</span>
                        <span className="arrow">⬅️➡️</span>
                        <span className="right">{cardDisplay.right}</span>
                    </div>
                </div>
            ) : (
                <p>{t.noCard}</p>
            )}
            {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
        </div>
    );
}

export default CardGenerator;
