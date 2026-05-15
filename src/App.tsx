import { useState } from 'react'
import { useGame } from './contexts/GameContext'
import { CardGenerator } from './components/CardGenerator'
import { Game } from './components/game'
import { LanguageToggle } from './components/LanguageToggle'
import './styles/game.css'
import './styles/dial.css'
import './App.css'

// UI text translations for main menu
const UI_TEXT = {
  en: {
    title: 'Wavelength',
    subtitle: 'A game of reading minds',
    playGame: 'Play Game',
    cardGenerator: '🎴 Card Generator',
    rules: 'Game Rules',
  },
  zh: {
    title: '心电感应',
    subtitle: '一款读心游戏',
    playGame: '开始游戏',
    cardGenerator: '🎴 卡牌生成器',
    rules: '游戏规则',
  },
};

type AppView = 'menu' | 'game' | 'generator';

function App() {
  const [view, setView] = useState<AppView>('menu');
  const { state, setLanguage } = useGame();
  const { language } = state;

  const t = UI_TEXT[language];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  // Main menu
  if (view === 'menu') {
    return (
      <div className="game-container">
        <div className="main-menu">
          {/* Language toggle - top right */}
          <LanguageToggle
            language={language}
            onToggle={toggleLanguage}
            className="language-toggle"
          />

          {/* Logo / Title */}
          <div className="menu-header" style={{ marginBottom: 32 }}>
            <h1>{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>

          {/* Menu buttons */}
          <div className="menu-buttons">
            <button
              className="btn btn-primary"
              onClick={() => setView('game')}
            >
              <span className="btn-icon">🎮</span>
              {t.playGame}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setView('generator')}
            >
              {t.cardGenerator}
            </button>

            <a
              href="/Wavelength_rules.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              <span className="btn-icon">📜</span>
              {t.rules}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Card Generator
  if (view === 'generator') {
    return (
      <div className="game-container">
        <LanguageToggle
          language={language}
          onToggle={toggleLanguage}
          className="language-toggle"
        />
        <CardGenerator onBack={() => setView('menu')} language={language} />
      </div>
    );
  }

  // Game
  return (
    <div className="game-container">
      <Game onBack={() => setView('menu')} />
    </div>
  );
}

export default App
