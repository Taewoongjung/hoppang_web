import React from 'react';
import './styles.css';

interface LaborFeeAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LaborFeeAlertModal: React.FC<LaborFeeAlertModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="labor-fee-modal-overlay" onClick={onClose}>
            <div className="labor-fee-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* 모달 헤더 */}
                <div className="labor-fee-modal-header">
                    <div className="labor-fee-modal-icon">
                        ⚠️
                    </div>
                    <h3 className="labor-fee-modal-title">
                        기본 시공비 안내
                    </h3>
                </div>

                {/* 모달 내용 */}
                <div className="labor-fee-modal-content">
                    <div className="labor-fee-alert-message">
                        <p className="labor-fee-main-text">
                            선택하신 창호 크기가 최소 시공 기준보다 작아
                        </p>
                        <p className="labor-fee-highlight-text">
                            기본 시공비가 추가로 발생했습니다.
                        </p>
                    </div>

                    {/* 설명 박스 */}
                    <div className="labor-fee-explanation-box">
                        <div className="labor-fee-question">
                            <span className="labor-fee-q-mark">Q.</span>
                            <span className="labor-fee-q-text">왜 작은 창호는 기본 시공비가 붙나요?</span>
                        </div>

                        <div className="labor-fee-answer">
                            <p>일반적으로 시공에는 최소 인건비가 존재합니다.</p>
                            <p>택배도 일정 금액 이상부터 무료배송이 되는 것처럼, 창호도 일정 크기 이상이면 시공비가 포함되지만, 그보다 작을 경우 정책상 정해진 시공비 기준에 미치지 않아 추가 시공비가 발생할 수 있습니다.</p>
                        </div>
                    </div>

                    {/* 호빵 캐릭터 포인트 */}
                    <div className="labor-fee-hobang-tip">
                        <div className="labor-fee-hobang-character">
                            <img
                                src="/assets/hoppang-character.png"
                                alt="Hoppang Logo"
                                className="header-logo-img"
                                style={{ width: '35px', height: '35px' }}
                            />
                        </div>
                        <span className="labor-fee-hobang-text">
                            호빵이 미리 알려드려요!
                        </span>
                    </div>
                </div>

                {/* 모달 푸터 */}
                <div className="labor-fee-modal-footer">
                    <button
                        className="labor-fee-confirm-button"
                        onClick={onClose}
                    >
                        <span className="labor-fee-button-icon">✓</span>
                        확인했어요
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LaborFeeAlertModal;
