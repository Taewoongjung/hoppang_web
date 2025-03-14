import React from 'react';
import './styles.css';
import {useLocation} from "react-router-dom";

const BottomNavigator = () => {

    const location = useLocation();

    return (
        <>
            <nav>
                {/*<a href="#" className={location.pathname === '/home' ? 'active' : ''}><span className="nav-icon"><img src="/assets/BottomNav/home.png" alt="Home"/></span>홈</a>*/}
                <a href="/chassis/calculator"
                   className={['/chassis/calculator', '/chassis/estimation/calculator'].includes(location.pathname) ? 'active' : ''}>
                    <span className="nav-icon"><img src="/assets/BottomNav/chassis-icon-3.png" alt="ChassisCal"/></span>
                    샤시견적
                </a>
                {/*<a href="#" className={location.pathname === '/community' ? 'active' : ''}><span className="nav-icon"><img src="/assets/BottomNav/community.png" alt="Community"/></span>커뮤니티</a>*/}
                <a href="/mypage"
                   className={location.pathname === '/mypage' ? 'active' : ''}>
                    <span className="nav-icon"><img src="/assets/BottomNav/my-info.png" alt="MyInfo"/></span>
                    마이
                </a>
            </nav>
        </>
    )
}

export default BottomNavigator;
