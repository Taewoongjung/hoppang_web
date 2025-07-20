import React from 'react';
import { useHistory } from 'react-router-dom';
import './styles.css';

const CalculationResultExitModal = (props:{
    setShowExitModal: (f: boolean) => void
}) => {

    const {setShowExitModal} = props;

    const history = useHistory();

    const handleExitConfirm = () => {
        history.push('/chassis/calculator');
    };

    const handleExitCancel = () => {
        setShowExitModal(false);
    };

    const handleGoToHistory = () => {
        history.push('/v2/mypage/estimation/histories');
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-container">
                    <div className="modal-content">
                        <div className="modal-icon">💾</div>
                        <h3 className="modal-title">견적 결과를 저장했어요!</h3>

                        <div className="modal-info-section">
                            <div className="info-card">
                                <div className="info-icon">📋</div>
                                <div className="info-text">
                                    <div className="info-title">견적 결과 확인 방법</div>
                                    <div className="info-description">
                                        마이페이지 → 견적 이력에서<br />
                                        언제든지 다시 확인하실 수 있어요
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="modal-message">
                            이 화면을 닫으시겠어요?<br/>
                            <span className="highlight-text">견적 결과는 안전하게 저장됩니다</span>
                        </p>

                        <div className="modal-actions">
                            <button
                                className="modal-button cancel"
                                onClick={handleExitCancel}
                            >
                                계속 보기
                            </button>
                            <button
                                className="modal-button secondary"
                                onClick={handleGoToHistory}
                            >
                                견적 이력 보기
                            </button>
                            <button
                                className="modal-button confirm"
                                onClick={handleExitConfirm}
                            >
                                홈으로 가기
                            </button>
                        </div>

                        <div className="modal-footer">
                            <div className="footer-text">
                                💡 저장된 견적은 <strong>마이 → 견적 이력</strong>에서 확인하세요
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CalculationResultExitModal;
