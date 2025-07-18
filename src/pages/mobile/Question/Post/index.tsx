import React, { useState, useEffect } from 'react';
import {useHistory, useParams} from 'react-router-dom';
import useSWR from "swr";
import {
    callBoardsPostsById,
    callBoardsPostsLike,
    callMeData, callPostsBookmark,
    callPostsReply,
    callPostsReplyLike
} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";
import axios from "axios";

import './styles.css';
import '../../versatile-styles.css';
import {formatTimeAgo} from "../../../../util";
import CommunityLoginModal from "../../../../component/V2/Modal/CommunityLoginRequiredModal";


interface PostDetail {
    id: number;
    boardName: string;
    registerName: string;
    registerId: string;
    title: string;
    contents: string;
    isAnonymous: string;
    createdAt: string;
    lastModified: string;
    viewCount: string;
    likeCount: string;
    didILiked: boolean;
    didIBookmarked: boolean;
    revised: boolean;
}

interface ChildReply {
    id: number;
    postId: number;
    rootReplyId: number;
    contents: string;
    registerId: string;
    registerName: string;
    anonymous: boolean;
    revised: boolean;
    createdAt: string;
    likes: number;
    isLiked: boolean;
}

interface Reply {
    id: number;
    postId: number;
    contents: string;
    registerId: string;
    registerName: string;
    anonymous: boolean;
    revised: boolean;
    createdAt: string;
    postsChildReplyList: ChildReply[];
    likes: number;
    isLiked: boolean;
    authorName: string;
}

