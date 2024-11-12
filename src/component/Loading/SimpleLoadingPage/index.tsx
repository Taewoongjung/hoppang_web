import React from 'react';
import './styles.css';

const LoadingPage = (props:{statement:string}) => {

    const {statement} = props;

    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            { statement ? <>{statement}...</> : <p>처리 중입니다...</p>}
        </div>
    );
};

export default LoadingPage;
