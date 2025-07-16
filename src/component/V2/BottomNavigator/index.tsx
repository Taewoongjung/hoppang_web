import React from 'react';
import './styles.css';
import {useLocation} from "react-router-dom";

interface BottomNavigatorProps {
    userData: any;
    isVisible?: boolean;
}

const BottomNavigator: React.FC<BottomNavigatorProps> = ({ userData, isVisible = true }) => {
    const location = useLocation();

    return (
        <nav className={`bottom-nav ${isVisible ? 'visible' : 'hidden'}`}>
            <button
                className={`nav-item ${['/chassis/v2/calculator'].includes(location.pathname) ? 'active' : ''}`}
                onClick={() => window.location.href ="/chassis/v2/calculator"}
            >
                <span className="nav-icon">🏠</span>
                <span className="nav-label">홈</span>
            </button>
            <button
                className={`nav-item ${location.pathname === '/question/boards' ? 'active' : ''}`}
                onClick={() => window.location.href ="/question/boards"}
            >
                <span className="nav-icon">💬&nbsp;</span>
                <span className="nav-label">커뮤니티</span>
            </button>

            {userData ?
                <button
                    className={`nav-item ${location.pathname === '/v2/mypage' ? 'active' : ''}`}
                    onClick={() => window.location.href ="/v2/mypage"}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">마이</span>
                </button>
                :
                <button
                    className={`nav-item ${location.pathname === '/v2/login' ? 'active' : ''}`}
                    onClick={() => window.location.href ="/v2/login"}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">마이</span>
                </button>
            }
        </nav>
    );
}

export default BottomNavigator;
