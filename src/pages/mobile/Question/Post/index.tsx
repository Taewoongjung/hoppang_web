import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import useSWR from "swr";
import {callBoardsPostsById, callMeData, callPostsReply} from "../../../../definition/apiPath";
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

interface Reply {
    id: number;
    contents: string;
    authorName: string;
    isPostOwner: boolean;
    createdAt: string;
    likes: number;
    isLiked: boolean;
}

const PostDetail = () => {
    const history = useHistory();

    const { postId } = useParams<{ postId: string }>();

    const [question, setQuestion] = useState<QuestionDetail | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const { data: userData, error: userError, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const fetchReplies = async (queryParam:any) => {
        try {
            const apiCall = (queryParam:any) => {
                return new Promise((resolve) => {
                    axios.get(
                        callPostsReply.replace("{postId}", postId) + queryParam,
                        { withCredentials: true }
                    ).then((res) => {
                        const replies = res.data.postReplyList || [];

                        const repliesResult: Reply[] = replies.map((reply: any) => ({
                            id: reply.id,
                            contents: reply.contents,
                            authorName: reply.registerName,
                            isPostOwner: reply.isOwner,
                            createdAt: reply.createdAt,
                            likes: 0, // 백엔드 응답에 없으므로 기본값
                            isLiked: false // 마찬가지로 기본값 설정
                        }));

                        resolve({
                            replies: repliesResult
                        })
                    }).catch((err) => {
                        setError(err);
                    });
                })
            }

            const res: any = await apiCall(queryParam);
            setReplies(res.replies);

        } catch (err) {
            console.error("댓글 조회 실패", err);
        }
    }

    // 포스팅 연관 댓글 조회
    useEffect(() => {
        if (!userData) return;

        let currentUserId = userData.id;
        let queryParam = currentUserId ? `?loggedInUserId=${currentUserId}` : ``;

        fetchReplies(queryParam);

    }, [userData, postId]);

    // 포스팅 상세 조회
    useEffect(() => {
        axios.get(
            callBoardsPostsById.replace("{postId}", postId),
            {
                withCredentials: true,
            }
        ).then((res) => {
            setQuestion(res.data);
            setLoading(false);
        }).catch((err) => {
            setError(err);
        });
    }, [postId]);

    const handleLike = async (answerId: number) => {
        // 좋아요 처리 로직
        setReplies(prev =>
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

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        if (isSubmittingReply) return;

        setIsSubmittingReply(true);

        try {
            mutate()
                .then(() => {
                    axios.post(
                        callPostsReply.replace("{postId}", postId),
                        {
                            contents: replyContent,
                            rootReplyId: null
                        },
                        {
                            withCredentials: true,
                            headers: {
                                Authorization: localStorage.getItem("hoppang-token"),
                            }
                        }
                    ).then((res) => {
                        let currentUserId = userData.id;
                        let queryParam = currentUserId ? `?loggedInUserId=${currentUserId}` : ``;

                        fetchReplies(queryParam);

                        const newReplyId = res.data.createdReplyId;
                        setTimeout(() => {
                            const target = document.getElementById(`reply-${newReplyId}`);
                            if (target) {
                                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    });
            })
                .catch(() => {
                    console.error("댓글을 달기 위해서는 로그인 해주세요.");
                });

            setReplyContent('');

            // 답변 영역으로 스크롤
            setTimeout(() => {
                const answersSection = document.getElementById('replies-section');
                if (answersSection) {
                    answersSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);

        } catch (error) {
            console.error('답변 등록 실패:', error);
        } finally {
            setIsSubmittingReply(false);
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

                        <h1 className="question-title">
                            {question.title.split('\n').map((line, index) => (
                                <p key={index} style={{ wordBreak: 'break-word' }}>{line}</p>
                            ))}
                        </h1>

                        <div className="question-content">
                            {question.contents.split('\n').map((line, index) => (
                                <p key={index} style={{ wordBreak: 'break-word' }}>{line}</p>
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
                                    <span className="author-role">작성자</span>
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

                {/* Replies Section */}
                <section id="replies-section" className="replies-section">
                    <div className="replies-header">
                        <h2 className="replies-title">
                            답변 <span className="replies-count">{replies.length}</span>
                        </h2>
                        <div className="replies-sort">
                            <button className="sort-btn active">최신순</button>
                            <button className="sort-btn">추천순</button>
                        </div>
                    </div>

                    <div className="replies-list">
                        {replies.map((reply) => (
                            <div key={reply.id} id={`reply-${reply.id}`} className="reply-card">
                                <div className="reply-header">
                                    <div className="reply-author">
                                        <div className="reply-avatar">
                                            {reply.isPostOwner ? (
                                                <div className="owner-badge">
                                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                                        <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a4 4 0 0 1 8 0v2H6v-2Z" stroke="currentColor" strokeWidth="1.5"/>
                                                    </svg>
                                                </div>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 13a3 3 0 0 1 6 0v1H5v-1Z" stroke="currentColor" strokeWidth="1.5"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="author-info">
                                            <span className="author-name">{reply.authorName}</span>
                                            <span className="author-role">
                                                {reply.isPostOwner ? '작성자' : '일반사용자'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="reply-time">
                                        {formatTimeAgo(reply.createdAt)}
                                    </div>
                                </div>

                                <div className="reply-content">
                                    {reply.contents.split('\n').map((line, index) => (
                                        <p key={index} style={{ wordBreak: 'break-word' }}>{line}</p>
                                    ))}
                                </div>

                                <div className="reply-actions">
                                    <button
                                        className={`like-btn ${reply.isLiked ? 'liked' : ''}`}
                                        onClick={() => handleLike(reply.id)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 14s-4-2.5-6-5.5a3.5 3.5 0 0 1 7-3.5 3.5 3.5 0 0 1 7 3.5C16 11.5 8 14 8 14Z"
                                                  stroke="currentColor"
                                                  strokeWidth="1.5"
                                                  fill={reply.isLiked ? 'currentColor' : 'none'}/>
                                        </svg>
                                        <span>{reply.likes}</span>
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

                    {replies.length === 0 && (
                        <div className="no-replies">
                            <div className="no-replies-icon">💭</div>
                            <h3>아직 답변이 없습니다</h3>
                            <p>첫 번째 답변을 남겨주세요!</p>
                        </div>
                    )}
                </section>

                {/* Reply Form */}
                <section className="reply-form-section">
                    <div className="reply-form-card">
                        <div className="form-header">
                            <h3>답변 작성</h3>
                            <span className="form-subtitle">도움이 되는 답변을 작성해주세요</span>
                        </div>

                        <div className="form-content">
                            <textarea
                                className="reply-textarea"
                                placeholder="전문적이고 도움이 되는 답변을 작성해주세요.&#10;&#10;• 구체적인 정보와 경험을 바탕으로 답변해주세요&#10;• 정확한 정보를 제공해주세요&#10;• 친절하고 이해하기 쉽게 설명해주세요"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows={6}
                                maxLength={1000}
                            />
                            <div className="char-count">
                                {replyContent.length}/1000
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                className={`submit-reply-btn ${isSubmittingReply ? 'submitting' : ''}`}
                                onClick={handleSubmitReply}
                                disabled={!replyContent.trim() || isSubmittingReply}
                            >
                                {isSubmittingReply ? (
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

export default PostDetail;
