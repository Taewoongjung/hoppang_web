import React from 'react';
import './styles.css';

interface AppPromoModalProps {
    onClose: () => void;
    onOpenApp: () => void;
}

const AppPromoModal: React.FC<AppPromoModalProps> = ({ onClose, onOpenApp }) => {
    return (
        <div className="app-promo-overlay" onClick={onClose}>
            <div className="app-promo-container" onClick={(e) => e.stopPropagation()}>
                {/* 호빵 캐릭터와 말풍선 */}
                <div className="app-promo-character">
                    <div className="app-promo-bubble">
                        <div className="app-promo-bubble-content">
                            <span className="app-promo-bubble-text">앱에서 더 편하게 이용해요!</span>
                            <div className="app-promo-bubble-tail"></div>
                        </div>
                    </div>
                    <img
                        src="/assets/hoppang-character.png"
                        alt="호빵 캐릭터"
                        className="app-promo-character-img"
                    />
                </div>

                {/* 안내 컨텐츠 */}
                <div className="app-promo-content">
                    <div className="app-promo-header">
                        <h2 className="app-promo-title">📱 호빵 앱에서 보기</h2>
                        <p className="app-promo-subtitle">
                            앱에서 <strong>더 빠르고 편리하게</strong><br />
                            서비스를 이용해보세요
                        </p>
                    </div>

                    <div className="app-promo-benefits">
                        <div className="app-promo-benefit-item">
                            <div className="app-promo-benefit-icon">🚀</div>
                            <span>빠르고 편리한 견적 확인</span>
                        </div>
                        <div className="app-promo-benefit-item">
                            <div className="app-promo-benefit-icon">🔔</div>
                            <span>실시간 알림 받기</span>
                        </div>
                        <div className="app-promo-benefit-item">
                            <div className="app-promo-benefit-icon">💾</div>
                            <span>북마크 동기화</span>
                        </div>
                    </div>

                    <div className="app-promo-buttons">
                        <button
                            onClick={onOpenApp}
                            className="app-promo-primary-btn"
                        >
                            <span>앱으로 열기</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="app-promo-secondary-btn"
                        >
                            <span>웹에서 보기</span>
                        </button>
                    </div>

                    <div className="app-promo-note">
                        <p>💡 앱을 설치하면 더 많은 기능을 이용할 수 있어요!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppPromoModal;