// 삭제 확인 모달 컴포넌트
const DeleteConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="delete-modal">
                <div className="delete-modal-content">
                    <h3>댓글 삭제</h3>
                    <p>정말로 이 댓글을 삭제하시겠습니까?</p>
                    <div className="delete-modal-actions">
                        <button
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={isDeleting}
                        >
                            취소
                        </button>
                        <button
                            className={`delete-btn ${isDeleting ? 'deleting' : ''}`}
                            onClick={onConfirm}
                            disabled={isDeleting}
                            style={{
                                background: "#ef4444",
                                color: "white",
                                borderRadius: "6px"
                            }}
                        >
                            {isDeleting ? (
                                <>
                                    <span className="loading-spinner-small"></span>
                                    삭제 중...
                                </>
                            ) : (
                                '삭제'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PostDetail = () => {
    const { postId } = useParams<{ postId: string }>();
    const history = useHistory();
    const searchParams = new URLSearchParams(window.location.search);

    const [post, setPost] = useState<PostDetail | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // 게시글 수정 관련
    const [editingPost, setEditingPost] = useState(false);

    // 대댓글 관련 상태
    const [childReplyContent, setChildReplyContent] = useState<{[key: number]: string}>({});
    const [isSubmittingChildReply, setIsSubmittingChildReply] = useState<{[key: number]: boolean}>({});
    const [showChildReplyForm, setShowChildReplyForm] = useState<{[key: number]: boolean}>({});
    const [expandedReplies, setExpandedReplies] = useState<{[key: number]: boolean}>({});

    // 수정 관련 상태
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // 삭제 관련 상태
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 게시물 액션 상태
    const [postLiked, setPostLiked] = useState(false);
    const [postLikes, setPostLikes] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [replyOrderType, setReplyOrderType] = useState('');

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalStatus, setLoginModalStatus] = useState<'question' | 'reply' | 'like' | 'general' | ''>('');

    const { data: userData, error: userError, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const fetchReplies = async (queryParam:any) => {
        setReplies([]); // 변수에 데이터 초기화

        try {
            const apiCall = (queryParam:any) => {
                return new Promise((resolve) => {
                    axios.get(
                        callPostsReply.replace("{postId}", postId) + queryParam,
                        { withCredentials: true }
                    ).then((res) => {
                        const replies = res.data.postsReplyList || [];

                        const repliesResult: Reply[] = replies.map((reply: any) => ({
                            id: reply.id,
                            postId: reply.postId,
                            contents: reply.contents,
                            registerId: reply.registerId.toString(),
                            registerName: reply.registerName,
                            anonymous: reply.anonymous,
                            revised: reply.revised,
                            createdAt: reply.createdAt,
                            postsChildReplyList: reply.postsChildReplyList || [],
                            authorName: reply.registerName,
                            likes: reply.likes,
                            isLiked: reply.liked
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

            // 대댓글이 있는 경우 자동으로 확장
            const autoExpand: {[key: number]: boolean} = {};
            res.replies.forEach((reply: Reply) => {
                if (reply.postsChildReplyList && reply.postsChildReplyList.length > 0) {
                    autoExpand[reply.id] = true;
                }
            });
            setExpandedReplies(autoExpand);

        } catch (err) {
            console.error("댓글 조회 실패", err);
        }
    }

    // 포스팅 연관 댓글 조회
    useEffect(() => {
        if (!post) return;

        let queryParam = `?orderType=${replyOrderType}`;
        if (userData) {
            queryParam += `&loggedInUserId=${userData.id}`;
        }

        fetchReplies(queryParam);

    }, [userData, postId, post, replyOrderType]);

    // 포스팅 상세 조회
    useEffect(() => {
        let queryParam = '';
        if (searchParams.get('loggedInUserId')) {
            queryParam = "?loggedInUserId=" + searchParams.get('loggedInUserId');
        }

        if (userData && queryParam === '') {
            queryParam = "?loggedInUserId=" + userData.id;
        }

        axios.get(
            callBoardsPostsById.replace("{postId}", postId) + queryParam,
            {
                withCredentials: true,
            }
        ).then((res) => {

            const post = res.data;

            setLoading(false);
            setPostLikes(post.likeCount);
            setPostLiked(post.didILiked);
            setIsBookmarked(post.didIBookmarked);
            setPost(post);

        }).catch((err) => {
            setError(err);
        });
    }, [postId]);

    const handleLike = async (replyId: any, isLiked: boolean) => {
        if (!userData) {
            setShowLoginModal(true);
            setLoginModalStatus('like');
            return;
        }

        // 좋아요 처리 로직 - 루트 댓글과 대댓글 모두 처리
        setReplies(prev =>
            prev.map(reply => {
                // 루트 댓글 좋아요 처리
                if (reply.id === replyId) {
                    return {
                        ...reply,
                        isLiked: !reply.isLiked,
                        likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                    };
                }

                // 대댓글 좋아요 처리
                if (reply.postsChildReplyList && reply.postsChildReplyList.length > 0) {
                    const updatedChildReplies = reply.postsChildReplyList.map(childReply => {
                        if (childReply.id === replyId) {
                            return {
                                ...childReply,
                                isLiked: !childReply.isLiked,
                                likes: childReply.isLiked ? childReply.likes - 1 : childReply.likes + 1
                            };
                        }
                        return childReply;
                    });

                    // 대댓글이 변경된 경우에만 루트 댓글 업데이트
                    if (updatedChildReplies !== reply.postsChildReplyList) {
                        return {
                            ...reply,
                            postsChildReplyList: updatedChildReplies
                        };
                    }
                }

                return reply;
            })
        );

        if (isLiked) {
            // 좋아요 비활성화
            axios.delete(
                callPostsReplyLike.replace("{replyId}", replyId),
                {
                    withCredentials: true,
                    headers: {Authorization: localStorage.getItem("hoppang-token")},
                });
        } else {
            // 좋아요 활성화
            axios.patch(
                callPostsReplyLike.replace("{replyId}", replyId),{},
                {
                    withCredentials: true,
                    headers: {Authorization: localStorage.getItem("hoppang-token")},
                });
        }
    };

    // 게시물 수정 핸들러
    const handlePostEdit = () => {
        setEditingPost(true);
        history.push(`/question/boards/posts/register?revisingPostId=${postId}&from=postEdit`);
    }

    // 게시물 좋아요 핸들러
    const handlePostLike = async () => {
        if (!userData) {
            setShowLoginModal(true);
            setLoginModalStatus('like');
            return;
        }

        const prevLiked = postLiked;
        const nextLiked = !prevLiked;

        // 낙관적 업데이트
        setPostLiked(nextLiked);
        setPostLikes(prev => prev + (nextLiked ? 1 : -1));

        try {
            const apiUrl = callBoardsPostsLike.replace("{postId}", postId);

            if (nextLiked) {
                await axios.patch(apiUrl, {}, {
                    withCredentials: true,
                    headers: { Authorization: localStorage.getItem("hoppang-token") },
                });
            } else {
                await axios.delete(apiUrl, {
                    withCredentials: true,
                    headers: { Authorization: localStorage.getItem("hoppang-token") },
                });
            }

        } catch (error) {
            // 롤백
            setPostLiked(prevLiked);
            setPostLikes(prev => prev + (prevLiked ? 1 : -1));
        }
    };

    // 북마크 핸들러
    const handleBookmark = async () => {
        if (!userData) {
            setShowLoginModal(true);
            setLoginModalStatus('general');
            return;
        }

        const prevBookmared = isBookmarked;
        const nextBookmared = !isBookmarked;

        try {
            const apiUrl = callPostsBookmark.replace("{postId}", postId);

            if (nextBookmared) {
                axios.patch(apiUrl, {}, {
                    withCredentials: true,
                    headers: {Authorization: localStorage.getItem("hoppang-token")},
                });
            } else {
                axios.delete(apiUrl, {
                    withCredentials: true,
                    headers: {Authorization: localStorage.getItem("hoppang-token")},
                });
            }

            setIsBookmarked(nextBookmared);

        } catch (error) {
            // 롤백
            setIsBookmarked(prevBookmared);
        }
    };

    const handleSubmitReply = () => {
        if (!replyContent.trim()) return;
        if (!userData) {
            setShowLoginModal(true);
            setLoginModalStatus('reply');
        }

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

    // 대댓글 제출 핸들러
    const handleSubmitChildReply = async (parentReplyId: number) => {
        const content = childReplyContent[parentReplyId];
        if (!content?.trim()) return;
        if (isSubmittingChildReply[parentReplyId]) return;

        setIsSubmittingChildReply(prev => ({ ...prev, [parentReplyId]: true }));

        try {
            await mutate();

            const response = await axios.post(
                callPostsReply.replace("{postId}", postId),
                {
                    contents: content,
                    rootReplyId: parentReplyId
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: localStorage.getItem("hoppang-token"),
                    }
                }
            );

            // 댓글 목록 새로고침
            let currentUserId = userData.id;
            let queryParam = currentUserId ? `?loggedInUserId=${currentUserId}` : ``;
            await fetchReplies(queryParam);

            // 대댓글 입력 폼 초기화 및 숨기기
            setChildReplyContent(prev => ({ ...prev, [parentReplyId]: '' }));
            setShowChildReplyForm(prev => ({ ...prev, [parentReplyId]: false }));

            // 해당 댓글 확장
            setExpandedReplies(prev => ({ ...prev, [parentReplyId]: true }));

            // 새 대댓글로 스크롤
            const newReplyId = response.data.createdReplyId;
            setTimeout(() => {
                const target = document.getElementById(`child-reply-${newReplyId}`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

        } catch (error) {
            console.error('대댓글 등록 실패:', error);
        } finally {
            setIsSubmittingChildReply(prev => ({ ...prev, [parentReplyId]: false }));
        }
    };

    // 댓글 수정 시작
    const handleEditReply = (replyId: number, currentContent: string) => {
        setIsEditing(true);
        setEditingReplyId(replyId);
        setEditingContent(currentContent);
    };

    // 댓글 수정 취소
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingReplyId(null);
        setEditingContent('');
    };

    // 댓글 수정 제출
    const handleSubmitEdit = async (replyId: number) => {
        if (!editingContent.trim()) return;
        if (isSubmittingEdit) return;

        setIsSubmittingEdit(true);

        try {
            await axios.put(
                callPostsReply.replace("{postId}", postId) + `/${replyId}`,
                {
                    contents: editingContent
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: localStorage.getItem("hoppang-token"),
                    }
                }
            );

            // 댓글 목록 새로고침
            let currentUserId = userData.id;
            let queryParam = currentUserId ? `?loggedInUserId=${currentUserId}` : ``;
            await fetchReplies(queryParam);

            // 수정 모드 종료
            setIsEditing(false);
            setEditingReplyId(null);
            setEditingContent('');

        } catch (error) {
            console.error('댓글 수정 실패:', error);
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    // 댓글 삭제 시작
    const handleDeleteReply = (replyId: number) => {
        setDeletingReplyId(replyId);
        setShowDeleteModal(true);
    };

    // 댓글 삭제 확인
    const handleConfirmDelete = async () => {
        if (!deletingReplyId) return;

        setIsDeleting(true);

        try {
            await axios.delete(
                callPostsReply.replace("{postId}", postId) + `/${deletingReplyId}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: localStorage.getItem("hoppang-token"),
                    }
                }
            );

            // 댓글 목록 새로고침
            let currentUserId = userData.id;
            let queryParam = currentUserId ? `?loggedInUserId=${currentUserId}` : ``;
            await fetchReplies(queryParam);

            // 모달 닫기
            setShowDeleteModal(false);
            setDeletingReplyId(null);

        } catch (error) {
            console.error('댓글 삭제 실패:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // 모달 닫기
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingReplyId(null);
    };

    // 대댓글 폼 토글
    const toggleChildReplyForm = (replyId: number) => {
        setShowChildReplyForm(prev => ({
            ...prev,
            [replyId]: !prev[replyId]
        }));

        // 폼을 닫을 때 내용도 초기화
        if (showChildReplyForm[replyId]) {
            setChildReplyContent(prev => ({ ...prev, [replyId]: '' }));
        }
    };

    // 대댓글 목록 토글
    const toggleChildReplies = (replyId: number) => {
        setExpandedReplies(prev => ({
            ...prev,
            [replyId]: !prev[replyId]
        }));
    };

    // 총 댓글 수 계산 (댓글 + 대댓글)
    const getTotalReplyCount = () => {
        return replies.reduce((total, reply) => {
            return total + 1 + (reply.postsChildReplyList?.length || 0);
        }, 0);
    };

    // 댓글 작성자 확인
    const canEditReply = (reply: Reply | ChildReply) => {
        return userData && (userData.id.toString() === reply.registerId || userData.id === reply.registerId);
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

    if (error || !post) {
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
                        onClick={() => window.location.href = "/question/boards"}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="header-title">질문 상세</div>
                    <div className="header-actions">
                        <button className="share-btn">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path
                                    d="M15 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                                    stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M7.5 10.5L12.5 7.5M7.5 10.5L12.5 16.5" stroke="currentColor"
                                      strokeWidth="1.5"/>
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
                                    {post.boardName}
                                </span>
                                <span className="question-time">
                                    {formatTimeAgo(post.createdAt)}
                                </span>
                            </div>

                            {/*북마크*/}
                            <button
                                className={`post-bookmark-btn ${isBookmarked ? 'active' : ''}`}
                                onClick={handleBookmark}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 2v12l5-3 5 3V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          fill={isBookmarked ? 'currentColor' : 'none'}/>
                                </svg>
                                <span>북마크</span>
                            </button>
                        </div>

                        <h1 className="question-title">
                            {post.title.split('\n').map((line, index) => (
                                <p key={index} style={{wordBreak: 'break-word'}}>{line}</p>
                            ))}
                        </h1>

                        <div className="question-content">
                            {post.contents.split('\n').map((line, index) => (
                                <p key={index} style={{wordBreak: 'break-word'}}>{line}</p>
                            ))}
                        </div>

                        <div className="view-count">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"
                                      fill="none"/>
                                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            </svg>
                            <span>조회 {post.viewCount}</span>
                        </div>

                        {replies.length === 0 &&
                            <div className="reply-actions-menu">
                                <button
                                    className="edit-btn"
                                    onClick={() => handlePostEdit()}
                                >
                                    편집
                                </button>
                                <button
                                    className="delete-btn"
                                    // onClick={() => handleDeleteReply(reply.id)}
                                >
                                    삭제
                                </button>
                            </div>
                        }

                        <div className="question-footer">
                            <div className="question-author">
                                <div className="author-avatar">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a4 4 0 0 1 8 0v2H6v-2Z"
                                              stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                </div>
                                <div className="author-info">
                                    <span className="author-name">
                                        {post.isAnonymous === 'T' ? '익명' : post.registerName}
                                    </span>
                                    <span className="author-role">작성자</span>
                                </div>
                            </div>

                            <div className="question-actions">
                                <button
                                    className={`post-like-btn ${postLiked ? 'active' : ''}`}
                                    onClick={handlePostLike}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path
                                            d="M8 14s-4-2.5-6-5.5a3.5 3.5 0 0 1 7-3.5 3.5 3.5 0 0 1 7 3.5C16 11.5 8 14 8 14Z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            fill={postLiked ? 'currentColor' : 'none'}/>
                                    </svg>
                                    <span>추천</span>
                                    <span className="count">{postLikes}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Replies Section */}
                <section id="replies-section" className="replies-section">
                    <div className="replies-header">
                        <h2 className="replies-title">
                            답변 <span className="replies-count">{getTotalReplyCount()}</span>
                        </h2>
                        <div className="replies-sort">
                            <button
                                className={`sort-btn ${replyOrderType === '' ? 'active' : ''}`}
                                onClick={() => {
                                    setLoading(true);
                                    setTimeout(() => {
                                        setLoading(false);
                                        setReplyOrderType('')
                                    }, 150);
                                }}
                            >
                                최신순
                            </button>

                            <button
                                className={`sort-btn ${replyOrderType === 'LIKE_DESC' ? 'active' : ''}`}
                                onClick={() => {
                                    setLoading(true);
                                    setTimeout(() => {
                                        setReplyOrderType('LIKE_DESC')
                                        setLoading(false);
                                    }, 150);
                                }}
                            >
                                추천순
                            </button>
                        </div>
                    </div>

                    <div className="replies-list">
                        {replies.map((reply) => (
                            <div key={reply.id} className="reply-thread">
                                {/* 메인 댓글 */}
                                <div id={`reply-${reply.id}`} className="reply-card">
                                    <div className="reply-header">
                                        <div className="reply-author">
                                            <div className="reply-avatar">
                                                {reply.registerId === post.registerId.toString() ? (
                                                    <div className="owner-badge">
                                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                                            <path
                                                                d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a4 4 0 0 1 8 0v2H6v-2Z"
                                                                stroke="currentColor" strokeWidth="1.5"/>
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path
                                                            d="M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 13a3 3 0 0 1 6 0v1H5v-1Z"
                                                            stroke="currentColor" strokeWidth="1.5"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="author-info">
                                                <span className="author-name">{reply.authorName}</span>
                                            </div>
                                        </div>
                                        <div className="reply-meta">
                                            <div className="reply-time">
                                                {formatTimeAgo(reply.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 수정 모드 */}
                                    {editingReplyId === reply.id ? (
                                        <div className="edit-reply-form">
                                            <textarea
                                                className="edit-textarea"
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                rows={4}
                                                maxLength={1000}
                                            />
                                            <div className="edit-actions">
                                                <div className="char-count-small">
                                                    {editingContent.length}/1000
                                                </div>
                                                <div className="edit-buttons">
                                                    <button
                                                        className="cancel-edit-btn"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        취소
                                                    </button>
                                                    <button
                                                        className={`submit-edit-btn ${isSubmittingEdit ? 'submitting' : ''}`}
                                                        onClick={() => handleSubmitEdit(reply.id)}
                                                        disabled={!editingContent.trim() || isSubmittingEdit}
                                                    >
                                                        {isSubmittingEdit ? (
                                                            <>
                                                                <span className="loading-spinner-small"></span>
                                                                수정 중...
                                                            </>
                                                        ) : (
                                                            '수정 완료'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="reply-content">
                                            {reply.contents.split('\n').map((line, index) => (
                                                <p key={index} style={{wordBreak: 'break-word'}}>
                                                    {line}

                                                    &nbsp;

                                                    {reply.revised && (
                                                        <span className="edited-indicator">[편집됨]</span>
                                                    )}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {(canEditReply(reply) && !isEditing) && (
                                        <div className="reply-actions-menu">
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEditReply(reply.id, reply.contents)}
                                            >
                                                편집
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteReply(reply.id)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}

                                    <div className="reply-actions">
                                        <button
                                            className={`like-btn ${reply.isLiked ? 'liked' : ''}`}
                                            onClick={() => handleLike(reply.id, reply.isLiked)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path
                                                    d="M8 14s-4-2.5-6-5.5a3.5 3.5 0 0 1 7-3.5 3.5 3.5 0 0 1 7 3.5C16 11.5 8 14 8 14Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    fill={reply.isLiked ? 'currentColor' : 'none'}/>
                                            </svg>
                                            <span>{reply.likes}</span>
                                        </button>
                                        <button
                                            className={`reply-btn ${showChildReplyForm[reply.id] ? 'active' : ''}`}
                                            onClick={() => toggleChildReplyForm(reply.id)}
                                        >
                                            <span>⮑ 답글</span>
                                        </button>

                                        {/* 대댓글 수 및 토글 버튼 */}
                                        {reply.postsChildReplyList && reply.postsChildReplyList.length > 0 && (
                                            <button
                                                className="child-replies-toggle"
                                                onClick={() => toggleChildReplies(reply.id)}
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    className={expandedReplies[reply.id] ? 'rotated' : ''}
                                                >
                                                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                                                          strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span>답글 {reply.postsChildReplyList.length}개</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 대댓글 입력 폼 */}
                                {showChildReplyForm[reply.id] && (
                                    <div className="child-reply-form">
                                        <div className="child-reply-form-content">
                                            <div className="child-reply-avatar">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path
                                                        d="M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 13a3 3 0 0 1 6 0v1H5v-1Z"
                                                        stroke="currentColor" strokeWidth="1.5"/>
                                                </svg>
                                            </div>
                                            <div className="child-reply-input-container">
                                                <textarea
                                                    className="child-reply-textarea"
                                                    placeholder={`${reply.authorName}님에게 답글 작성...`}
                                                    value={childReplyContent[reply.id] || ''}
                                                    onChange={(e) => setChildReplyContent(prev => ({
                                                        ...prev,
                                                        [reply.id]: e.target.value
                                                    }))}
                                                    rows={3}
                                                    maxLength={500}
                                                />
                                                <div className="child-reply-actions">
                                                    <div className="char-count-small">
                                                        {(childReplyContent[reply.id] || '').length}/500
                                                    </div>
                                                    <div className="child-reply-buttons">
                                                        <button
                                                            className="cancel-child-reply-btn"
                                                            onClick={() => toggleChildReplyForm(reply.id)}
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            className={`submit-child-reply-btn ${isSubmittingChildReply[reply.id] ? 'submitting' : ''}`}
                                                            onClick={() => handleSubmitChildReply(reply.id)}
                                                            disabled={!childReplyContent[reply.id]?.trim() || isSubmittingChildReply[reply.id]}
                                                        >
                                                            {isSubmittingChildReply[reply.id] ? (
                                                                <>
                                                                    <span className="loading-spinner-small"></span>
                                                                    등록 중...
                                                                </>
                                                            ) : (
                                                                '답글 등록'
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 대댓글 목록 */}
                                {expandedReplies[reply.id] && reply.postsChildReplyList && reply.postsChildReplyList.length > 0 && (
                                    <div className="child-replies-container">
                                        {reply.postsChildReplyList.map((childReply) => (
                                            <div key={childReply.id} id={`child-reply-${childReply.id}`}
                                                 className="child-reply-card">
                                                <div className="child-reply-connector">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M5 5v6a4 4 0 0 0 4 4h6" stroke="currentColor"
                                                              strokeWidth="1.5" strokeLinecap="round"
                                                              strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                                <div className="child-reply-content-wrapper">
                                                    <div className="child-reply-header">
                                                        <div className="child-reply-author">
                                                            <div className="child-reply-avatar">
                                                                {childReply.registerId.toString() === post.registerId.toString() ? (
                                                                    <div className="owner-badge-small">
                                                                        <svg width="12" height="12" viewBox="0 0 20 20"
                                                                             fill="none">
                                                                            <path
                                                                                d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a4 4 0 0 1 8 0v2H6v-2Z"
                                                                                stroke="currentColor"
                                                                                strokeWidth="1.5"/>
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <svg width="12" height="12" viewBox="0 0 16 16"
                                                                         fill="none">
                                                                        <path
                                                                            d="M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 13a3 3 0 0 1 6 0v1H5v-1Z"
                                                                            stroke="currentColor" strokeWidth="1.5"/>
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="child-reply-author-info">
                                                                <span
                                                                    className="child-reply-author-name">{childReply.registerName}</span>
                                                            </div>
                                                        </div>
                                                        <div className="child-reply-meta">
                                                            <span className="child-reply-time">
                                                                {formatTimeAgo(childReply.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* 대댓글 수정 모드 */}
                                                    {editingReplyId === childReply.id ? (
                                                        <div className="edit-reply-form">
                                                            <textarea
                                                                className="edit-textarea"
                                                                value={editingContent}
                                                                onChange={(e) => setEditingContent(e.target.value)}
                                                                rows={3}
                                                                maxLength={500}
                                                            />
                                                            <div className="edit-actions">
                                                                <div className="char-count-small">
                                                                    {editingContent.length}/500
                                                                </div>
                                                                <div className="edit-buttons">
                                                                    <button
                                                                        className="cancel-edit-btn"
                                                                        onClick={handleCancelEdit}
                                                                    >
                                                                        취소
                                                                    </button>
                                                                    <button
                                                                        className={`submit-edit-btn ${isSubmittingEdit ? 'submitting' : ''}`}
                                                                        onClick={() => handleSubmitEdit(childReply.id)}
                                                                        disabled={!editingContent.trim() || isSubmittingEdit}
                                                                    >
                                                                        {isSubmittingEdit ? (
                                                                            <>
                                                                                <span
                                                                                    className="loading-spinner-small"></span>
                                                                                수정 중...
                                                                            </>
                                                                        ) : (
                                                                            '수정 완료'
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="child-reply-text">
                                                            {childReply.contents.split('\n').map((line, index) => (
                                                                <p key={index} style={{wordBreak: 'break-word'}}>
                                                                    {line}

                                                                    &nbsp;

                                                                    {childReply.revised && (
                                                                        <span className="edited-indicator">[편집됨]</span>
                                                                    )}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="child-reply-actions">
                                                        <button
                                                            className={`like-btn ${childReply.isLiked ? 'liked' : ''}`}
                                                            onClick={() => handleLike(childReply.id, childReply.isLiked)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                <path
                                                                    d="M8 14s-4-2.5-6-5.5a3.5 3.5 0 0 1 7-3.5 3.5 3.5 0 0 1 7 3.5C16 11.5 8 14 8 14Z"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.5"
                                                                    fill={childReply.isLiked ? 'currentColor' : 'none'}/>
                                                            </svg>
                                                            <span>{childReply.likes || 0}</span>
                                                        </button>

                                                        {(canEditReply(childReply) && !isEditing) && (
                                                            <div className="child-reply-actions-menu">
                                                                <button
                                                                    className="edit-btn"
                                                                    onClick={() => handleEditReply(childReply.id, childReply.contents)}
                                                                >
                                                                    편집
                                                                </button>
                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() => handleDeleteReply(childReply.id)}
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                            <path d="M15 1L1 8l4 2 2 4 8-13Z" stroke="currentColor" strokeWidth="1.5"
                                                  strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        답변 등록
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* 삭제 확인 모달 */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />

            {showLoginModal && <CommunityLoginModal setShowLoginModal={setShowLoginModal} action={loginModalStatus}/>}
        </div>
    );
};

export default PostDetail;
