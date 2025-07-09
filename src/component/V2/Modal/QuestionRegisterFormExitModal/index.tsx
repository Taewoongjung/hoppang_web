import React from 'react';
import { useHistory } from 'react-router-dom';
import './styles.css';

const QuestionRegisterFormExitModal = (props:{
    from: any | null
    setShowExitModal: (f: boolean) => void
}) => {

    const { from, setShowExitModal } = props;

    const history = useHistory();

    const handleExitConfirm = () => {
        if (from === 'initial') {
            history.push('/chassis/v2/calculator');
            return;
        }

        history.push('/question/boards');
    };

    const handleExitCancel = () => {
        setShowExitModal(false);
    };


    return (
        <>
            <div className="modal-overlay">
                <div className="modal-container">
                    <div className="modal-content">
                        <div className="modal-icon">⚠️</div>
                        <h3 className="modal-title">질문하기를 종료하시겠어요?</h3>
                        <p className="modal-message">
                            지금까지 입력하신 정보가 모두 사라집니다.<br/>
                            정말 종료하시겠어요?
                        </p>
                        <div className="modal-actions">
                            <button
                                className="modal-button cancel"
                                onClick={handleExitCancel}
                            >
                                계속하기
                            </button>
                            <button
                                className="modal-button confirm"
                                onClick={handleExitConfirm}
                            >
                                종료하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default QuestionRegisterFormExitModal;
