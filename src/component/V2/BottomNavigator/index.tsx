import React from 'react';
import './styles.css';
import {useLocation} from "react-router-dom";

const BottomNavigator = () => {

    const location = useLocation();

    return (
        <nav className="bottom-nav">
            <button
                className={`nav-item ${['/chassis/calculator', '/chassis/estimation/calculator'].includes(location.pathname) ? 'active' : ''}`}
            >
                <span className="nav-icon">🏠</span>
                <span className="nav-label">홈</span>
            </button>
            <button
                className={`nav-item ${location.pathname === '/mypage' ? 'active' : ''}`}
            >
                <span className="nav-icon">💬</span>
                <span className="nav-label">지식인</span>
            </button>
            <button
                className={`nav-item $location.pathname === '/counsel' ? 'active' : ''}`}
            >
                <span className="nav-icon">👤</span>
                <span className="nav-label">내정보</span>
            </button>
        </nav>
    )
}

export default BottomNavigator;
