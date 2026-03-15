import React, { useState, useEffect } from 'react';
import './styles.css';

interface AppPromoModalProps {
    onClose: () => void;
    onOpenApp: () => void;
}

const AppPromoModal: React.FC<AppPromoModalProps> = ({ onClose, onOpenApp }) => {
    return (
        <div className="app-promo-overlay" onClick={onClose}>
            <div className="app-promo-modal" onClick={(e) => e.stopPropagation()}>
                <div className="app-promo-header">
                    <div className="app-promo-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <rect width="40" height="40" x="4" y="4" rx="8" fill="#6366f1"/>
                            <path d="M24 16L28 24L24 32" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h3 className="app-promo-title">호빵 앱에서 보기</h3>
                    <p className="app-promo-description">
                        더 빠르고 편리한 앱을 이용해보세요
                    </p>
                </div>

                <div className="app-promo-features">
                    <div className="app-promo-feature">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2L12 6L16 7L13 11L14 16L10 13L6 16L7 11L4 7L8 6L10 2Z" fill="#6366f1"/>
                        </svg>
                        <span>빠른 견적</span>
                    </div>
                    <div className="app-promo-feature">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" fill="#10b981"/>
                        </svg>
                        <span>푸시 알림</span>
                    </div>
                    <div className="app-promo-feature">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M16.5 3.5C16.5 4.88071 15.4407 5.93934 14 5.93934C12.5593 5.93934 11.5 4.88071 11.5 3.5C11.5 2.11929 12.5593 1 14 1C15.4407 1 16.5 2.11929 16.5 3.5Z" fill="#f59e0b"/>
                        </svg>
                        <span>북마크 동기화</span>
                    </div>
                </div>

                <div className="app-promo-actions">
                    <button className="app-promo-btn secondary" onClick={onClose}>
                        웹에서 보기
                    </button>
                    <button className="app-promo-btn primary" onClick={onOpenApp}>
                        앱으로 열기
                    </button>
                </div>

                <button className="app-promo-close" onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default AppPromoModal;
