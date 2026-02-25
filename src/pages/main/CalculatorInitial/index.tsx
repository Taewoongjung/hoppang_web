import React from 'react';
import { Helmet } from 'react-helmet-async';

import './styles.css';
import '../versatile-styles.css';
import {useHistory} from "react-router-dom";


const EstimateMethodSelection = () => {

    const history = useHistory();

    // 웹뷰 스와이프 백 제스처 처리
    React.useEffect(() => {
        const handlePopState = () => {
            history.replace('/');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [history]);

    const methods = [
        {
            id: 'simple',
            icon: '⚡',
            title: '간편견적',
            description: '평수와 구조만 선택하면\n자동으로 계산해드려요',
            time: '약 2분',
            bgColor: '#f0f9ff',
            iconColor: '#0284c7',
            route: '/calculator/simple/agreement'
        },
        {
            id: 'detailed',
            icon: '📏',
            title: '상세견적',
            description: '샷시 크기를 직접 입력해서\n정확한 견적을 받아요',
            time: '약 5분',
            bgColor: '#faf5ff',
            iconColor: '#a855f7',
            route: '/calculator/detail/agreement'
        }
    ];


    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, nofollow"/>
            </Helmet>
            <div className="estimate-method-container">
            {/* Header */}
            <header className="estimate-method-header">
                <button
                    className="back-button"
                    onClick={() => window.location.href = '/'}
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
                <h1 className="header-title">견적 방식 선택</h1>
                <div style={{ width: '24px' }}></div>
            </header>

            {/* Main Content */}
            <main className="estimate-method-content">
                <div className="intro-section">
                    <h2 className="intro-title">어떤 방식으로<br/>견적을 받으시겠어요?</h2>
                    <p className="intro-subtitle">상황에 맞는 방식을 선택해주세요</p>
                </div>

                <div className="methods-container">
                    {methods.map((method) => (
                        <div
                            key={method.id}
                            className="method-card"
                            onClick={() => window.location.href = method.route}
                        >
                            <div
                                className="method-icon-wrapper"
                                style={{ backgroundColor: method.bgColor }}
                            >
                                <span
                                    className="method-icon"
                                    style={{ color: method.iconColor }}
                                >
                                    {method.icon}
                                </span>
                            </div>

                            <div className="method-content">
                                <div className="method-header">
                                    <h3 className="method-title">{method.title}</h3>
                                    <div className="method-time">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        <span>{method.time}</span>
                                    </div>
                                </div>
                                <p className="method-description">{method.description}</p>
                            </div>

                            <div className="method-arrow">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M7.5 5L12.5 10L7.5 15"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="help-section">
                    <div className="help-box">
                        <span className="help-icon">💬</span>
                        <div className="help-text">
                            <p className="help-title">어떤 방식이 좋을지 모르시겠나요?</p>
                            <p className="help-description">
                                정확한 치수를 모르신다면 <strong>간편견적</strong>을 추천드려요
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </>
    );
};

export default EstimateMethodSelection;
