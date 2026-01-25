import { useState, useEffect, useRef, useCallback } from 'react';
import type { Card } from '../types/game';

// Category labels by language
export const CATEGORY_LABELS = {
    en: {
        any: 'Any',
        music: '🎵 Music',
        food: '🍕 Food & Drink',
        entertainment: '🎮 Entertainment',
        geography: '🌍 Geography',
        sports: '⚽ Sports',
        art: '🎨 Art & Culture',
        science: '🔬 Science',
        literature: '📚 Literature',
        history: '🏛️ History',
        business: '💼 Business',
        emotions: '🎭 Emotions',
        daily: '🏠 Daily Life',
        custom: 'Custom...',
    },
    zh: {
        any: '任意',
        music: '🎵 音乐',
        food: '🍕 美食',
        entertainment: '🎮 娱乐',
        geography: '🌍 地理',
        sports: '⚽ 体育',
        art: '🎨 文化艺术',
        science: '🔬 科学',
        literature: '📚 文学',
        history: '🏛️ 历史',
        business: '💼 商业',
        emotions: '🎭 情感',
        daily: '🏠 生活',
        custom: '自定义...',
    },
};

// Get categories for current language
export function getCategories(lang: 'en' | 'zh') {
    const labels = CATEGORY_LABELS[lang];
    return [
        { value: '', label: labels.any },
        { value: '🎵 Music', label: labels.music },
        { value: '🍕 Food & Drink', label: labels.food },
        { value: '🎮 Entertainment', label: labels.entertainment },
        { value: '🌍 Geography', label: labels.geography },
        { value: '⚽ Sports', label: labels.sports },
        { value: '🎨 Art & Culture', label: labels.art },
        { value: '🔬 Science', label: labels.science },
        { value: '📚 Literature', label: labels.literature },
        { value: '🏛️ History', label: labels.history },
        { value: '💼 Business', label: labels.business },
        { value: '🎭 Emotions', label: labels.emotions },
        { value: '🏠 Daily Life', label: labels.daily },
        { value: 'custom', label: labels.custom },
    ];
}

interface UseCardGeneratorOptions {
    onCardGenerated?: (card: Card) => void;
}

export function useCardGenerator(options: UseCardGeneratorOptions = {}) {
    const [cards, setCards] = useState<Card[]>([]);
    const [currentCard, setCurrentCard] = useState<Card | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [customCategory, setCustomCategory] = useState<string>('');
    const generatedCards = useRef<Set<string>>(new Set());

    // Load CSV cards
    useEffect(() => {
        fetch('/wavelength.csv')
            .then((res) => res.text())
            .then((text) => {
                const lines = text.split('\n').slice(1);
                const parsed: Card[] = lines
                    .map((line) => line.split(','))
                    .filter((arr) => arr.length === 4)
                    .map(([chineseL, chineseR, englishL, englishR]) => ({
                        chineseL: chineseL.trim(),
                        chineseR: chineseR.trim(),
                        englishL: englishL.trim(),
                        englishR: englishR.trim(),
                    }));
                setCards(parsed);
            });
    }, []);

    // Draw random card
    const drawCard = useCallback(() => {
        if (cards.length === 0) return;
        const idx = Math.floor(Math.random() * cards.length);
        const card = cards[idx];
        setCurrentCard(card);
        setError(null);
        options.onCardGenerated?.(card);
    }, [cards, options]);

    // Generate AI card
    const generateAICard = useCallback(async () => {
        setLoading(true);
        setError(null);

        const categoryToUse = selectedCategory === 'custom' ? customCategory : selectedCategory;
        const allGeneratedArr = Array.from(generatedCards.current);
        if (currentCard) {
            allGeneratedArr.push(JSON.stringify(currentCard));
        }

        let attempts = 0;
        let card: Card | null = null;

        while (attempts < 5) {
            try {
                const res = await fetch('/api/generate-card', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        avoidPairs: allGeneratedArr,
                        category: categoryToUse
                    }),
                });
                if (!res.ok) throw new Error('Failed to generate');
                const data = await res.json();
                const cardStr = JSON.stringify(data);
                if (!generatedCards.current.has(cardStr)) {
                    generatedCards.current.add(cardStr);
                    card = data;
                    break;
                }
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'An error occurred');
                break;
            }
            attempts++;
        }

        if (card) {
            setCurrentCard(card);
            options.onCardGenerated?.(card);
        } else if (!error) {
            setError('No new unique AI card could be generated after several attempts.');
        }
        setLoading(false);
    }, [selectedCategory, customCategory, currentCard, error, options]);

    return {
        cards,
        currentCard,
        setCurrentCard,
        loading,
        error,
        selectedCategory,
        setSelectedCategory,
        customCategory,
        setCustomCategory,
        drawCard,
        generateAICard,
        cardsLoaded: cards.length > 0,
    };
}
