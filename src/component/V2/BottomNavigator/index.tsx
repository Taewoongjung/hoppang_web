import React, { useCallback, memo } from 'react';
import './styles.css';
import { useLocation, useHistory } from "react-router-dom";

interface BottomNavigatorProps {
    userData: unknown;
    isVisible?: boolean;
}

const BottomNavigator: React.FC<BottomNavigatorProps> = memo(({ userData, isVisible = true }) => {
    const location = useLocation();
    const history = useHistory();

    const navigateTo = useCallback((path: string) => {
        history.push(path);
    }, [history]);

    const isHomeActive = ['/chassis/calculator'].includes(location.pathname);
    const isCommunityActive = location.pathname === '/question/boards';
    const isMypageActive = location.pathname === '/v2/mypage';
    const isLoginActive = location.pathname === '/v2/login';

    return (
        <nav className={`bottom-nav ${isVisible ? 'visible' : 'hidden'}`}>
            <button
                className={`nav-item ${isHomeActive ? 'active' : ''}`}
                onClick={() => navigateTo("/chassis/calculator")}
            >
                <span className="nav-icon">🏠</span>
                <span className="nav-label">홈</span>
            </button>
            <button
                className={`nav-item ${isCommunityActive ? 'active' : ''}`}
                onClick={() => navigateTo("/question/boards")}
            >
                <span className="nav-icon">💬&nbsp;</span>
                <span className="nav-label">커뮤니티</span>
            </button>

            {userData ? (
                <button
                    className={`nav-item ${isMypageActive ? 'active' : ''}`}
                    onClick={() => navigateTo("/v2/mypage")}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">마이</span>
                </button>
            ) : (
                <button
                    className={`nav-item ${isLoginActive ? 'active' : ''}`}
                    onClick={() => navigateTo("/v2/login")}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">마이</span>
                </button>
            )}
        </nav>
    );
});

BottomNavigator.displayName = 'BottomNavigator';

export default BottomNavigator;
