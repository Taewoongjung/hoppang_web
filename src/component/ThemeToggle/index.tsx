import React from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import './styles.css';

/**
 * ThemeToggle - A toggle button for switching between light/dark/system themes
 */
const ThemeToggle: React.FC = () => {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const themeOptions: { value: ThemeMode; icon: string; label: string }[] = [
        { value: 'light', icon: '☀️', label: '라이트' },
        { value: 'dark', icon: '🌙', label: '다크' },
        { value: 'system', icon: '💻', label: '시스템' }
    ];

    return (
        <div className="theme-toggle" role="group" aria-label="테마 선택">
            {themeOptions.map((option) => (
                <button
                    key={option.value}
                    className={`theme-toggle-btn ${theme === option.value ? 'active' : ''}`}
                    onClick={() => setTheme(option.value)}
                    aria-pressed={theme === option.value}
                    aria-label={`${option.label} 모드`}
                >
                    <span className="theme-icon">{option.icon}</span>
                    <span className="theme-label">{option.label}</span>
                </button>
            ))}
        </div>
    );
};

/**
 * ThemeToggleCompact - A compact toggle button that cycles through themes
 */
const ThemeToggleCompact: React.FC = () => {
    const { theme, toggleTheme, resolvedTheme } = useTheme();

    const getIcon = () => {
        if (theme === 'system') return '💻';
        return resolvedTheme === 'dark' ? '🌙' : '☀️';
    };

    const getLabel = () => {
        if (theme === 'system') return '시스템';
        return theme === 'dark' ? '다크' : '라이트';
    };

    return (
        <button
            className="theme-toggle-compact"
            onClick={toggleTheme}
            aria-label={`현재 ${getLabel()} 모드. 클릭하여 변경`}
        >
            <span className="theme-icon">{getIcon()}</span>
        </button>
    );
};

export { ThemeToggle, ThemeToggleCompact };
export default ThemeToggle;
