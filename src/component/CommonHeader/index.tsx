import React from 'react';
import './styles.css';

interface CommonHeaderProps {
    title: string;
    onBack?: () => void;
    rightElement?: React.ReactNode;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ title, onBack, rightElement }) => {
    return (
        <header className="simple-estimate-header">
            <button
                className="back-button"
                onClick={onBack}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            <h1 className="header-title">{title}</h1>
            {rightElement ? rightElement : <div style={{ width: '24px' }} />}
        </header>
    );
};

export default CommonHeader;
