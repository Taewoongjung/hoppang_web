import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import useSWR from "swr";
import {callBoardsPostsById, callMeData} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";
import axios from "axios";

import './styles.css';
import '../../versatile-styles.css';
import {formatTimeAgo} from "../../../../util";

interface QuestionDetail {
    id: number;
    boardName: string;
    registerName: string;
    title: string;
    contents: string;
    isAnonymous: string;
    createdAt: string;
    lastModified: string;
}

interface Answer {
    id: number;
    content: string;
    authorName: string;
    isExpert: boolean;
    createdAt: string;
    likes: number;
    isLiked: boolean;
}

const QuestionDetail = () => {
    const history = useHistory();

    const { postId } = useParams<{ postId: string }>();

    const [question, setQuestion] = useState<QuestionDetail | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [answerContent, setAnswerContent] = useState('');
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

    const { data: userData, error: userError } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    // 더미 데이터 - 실제로는 API에서 가져올 데이터
    const mockQuestion: QuestionDetail = {
        id: 1,
        boardName: "견적문의",
        registerName: "홍길동",
        title: "아파트 거실 이중창 설치 비용이 얼마나 드나요?",
        contents: "30평대 아파트 거실에 이중창을 설치하려고 하는데, 대략적인 비용이 궁금합니다. 현재 단창으로 되어있고, 크기는 가로 3미터, 세로 2미터 정도입니다.\n\n겨울에 추위도 많이 들어오고 결로 현상도 심해서 이중창 설치를 고려하고 있습니다. 품질 좋은 제품으로 설치하면 대략 어느 정도 비용이 들까요?\n\n또한 공사 기간은 얼마나 걸리는지도 궁금합니다. 주말에만 공사가 가능한데 가능한지요?",
        isAnonymous: "F",
        createdAt: "2025-07-07T22:17:35.351371",
        lastModified: "2025-07-07T22:38:45.407974"
    };

    const mockAnswers: Answer[] = [
        {
            id: 1,
            content: "30평대 아파트 거실 이중창 설치 비용은 평균적으로 100~150만원 정도 소요됩니다. 크기가 가로 3미터, 세로 2미터라면 약 6㎡ 정도의 면적이므로 중간 정도의 비용이 예상됩니다.\n\n품질에 따라 가격이 달라지는데:\n- 일반형: 80~120만원\n- 고급형: 120~180만원\n- 프리미엄: 180~250만원\n\n공사 기간은 보통 1~2일 정도이며, 주말 시공도 가능합니다. 다만 소음 발생으로 인해 아파트 관리사무소와 사전 협의가 필요합니다.",
            authorName: "김샷시",
            isExpert: true,
            createdAt: "2025-07-07T23:30:15.123456",
            likes: 12,
            isLiked: false
        },
        {
            id: 2,
            content: "저도 비슷한 상황에서 이중창 설치했는데, 140만원 정도 들었어요. 브랜드는 KCC창호로 했습니다. 결로 현상이 정말 많이 개선되었고, 방음 효과도 좋아졌습니다.\n\n주말 시공 가능하지만 추가 비용이 있을 수 있으니 미리 문의해보세요.",
            authorName: "경험자123",
            isExpert: false,
            createdAt: "2025-07-08T08:15:42.789012",
            likes: 5,
            isLiked: true
        }
    ];

    useEffect(() => {
        // 실제로는 API 호출
        axios.get(
            callBoardsPostsById.replace("{postId}", postId),
            {
                withCredentials: true,
            }
        ).then((res) => {
            setQuestion(res.data);
            setLoading(false);
        })

        // 더미 데이터로 시뮬레이션
        // setTimeout(() => {
            // setQuestion(mockQuestion);
            setAnswers(mockAnswers);
        // }, 1000);
    }, [postId]);

    // const formatDate = (dateString: string) => {
    //     const date = new Date(dateString);
    //     const now = new Date();
    //     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    //
    //     if (diffInHours < 1) return '방금 전';
    //     if (diffInHours < 24) return `${diffInHours}시간 전`;
    //     if (diffInHours < 48) return '어제';
    //     if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
    //
    //     return date.toLocaleDateString('ko-KR', {
    //         year: 'numeric',
    //         month: 'long',
    //         day: 'numeric'
    //     });
    // };

    const handleLike = async (answerId: number) => {
        // 좋아요 처리 로직
        setAnswers(prev =>
            prev.map(answer =>
                answer.id === answerId
                    ? {
                        ...answer,
                        isLiked: !answer.isLiked,
                        likes: answer.isLiked ? answer.likes - 1 : answer.likes + 1
                    }
                    : answer
            )
        );
    };

    const handleSubmitAnswer = async () => {
        if (!answerContent.trim()) return;
        if (isSubmittingAnswer) return;

        setIsSubmittingAnswer(true);

        try {
            // 더미 응답 추가
            const newAnswer: Answer = {
                id: answers.length + 1,
                content: answerContent,
                authorName: userData?.name || "익명",
                isExpert: false,
                createdAt: new Date().toISOString(),
                likes: 0,
                isLiked: false
            };

            setAnswers(prev => [...prev, newAnswer]);
            setAnswerContent('');

            // 답변 영역으로 스크롤
            setTimeout(() => {
                const answersSection = document.getElementById('answers-section');
                if (answersSection) {
                    answersSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);

        } catch (error) {
            console.error('답변 등록 실패:', error);
        } finally {
            setIsSubmittingAnswer(false);
        }
    };

    if (loading) {
        return (
            <div className="question-detail-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>질문을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error || !question) {
        return (
            <div className="question-detail-container">
                <div className="error-container">
                    <div className="error-icon">😞</div>
                    <h3>질문을 불러올 수 없습니다</h3>
                    <p>잠시 후 다시 시도해주세요</p>
                    <button onClick={() => window.location.reload()}>다시 시도</button>
                </div>
            </div>
        );
    }

    return (
        <div className="question-detail-container">
            {/* Header */}
            <header className="detail-header">
                <div className="header-content">
                    <button
                        className="back-btn"
                        onClick={() => history.push("/question/boards")}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="header-title">질문 상세</div>
                    <div className="header-actions">
                        <button className="share-btn">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M7.5 10.5L12.5 7.5M7.5 10.5L12.5 16.5" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="detail-main">
                {/* Question Section */}
                <section className="question-section">
                    <div className="question-card">
                        <div className="question-header">
                            <div className="question-meta">
                                <span className="category-badge">
                                    {question.boardName}
                                </span>
                                <span className="question-time">
                                    {formatTimeAgo(question.createdAt)}
                                </span>
                            </div>
                        </div>

                        <h1 className="question-title">{question.title}</h1>

                        <div className="question-content">
                            {question.contents.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>

                        <div className="question-footer">
                            <div className="question-author">
                                <div className="author-avatar">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a4 4 0 0 1 8 0v2H6v-2Z" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                </div>
                                <div className="author-info">
                                    <span className="author-name">
                                        {question.isAnonymous === 'T' ? '익명' : question.registerName}
                                    </span>
                                    <span className="author-role">질문자</span>
                                </div>
                            </div>

                            <div className="question-actions">
                                <div className="search-count">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1v6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                    <span>조회 24</span>
                                </div>
                                <button className="action-btn">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1l2.5 5L16 6.5l-4 4 1 5.5L8 13l-5 3 1-5.5-4-4L5.5 6 8 1Z" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                    <span>북마크</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Answers Section */}
                <section id="answers-section" className="answers-section">
                    <div className="answers-header">
                        <h2 className="answers-title">
                            답변 <span className="answers-count">{answers.length}</span>
                        </h2>
                        <div className="answers-sort">
                            <button className="sort-btn active">최신순</button>
                            <button className="sort-btn">추천순</button>
                        </div>
                    </div>

                    <div className="answers-list">
                        {answers.map((answer) => (
                            <div key={answer.id} className="answer-card">
                                <div className="answer-header">
                                    <div className="answer-author">
                                        <div className="author-avatar">
                                            {answer.isExpert ? (
                                                <div className="expert-badge">
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M8 1l2 4 4.5.5-3.5 3 1 4.5L8 11l-4 2 1-4.5-3.5-3L6 5l2-4Z" fill="currentColor"/>
                                                    </svg>
                                                </div>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 13a3 3 0 0 1 6 0v1H5v-1Z" stroke="currentColor" strokeWidth="1.5"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="author-info">
                                            <span className="author-name">{answer.authorName}</span>
                                            <span className="author-role">
                                                {answer.isExpert ? '전문가' : '일반사용자'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="answer-time">
                                        {formatTimeAgo(answer.createdAt)}
                                    </div>
                                </div>

                                <div className="answer-content">
                                    {answer.content.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>

                                <div className="answer-actions">
                                    <button
                                        className={`like-btn ${answer.isLiked ? 'liked' : ''}`}
                                        onClick={() => handleLike(answer.id)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 14s-4-2.5-6-5.5a3.5 3.5 0 0 1 7-3.5 3.5 3.5 0 0 1 7 3.5C16 11.5 8 14 8 14Z"
                                                  stroke="currentColor"
                                                  strokeWidth="1.5"
                                                  fill={answer.isLiked ? 'currentColor' : 'none'}/>
                                        </svg>
                                        <span>{answer.likes}</span>
                                    </button>
                                    <button className="reply-btn">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>답글</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {answers.length === 0 && (
                        <div className="no-answers">
                            <div className="no-answers-icon">💭</div>
                            <h3>아직 답변이 없습니다</h3>
                            <p>첫 번째 답변을 남겨주세요!</p>
                        </div>
                    )}
                </section>

                {/* Answer Form */}
                <section className="answer-form-section">
                    <div className="answer-form-card">
                        <div className="form-header">
                            <h3>답변 작성</h3>
                            <span className="form-subtitle">도움이 되는 답변을 작성해주세요</span>
                        </div>

                        <div className="form-content">
                            <textarea
                                className="answer-textarea"
                                placeholder="전문적이고 도움이 되는 답변을 작성해주세요.&#10;&#10;• 구체적인 정보와 경험을 바탕으로 답변해주세요&#10;• 정확한 정보를 제공해주세요&#10;• 친절하고 이해하기 쉽게 설명해주세요"
                                value={answerContent}
                                onChange={(e) => setAnswerContent(e.target.value)}
                                rows={6}
                                maxLength={1000}
                            />
                            <div className="char-count">
                                {answerContent.length}/1000
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                className={`submit-answer-btn ${isSubmittingAnswer ? 'submitting' : ''}`}
                                onClick={handleSubmitAnswer}
                                disabled={!answerContent.trim() || isSubmittingAnswer}
                            >
                                {isSubmittingAnswer ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        답변 등록 중...
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M15 1L1 8l4 2 2 4 8-13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        답변 등록
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default QuestionDetail;
