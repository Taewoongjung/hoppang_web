import React from 'react';

const BottomNavigator = () => {

    return (
        <>
            <nav>
                <a href="#"><span className="nav-icon"><img src="/assets/BottomNav/home.png" alt="Home"/></span>홈</a>
                <a href="/chassis/calculator"><span className="nav-icon"><img src="/assets/BottomNav/chassis-icon-3.png" alt="ChassisCal"/></span>샤시견적</a>
                <a href="#"><span className="nav-icon"><img src="/assets/BottomNav/community.png" alt="Community"/></span>커뮤니티</a>
                <a href="/login"><span className="nav-icon"><img src="/assets/BottomNav/my-info.png" alt="MyInfo"/></span>마이</a>
            </nav>
        </>
    )
}

export default BottomNavigator;
