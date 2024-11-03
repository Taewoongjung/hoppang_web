import React from 'react';
import './styles.css';

const LoadingPage = () => {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>로딩 중입니다...</p>
        </div>
    );
};

export default LoadingPage;
