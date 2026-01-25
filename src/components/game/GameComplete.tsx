import { useGame } from '../../contexts/GameContext';
import { MAX_ROUNDS } from '../../types/game';

// UI text translations
const UI_TEXT = {
    en: {
        gameOver: 'Game Over!',
        summary: 'You scored ${score} points in ${rounds} rounds.',
        finalScore: 'Final Score',
        playAgain: 'Play Again',
        backToMenu: 'Back to Menu',
    },
    zh: {
        gameOver: '游戏结束！',
        summary: '你在 ${rounds} 回合中获得了 ${score} 分。',
        finalScore: '最终得分',
        playAgain: '再玩一次',
        backToMenu: '返回主菜单',
    },
};

export function GameComplete() {
    const { state, startGame, resetGame } = useGame();
    const { language, scores } = state;
    const t = UI_TEXT[language];

    const summaryMessage = t.summary
        .replace('${score}', String(scores.team1))
        .replace('${rounds}', String(MAX_ROUNDS));

    return (
        <div className="game-phase game-complete animate-fadeIn">
            <h2 className="phase-title" style={{
                fontSize: 'clamp(2rem, 8vw, 3rem)',
                background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}>
                🎉 {t.gameOver}
            </h2>

            <p className="winner-text" style={{
                fontSize: '1.25rem',
                marginTop: 16,
                textAlign: 'center'
            }}>
                {summaryMessage}
            </p>

            {/* Final score display */}
            <div className="final-scores" style={{
                marginTop: 32,
                padding: 24,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 16,
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: 8 }}>
                    {t.finalScore}
                </div>
                <div style={{
                    fontSize: '4rem',
                    fontWeight: 800,
                    color: '#ffd700',
                }}>
                    {scores.team1}
                </div>
            </div>

            {/* Action buttons */}
            <div className="action-buttons" style={{ marginTop: 48 }}>
                <button
                    className="btn btn-primary"
                    onClick={startGame}
                >
                    {t.playAgain}
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={resetGame}
                >
                    {t.backToMenu}
                </button>
            </div>
        </div>
    );
}

export default GameComplete;
