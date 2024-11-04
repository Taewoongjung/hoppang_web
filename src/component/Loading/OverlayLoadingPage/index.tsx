import React from 'react';
import './styles.css';

const OverlayLoadingPage = () => {
    return (
        <div className="loading-overlay">
            <img src="/assets/hoppang-character32x32.png" alt="Loading Icon" className="icon"/>
            <div className="loading-text">처리 중<span className="dots"></span></div>
        </div>
    );
};

export default OverlayLoadingPage;
