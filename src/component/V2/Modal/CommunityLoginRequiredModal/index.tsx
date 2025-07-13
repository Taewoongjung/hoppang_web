import React from 'react';
import { useHistory } from 'react-router-dom';
import './styles.css';

const CommunityLoginModal = (props: {
    setShowLoginModal: (f: boolean) => void
    action?: 'question' | 'reply' | 'like' | 'general' | '' // 어떤 액션으로 모달이 뜨는지
}) => {

    const { setShowLoginModal, action = 'general' } = props;
    const history = useHistory();

    const handleLoginConfirm = () => {
        history.push('/v2/login');
    };

    const handleLoginCancel = () => {
        setShowLoginModal(false);
    };

    const getActionText = () => {
        switch (action) {
            case 'question':
                return {
                    title: '질문하려면 로그인이 필요해요!',
                    description: '질문을 등록하고 전문가의 답변을 받아보세요'
                };
            case 'reply':
                return {
                    title: '댓글을 남기려면 로그인해주세요!',
                    description: '다른 사람들과 소통하고 정보를 공유해보세요'
                };
            case 'like':
                return {
                    title: '추천하려면 로그인해주세요!',
                    description: '유용한 정보에 추천을 눌러 다른 사람들과 공유해보세요'
                };
            default:
                return {
                    title: '로그인하고 더 많은 기능을 이용하세요!',
                    description: '커뮤니티의 모든 기능을 자유롭게 사용할 수 있어요'
                };
        }
    };

    const actionText = getActionText();

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-container">
                    <div className="modal-content">
                        <div className="modal-icon">🔐</div>
                        <h3 className="modal-title">{actionText.title}</h3>

                        <div className="modal-info-section">
                            <div className="info-card">
                                <div className="info-icon">🎯</div>
                                <div className="info-text">
                                    <div className="info-title">로그인하면 이런 게 좋아요</div>
                                    <div className="info-description">
                                        {actionText.description}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="login-benefits">
                            <div className="benefit-item">
                                <div className="benefit-icon">✏️</div>
                                <div className="benefit-text">
                                    <div className="benefit-title">질문 등록</div>
                                    <div className="benefit-desc">샷시 전문가에게 직접 질문</div>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">💬</div>
                                <div className="benefit-text">
                                    <div className="benefit-title">댓글 & 소통</div>
                                    <div className="benefit-desc">다른 사용자들과 정보 공유</div>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">👍</div>
                                <div className="benefit-text">
                                    <div className="benefit-title">추천 & 저장</div>
                                    <div className="benefit-desc">유용한 정보 추천하고 저장</div>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">📱</div>
                                <div className="benefit-text">
                                    <div className="benefit-title">내 활동 관리</div>
                                    <div className="benefit-desc">질문과 댓글 기록 확인</div>
                                </div>
                            </div>
                        </div>

                        <p className="modal-message">
                            간편하게 로그인하고<br/>
                            <span className="highlight-text">커뮤니티의 모든 기능을 이용해보세요</span>
                        </p>

                        <div className="modal-actions">
                            <button
                                className="modal-button secondary"
                                onClick={handleLoginConfirm}
                            >
                                🚀 로그인하기
                            </button>
                            <button
                                className="modal-button cancel"
                                onClick={handleLoginCancel}
                            >
                                나중에 할게요
                            </button>
                        </div>

                        <div className="modal-footer">
                            <div className="footer-text">
                                💡 로그인은 <strong>카카오톡</strong>으로 간편하게 할 수 있어요
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CommunityLoginModal;
