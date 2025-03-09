import React from 'react';
import './styles.css';

const OverlayLoadingPage = (props:{word:string}) => {

    const {word} = props;

    return (
        <div className="loading-overlay">
            <img src="/assets/hoppang-character32x32.png" alt="Loading Icon" className="icon"/>
            <div className="loading-text">{word}<span className="dots"></span></div>
        </div>
    );
};

export default OverlayLoadingPage;
