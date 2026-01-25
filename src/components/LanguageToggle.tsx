interface LanguageToggleProps {
    language: 'en' | 'zh';
    onToggle: () => void;
    className?: string;
}

export function LanguageToggle({ language, onToggle, className = '' }: LanguageToggleProps) {
    return (
        <button
            className={`language-toggle-btn ${className}`}
            onClick={onToggle}
            title={language === 'zh' ? 'Switch to English' : '切换到中文'}
        >
            {language === 'zh' ? '🇬🇧 English' : '🇨🇳 中文'}
        </button>
    );
}

export default LanguageToggle;
