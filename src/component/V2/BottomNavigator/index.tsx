import React from 'react';
import './styles.css';
import {useHistory, useLocation} from "react-router-dom";

interface BottomNavigatorProps {
    userData: any;
    isVisible?: boolean;
}

const BottomNavigator: React.FC<BottomNavigatorProps> = ({ userData, isVisible = true }) => {
    const history = useHistory();
    const location = useLocation();

    return (
        <nav className={`bottom-nav ${isVisible ? 'visible' : 'hidden'}`}>
            <button
                className={`nav-item ${['/chassis/v2/calculator'].includes(location.pathname) ? 'active' : ''}`}
                onClick={() => history.push("/chassis/v2/calculator")}
            >
                <span className="nav-icon">🏠</span>
                <span className="nav-label">홈</span>
            </button>
            <button
                className={`nav-item ${location.pathname === '/mypage' ? 'active' : ''}`}
            >
                <span className="nav-icon">💬&nbsp;</span>
                <span className="nav-label">지식인</span>
            </button>

            {userData ?
                <button
                    className={`nav-item ${location.pathname === '/v2/mypage' ? 'active' : ''}`}
                    onClick={() => history.push("/v2/mypage")}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">마이</span>
                </button>
                :
                <button
                    className={`nav-item ${location.pathname === '/v2/login' ? 'active' : ''}`}
                    onClick={() => history.push("/v2/login")}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">로그인</span>
                </button>
            }
        </nav>
    );
}

export default BottomNavigator;
