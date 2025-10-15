import React, { useState, useEffect, useCallback } from 'react';

import './styles.css';

import { useHistory, useParams } from 'react-router-dom';
import useSWR from "swr";
import {
    callBoardsPostsById,
    callBoardsPostsLike,
    callMeData,
    callPostsBookmark,
    callPostsReply,
    callPostsReplyLike
} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";
import axios from "axios";
import {formatTimeAgo, formatUserName} from "../../../../util/boardUtil";
import CommunityLoginModal from "../../../../component/V2/Modal/CommunityLoginRequiredModal";
import { EnhancedGoToTopButton } from 'src/util/renderUtil';
import { Helmet } from 'react-helmet-async';
import {handleShare} from "../../Guide/util";


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
    deleted: boolean;
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
    deleted: boolean;
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
    deleted: boolean;
    createdAt: string;
    postsChildReplyList: ChildReply[];
    likes: number;
    isLiked: boolean;
    authorName: string;
}

type LoginModalStatus = 'question' | 'reply' | 'like' | 'general' | '';

// 삭제 확인 모달 컴포넌트들
const DeleteConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="delete-modal">
                <div className="delete-modal-content">
                    <h3>{title}</h3>
                    <p>{message}</p>
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

// 삭제된 댓글 컴포넌트
const DeletedReplyContent: React.FC<{
    reply: Reply;
    expandedReplies: { [key: number]: boolean };
    onToggleChildReplies: (replyId: number) => void;
}> = ({ reply, expandedReplies, onToggleChildReplies }) => (
    <div className="deleted-reply-content">
        <div className="deleted-reply-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 2h10l-1 12H4L3 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 6v4M9 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        </div>
        <div>
            <div className="deleted-reply-text">삭제된 댓글입니다</div>
            <div className="deleted-reply-subtext">작성자에 의해 삭제되었습니다</div>
        </div>

        {/* 대댓글이 있는 경우 정보 표시 */}
        {reply.postsChildReplyList && reply.postsChildReplyList.length > 0 && (
            <div className="deleted-reply-meta">
                <div className="deleted-reply-child-count">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 3v5a3 3 0 0 0 3 3h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>답글 {reply.postsChildReplyList.length}개</span>
                </div>

                <button
                    className="deleted-reply-toggle"
                    onClick={() => onToggleChildReplies(reply.id)}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={expandedReplies[reply.id] ? 'rotated' : ''}
                    >
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{expandedReplies[reply.id] ? '답글 숨기기' : '답글 보기'}</span>
                </button>
            </div>
        )}
    </div>
);

// 삭제된 대댓글 컴포넌트
const DeletedChildReplyContent: React.FC = () => (
    <div className="deleted-child-reply-content">
        <div className="deleted-child-reply-icon">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 2h10l-1 12H4L3 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 6v4M9 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        </div>
        <div className="deleted-child-reply-text">삭제된 답글입니다</div>
    </div>
);

const PostDetail = () => {
    const { postId } = useParams<{ postId: string }>();
    const history = useHistory();
    const searchParams = new URLSearchParams(window.location.search);

    // 기본 상태
    const [post, setPost] = useState<PostDetail | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [replyOrderType, setReplyOrderType] = useState('');

    // 댓글 작성 관련
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [childReplyContent, setChildReplyContent] = useState<{[key: number]: string}>({});
    const [isSubmittingChildReply, setIsSubmittingChildReply] = useState<{[key: number]: boolean}>({});
    const [showChildReplyForm, setShowChildReplyForm] = useState<{[key: number]: boolean}>({});

    // 댓글 수정 관련
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

    // 삭제 관련
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalType, setDeleteModalType] = useState<'post' | 'reply'>('reply');

    // UI 상태
    const [expandedReplies, setExpandedReplies] = useState<{[key: number]: boolean}>({});
    const [postLiked, setPostLiked] = useState(false);
    const [postLikes, setPostLikes] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // 로그인 모달
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalStatus, setLoginModalStatus] = useState<LoginModalStatus>('');

    // SWR 사용자 데이터
    const { data: userData, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    // 댓글 조회 함수
    const fetchReplies = useCallback(async (queryParam: string) => {
        try {
            const response = await axios.get(
                callPostsReply.replace("{postId}", postId) + queryParam,
                { withCredentials: true }
            );

            const replies = response.data.postsReplyList || [];
            const repliesResult: Reply[] = replies.map((reply: any) => ({
                id: reply.id,
                postId: reply.postId,
                contents: reply.contents,
                registerId: reply.registerId.toString(),
                registerName: reply.registerName,
                anonymous: reply.anonymous,
                revised: reply.revised,
                deleted: reply.deleted,
                createdAt: reply.createdAt,
                postsChildReplyList: reply.postsChildReplyList || [],
                authorName: reply.registerName,
                likes: reply.likes,
                isLiked: reply.liked
            }));

            setReplies(repliesResult);

            // 대댓글이 있는 경우 자동으로 확장
            const autoExpand: {[key: number]: boolean} = {};
            repliesResult.forEach((reply: Reply) => {
                if (reply.postsChildReplyList && reply.postsChildReplyList.length > 0) {
                    autoExpand[reply.id] = true;
                }
            });
            setExpandedReplies(autoExpand);

        } catch (err) {
            console.error("댓글 조회 실패", err);
            setError('댓글을 불러오는데 실패했습니다.');
        }
    }, [postId]);

    // 게시물 상세 조회
    useEffect(() => {
        const fetchPost = async () => {
            try {
                let queryParam = '';
                if (searchParams.get('loggedInUserId')) {
                    queryParam = "?loggedInUserId=" + searchParams.get('loggedInUserId');
                } else if (userData) {
                    queryParam = "?loggedInUserId=" + userData.id;
                }

                const response = await axios.get(
                    callBoardsPostsById.replace("{postId}", postId) + queryParam,
                    { withCredentials: true }
                );

                const postData = response.data;
                setPost(postData);
                setPostLikes(postData.likeCount);
                setPostLiked(postData.didILiked);
                setIsBookmarked(postData.didIBookmarked);
                setLoading(false);

            } catch (err) {
                console.error("게시물 조회 실패", err);
                setError('게시물을 불러오는데 실패했습니다.');
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId, userData]);

    // 댓글 조회 (게시물 로드 후)
    useEffect(() => {
        if (!post) return;

        let queryParam = `?orderType=${replyOrderType}`;
        if (userData) {
            queryParam += `&loggedInUserId=${userData.id}`;
        }

        fetchReplies(queryParam);
    }, [post, userData, replyOrderType, fetchReplies]);

    // 로그인 체크 헬퍼
    const requireLogin = (action: LoginModalStatus) => {
        if (!userData) {
            setShowLoginModal(true);
            setLoginModalStatus(action);
            return false;
        }
        return true;
    };

    // 권한 체크 헬퍼
    const canEditReply = (reply: Reply | ChildReply) => {
        return userData && (userData.id.toString() === reply.registerId || userData.id === reply.registerId);
    };

    const canEditPost = () => {
        return userData && post && (userData.id.toString() === post.registerId || userData.id === post.registerId);
    };

    // 좋아요 핸들러
    const handleLike = useCallback(async (replyId: any, isLiked: boolean) => {
        if (!requireLogin('like')) return;

        // 낙관적 업데이트
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

        try {
            const apiUrl = callPostsReplyLike.replace("{replyId}", replyId);
            if (isLiked) {
                await axios.delete(apiUrl, {
                    withCredentials: true,
                    headers: { Authorization: localStorage.getItem("hoppang-token") },
                });
            } else {
                await axios.patch(apiUrl, {}, {
                    withCredentials: true,
                    headers: { Authorization: localStorage.getItem("hoppang-token") },
                });
            }
        } catch (error) {
            console.error('좋아요 처리 실패:', error);
            // 롤백 (실제로는 다시 fetchReplies 호출하는 것이 안전)
        }
    }, [userData]);

    // 게시물 액션 핸들러들
    const handlePostEdit = () => {
        if (!canEditPost()) return;
        history.push(`/question/boards/posts/register?revisingPostId=${postId}&from=postEdit`);
    };

    const handlePostLike = async () => {
        if (!requireLogin('like')) return;

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
            console.error('게시물 좋아요 실패:', error);
            // 롤백
            setPostLiked(prevLiked);
            setPostLikes(prev => prev + (prevLiked ? 1 : -1));
        }
    };

    const handleBookmark = async () => {
        if (!requireLogin('general')) return;

        const prevBookmarked = isBookmarked;
        setIsBookmarked(!prevBookmarked);

        try {
            const apiUrl = callPostsBookmark.replace("{postId}", postId);
            if (!prevBookmarked) {
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
            console.error('북마크 처리 실패:', error);
            setIsBookmarked(prevBookmarked);
        }
    };

    // 댓글 제출 핸들러
    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        if (!requireLogin('reply')) return;

        setIsSubmittingReply(true);

        try {
            await mutate();
            const response = await axios.post(
                callPostsReply.replace("{postId}", postId),
                {
                    contents: replyContent,
                    rootReplyId: null
                },
                {
                    withCredentials: true,
                    headers: { Authorization: localStorage.getItem("hoppang-token") },
                }
            );

            setReplyContent('');

            // 댓글 목록 새로고침
            let queryParam = userData ? `?loggedInUserId=${userData.id}` : '';
            await fetchReplies(queryParam);

            // 새 댓글로 스크롤
            const newReplyId = response.data.createdReplyId;
            setTimeout(() => {
                const target = document.getElementById(`reply-${newReplyId}`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

        } catch (error) {
            console.error('댓글 등록 실패:', error);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // 대댓글 제출 핸들러
    const handleSubmitChildReply = async (parentReplyId: number) => {
        const content = childReplyContent[parentReplyId];
        if (!content?.trim() || isSubmittingChildReply[parentReplyId]) return;
        if (!requireLogin('reply')) return;

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
                    headers: { Authorization: localStorage.getItem("hoppang-token") },
                }
            );

            // 입력 폼 초기화
            setChildReplyContent(prev => ({ ...prev, [parentReplyId]: '' }));
            setShowChildReplyForm(prev => ({ ...prev, [parentReplyId]: false }));

            // 댓글 목록 새로고침
            let queryParam = userData ? `?loggedInUserId=${userData.id}` : '';
            await fetchReplies(queryParam);

            // 해당 댓글 확장 및 스크롤
            setExpandedReplies(prev => ({ ...prev, [parentReplyId]: true }));
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

    // 댓글 수정 핸들러들
    const handleEditReply = (replyId: number, currentContent: string) => {
        setEditingReplyId(replyId);
        setEditingContent(currentContent);
    };

    const handleCancelEdit = () => {
        setEditingReplyId(null);
        setEditingContent('');
    };

    const handleSubmitEdit = async (replyId: number) => {
        if (!editingContent.trim() || isSubmittingEdit) return;

        setIsSubmittingEdit(true);

        try {
            await axios.put(
                callPostsReply.replace("{postId}", postId) + `/${replyId}`,
                { contents: editingContent },
                {
                    withCredentials: true,
                    headers: { Authorization: localStorage.getItem("hoppang-token") },
                }
            );

            // 수정 모드 종료
            setEditingReplyId(null);
            setEditingContent('');

            // 댓글 목록 새로고침
            let queryParam = userData ? `?loggedInUserId=${userData.id}` : '';
            await fetchReplies(queryParam);

        } catch (error) {
            console.error('댓글 수정 실패:', error);
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    // 삭제 핸들러들
    const handleDeletePost = () => {
        if (!canEditPost()) return;
        setDeleteModalType('post');
        setDeletingReplyId(parseInt(postId));
        setShowDeleteModal(true);
    };

    const handleDeleteReply = (replyId: number) => {
        setDeleteModalType('reply');
        setDeletingReplyId(replyId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingReplyId) return;

        setIsDeleting(true);

        try {
            if (deleteModalType === 'post') {
                await axios.delete(
                    callBoardsPostsById.replace("{postId}", postId),
                    {
                        withCredentials: true,
                        headers: { Authorization: localStorage.getItem("hoppang-token") },
                    }
                );
                // 게시물 목록으로 이동
                window.location.href = "/question/boards";
            } else {
                await axios.delete(
                    callPostsReply.replace("{postId}", postId) + `/${deletingReplyId}`,
                    {
                        withCredentials: true,
                        headers: { Authorization: localStorage.getItem("hoppang-token") },
                    }
                );

                // 댓글 목록 새로고침
                let queryParam = userData ? `?loggedInUserId=${userData.id}` : '';
                await fetchReplies(queryParam);
            }

            setShowDeleteModal(false);
            setDeletingReplyId(null);

        } catch (error) {
            console.error('삭제 실패:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // UI 토글 헬퍼들
    const toggleChildReplyForm = (replyId: number) => {
        setShowChildReplyForm(prev => ({
            ...prev,
            [replyId]: !prev[replyId]
        }));

        if (showChildReplyForm[replyId]) {
            setChildReplyContent(prev => ({ ...prev, [replyId]: '' }));
        }
    };

    const toggleChildReplies = (replyId: number) => {
        setExpandedReplies(prev => ({
            ...prev,
            [replyId]: !prev[replyId]
        }));
    };

    const getTotalReplyCount = () => {
        return replies.reduce((total, reply) => {
            return total + 1 + (reply.postsChildReplyList?.length || 0);
        }, 0);
    };

    const handleGoBack = () => {
        if (searchParams.get('from') && searchParams.get('from') === 'myPosts') {
            window.location.href = "/question/my/boards";
            return;
        }

        window.location.href = "/question/boards";
    }

    const handleGoToList = () => {
        if (searchParams.get('from') && searchParams.get('from') === 'myPosts') {
            window.location.href = "/question/my/boards";
            return;
        }
        window.location.href = "/question/boards";
    };


    // 로딩 및 에러 상태 처리
    if (loading) {
        return (
            <div className="question-detail-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>게시물을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="question-detail-container">
                <div className="error-container">
                    <div className="error-icon">😞</div>
                    <h3>게시물을 불러올 수 없습니다</h3>
                    <p>{error || '잠시 후 다시 시도해주세요'}</p>
                    <button onClick={() => window.location.reload()}>다시 시도</button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* SEO 메타 태그 */}
            <Helmet>
                <title>{post ? `${post.title} - 호빵 커뮤니티` : '창호 커뮤니티 호빵'}</title>
                <meta name="description" content={post ? post.contents.replace(/<[^>]*>/g, '').substring(0, 160) : '호빵 커뮤니티 게시물'} />

                {/* Open Graph 태그 (카카오톡, 페이스북 등 공유시) */}
                <meta property="og:title" content={post?.title || '호빵 커뮤니티'} />
                <meta property="og:description" content={post ? post.contents.replace(/<[^>]*>/g, '').substring(0, 160) : ''} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={window.location.href} />

                {/* Twitter 카드 */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={post?.title || '호빵 커뮤니티'} />
                <meta name="twitter:description" content={post ? post.contents.replace(/<[^>]*>/g, '').substring(0, 160) : ''} />

                {/* 추가 메타 정보 */}
                {post && <meta name="author" content={post.isAnonymous === 'T' ? '익명' : post.registerName} />}
                {post && <meta name="keywords" content={`${post.boardName}, 호빵, 커뮤니티, 질문`} />}
            </Helmet>

            <div className="question-detail-container">
                {/* Header */}
                <header className="detail-header">
                    <div className="header-content">
                        <button
                            className="back-btn"
                            onClick={handleGoBack}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <div className="header-title">게시물 상세</div>
                        <div className="header-actions">
                            <button className="share-btn" onClick={handleShare}>
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
                        <div className={`question-card ${post.deleted ? 'deleted' : ''}`}>
                            {post.deleted ? (
                                <div className="deleted-reply-content">
                                    <div className="deleted-reply-icon">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M3 2h10l-1 12H4L3 2Z" stroke="currentColor" strokeWidth="1.5"
                                                  strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M7 6v4M9 6v4" stroke="currentColor" strokeWidth="1.5"
                                                  strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="deleted-reply-text">삭제된 게시물입니다</div>
                                        <div className="deleted-reply-subtext">작성자에 의해 삭제되었습니다</div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="question-header">
                                        <div className="question-meta">
                                            <span className="category-badge">{post.boardName}</span>
                                            <span className="question-time">{formatTimeAgo(post.createdAt)}</span>
                                        </div>
                                        <button
                                            className={`post-bookmark-btn ${isBookmarked ? 'active' : ''}`}
                                            onClick={handleBookmark}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M3 2v12l5-3 5 3V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z"
                                                      stroke="currentColor" strokeWidth="1.5"
                                                      fill={isBookmarked ? 'currentColor' : 'none'}/>
                                            </svg>
                                            <span>북마크</span>
                                        </button>
                                    </div>

                                    <h1 className="question-title">
                                        {post.title.split('\n').map((line, index) => (
                                            <p
                                                key={index}
                                                style={{
                                                    wordBreak: 'break-word',
                                                    margin: '8px 0',
                                                    borderBottom: '1px solid #eee',
                                                    paddingBottom: '4px',
                                                }}
                                            >
                                                {line}
                                            </p>
                                        ))}
                                    </h1>

                                    <div
                                        className="question-content"
                                        style={{
                                            wordBreak: 'break-word',
                                            marginTop: '10px',
                                            marginBottom: '15px',
                                        }}
                                        dangerouslySetInnerHTML={{__html: post.contents}}
                                    />

                                    <div className="view-count">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor"
                                                  strokeWidth="1.5" fill="none"/>
                                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"
                                                    fill="none"/>
                                        </svg>
                                        <span>조회 {post.viewCount}</span>
                                    </div>

                                    {/* 댓글이 없고 작성자인 경우에만 편집/삭제 버튼 표시 */}
                                    {replies.length === 0 && canEditPost() && (
                                        <div className="reply-actions-menu">
                                        <button className="edit-btn" onClick={handlePostEdit}>
                                                편집
                                            </button>
                                            <button className="delete-btn" onClick={handleDeletePost}>
                                                삭제
                                            </button>
                                        </div>
                                    )}

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
                                                    {post.isAnonymous === 'T' ? '익명' : formatUserName(post.registerName)}
                                                </span>
                                                <span className="author-role">작성자</span>
                                            </div>
                                        </div>

                                        <div className="question-actions">
                                            <button
                                                className={`post-like-btn ${postLiked ? 'active' : ''}`}
                                                onClick={handlePostLike}
                                            >
                                                <svg width="18" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path
                                                        d="M8 14s-4-2.5-6-5.5a3.5 3.5 0 0 1 7-3.5 3.5 3.5 0 0 1 7 3.5C16 11.5 8 14 8 14Z"
                                                        stroke="currentColor" strokeWidth="1.5"
                                                        fill={postLiked ? 'currentColor' : 'none'}/>
                                                </svg>
                                                <span>추천</span>
                                                <span className="count">{postLikes}</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Replies Section */}
                    <section id="replies-section" className="replies-section">
                        {replies.length > 0 && (
                            <div className="replies-header">
                                <h2 className="replies-title">
                                    댓글 <span className="replies-count">{getTotalReplyCount()}</span>
                                </h2>
                                <div className="replies-sort">
                                    <button
                                        className={`sort-btn ${replyOrderType === '' ? 'active' : ''}`}
                                        onClick={() => setReplyOrderType('')}
                                    >
                                        최신순
                                    </button>
                                    <button
                                        className={`sort-btn ${replyOrderType === 'LIKE_DESC' ? 'active' : ''}`}
                                        onClick={() => setReplyOrderType('LIKE_DESC')}
                                    >
                                        추천순
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="replies-list">
                            {replies.map((reply) => (
                                <div key={reply.id} className="reply-thread">
                                    {/* 메인 댓글 */}
                                    <div id={`reply-${reply.id}`}
                                         className={`reply-card ${reply.deleted ? 'deleted' : ''}`}>
                                        {reply.deleted ? (
                                            <DeletedReplyContent
                                                reply={reply}
                                                expandedReplies={expandedReplies}
                                                onToggleChildReplies={toggleChildReplies}
                                            />
                                        ) : (
                                            <>
                                                <div className="reply-header">
                                                    <div className="reply-author">
                                                        <div className="reply-avatar">
                                                            {reply.registerId.toString() === post.registerId.toString() ? (
                                                                <div className="owner-badge">
                                                                    <svg width="16" height="16" viewBox="0 0 20 20"
                                                                         fill="none">
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
                                                            <span className="author-name">
                                                                {
                                                                    post.isAnonymous === 'T' && reply.registerId.toString() === post.registerId.toString() ?
                                                                        '익명' : formatUserName(reply.authorName)
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="reply-meta">
                                                        <div className="reply-time">{formatTimeAgo(reply.createdAt)}</div>
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
                                                            <div className="char-count-small">{editingContent.length}/1000
                                                            </div>
                                                            <div className="edit-buttons">
                                                                <button className="cancel-edit-btn"
                                                                        onClick={handleCancelEdit}>
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
                                                                    ) : '수정 완료'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="reply-content">
                                                        {reply.contents.split('\n').map((line, index) => (
                                                            <p key={index} style={{wordBreak: 'break-word'}}>
                                                                {line}
                                                            </p>
                                                        ))}
                                                        {reply.revised && <span className="edited-indicator">[편집됨]</span>}
                                                    </div>
                                                )}

                                                {/* 편집/삭제 버튼 */}
                                                {canEditReply(reply) && editingReplyId !== reply.id && (
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
                                                        <svg width="19" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path
                                                                d="M8 14s-4-2.5-6-5.5a3.5 3.5 0 0 1 7-3.5 3.5 3.5 0 0 1 7 3.5C16 11.5 8 14 8 14Z"
                                                                stroke="currentColor" strokeWidth="1.5"
                                                                fill={reply.isLiked ? 'currentColor' : 'none'}/>
                                                        </svg>
                                                        <span>{reply.likes}</span>
                                                    </button>
                                                    <button
                                                        className={`reply-btn ${showChildReplyForm[reply.id] ? 'active' : ''}`}
                                                        onClick={() => toggleChildReplyForm(reply.id)}
                                                    >
                                                        <span style={{
                                                            display: 'inline-block',
                                                            transform: 'rotate(180deg)',
                                                            marginRight: '4px'
                                                        }}>
                                                            ↩
                                                        </span>
                                                        <span>대댓글</span>
                                                    </button>

                                                    {/* 대댓글 토글 버튼 */}
                                                    {reply.postsChildReplyList && reply.postsChildReplyList.length > 0 && (
                                                        <button
                                                            className="child-replies-toggle"
                                                            onClick={() => toggleChildReplies(reply.id)}
                                                        >
                                                            <svg
                                                                width="16" height="16" viewBox="0 0 16 16" fill="none"
                                                                className={expandedReplies[reply.id] ? 'rotated' : ''}
                                                            >
                                                                <path d="M6 4l4 4-4 4" stroke="currentColor"
                                                                      strokeWidth="1.5"
                                                                      strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <span>댓글 {reply.postsChildReplyList.length}개</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* 대댓글 입력 폼 */}
                                    {showChildReplyForm[reply.id] && !reply.deleted && (
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
                                                        placeholder={`${reply.authorName}님에게 댓글 작성...`}
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
                                                                ) : '댓글 등록'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 대댓글 목록 */}
                                    {expandedReplies[reply.id] && reply.postsChildReplyList && reply.postsChildReplyList.length > 0 && (
                                        <div
                                            className={reply.deleted ? "deleted-reply-children" : "child-replies-container"}>
                                            {reply.postsChildReplyList.map((childReply) => (
                                                <div key={childReply.id} id={`child-reply-${childReply.id}`}
                                                     className={`child-reply-card ${childReply.deleted ? 'deleted' : ''}`}>

                                                    {childReply.deleted ? (
                                                        <DeletedChildReplyContent/>
                                                    ) : (
                                                        <>
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
                                                                            {childReply.registerId === post.registerId ? (
                                                                                <div className="owner-badge-small">
                                                                                    <svg width="12" height="12"
                                                                                         viewBox="0 0 20 20" fill="none">
                                                                                        <path
                                                                                            d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a4 4 0 0 1 8 0v2H6v-2Z"
                                                                                            stroke="currentColor"
                                                                                            strokeWidth="1.5"/>
                                                                                    </svg>
                                                                                </div>
                                                                            ) : (
                                                                                <svg width="12" height="12"
                                                                                     viewBox="0 0 16 16" fill="none">
                                                                                    <path
                                                                                        d="M8 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 13a3 3 0 0 1 6 0v1H5v-1Z"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"/>
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <div className="child-reply-author-info">
                                                                            <span
                                                                                className="child-reply-author-name">{
                                                                                post.isAnonymous === 'T' && childReply.registerId.toString() === post.registerId.toString() ?
                                                                                    '익명' : formatUserName(childReply.registerName)
                                                                            }</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="child-reply-meta">
                                                                        <span
                                                                            className="child-reply-time">{formatTimeAgo(childReply.createdAt)}</span>
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
                                                                            <div
                                                                                className="char-count-small">{editingContent.length}/500
                                                                            </div>
                                                                            <div className="edit-buttons">
                                                                                <button className="cancel-edit-btn"
                                                                                        onClick={handleCancelEdit}>
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
                                                                                    ) : '수정 완료'}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="child-reply-text">
                                                                        {childReply.contents.split('\n').map((line, index) => (
                                                                            <p key={index}
                                                                               style={{wordBreak: 'break-word'}}>
                                                                                {line}
                                                                            </p>
                                                                        ))}
                                                                        {childReply.revised &&
                                                                            <span className="edited-indicator">[편집됨]</span>}
                                                                    </div>
                                                                )}

                                                                <div className="child-reply-actions">
                                                                    <button
                                                                        className={`like-btn ${childReply.isLiked ? 'liked' : ''}`}
                                                                        onClick={() => handleLike(childReply.id, childReply.isLiked)}
                                                                    >
                                                                        <svg width="18" height="16" viewBox="0 0 16 16"
                                                                             fill="none">
                                                                            <path
                                                                                d="M8 14s-4-2.5-6-5.5a3.5 3.5 0 0 1 7-3.5 3.5 3.5 0 0 1 7 3.5C16 11.5 8 14 8 14Z"
                                                                                stroke="currentColor" strokeWidth="1.5"
                                                                                fill={childReply.isLiked ? 'currentColor' : 'none'}/>
                                                                        </svg>
                                                                        <span>{childReply.likes || 0}</span>
                                                                    </button>

                                                                    {/* 대댓글 편집/삭제 */}
                                                                    {canEditReply(childReply) && editingReplyId !== childReply.id && (
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
                                                        </>
                                                    )}
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
                                <h3>아직 댓글이 없습니다</h3>
                                <p>첫 번째 댓글을 남겨주세요!</p>
                            </div>
                        )}
                    </section>

                    {/* Reply Form */}
                    {!post.deleted && (
                        <section className="reply-form-section">
                            <div className="reply-form-card">
                                <div className="form-header">
                                    <h3>댓글 작성</h3>
                                    <span className="form-subtitle">자유롭게 댓글을 작성해주세요</span>
                                </div>

                                <div className="form-content">
                                    <textarea
                                        className="reply-textarea"
                                        placeholder="자유로운 의견 환영! 단, 욕설·비방·허위정보는 제한될 수 있습니다."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        rows={6}
                                        maxLength={1000}
                                    />
                                    <div className="char-count">{replyContent.length}/1000</div>
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
                                                댓글 등록 중...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M15 1L1 8l4 2 2 4 8-13Z" stroke="currentColor"
                                                          strokeWidth="1.5"
                                                          strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                댓글 등록
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    <EnhancedGoToTopButton
                        onGoToList={handleGoToList}
                        showListButton={true}
                    />
                </main>

                {/* Modals */}
                <DeleteConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                    title={deleteModalType === 'post' ? '게시물 삭제' : '댓글 삭제'}
                    message={deleteModalType === 'post' ? '정말로 이 게시물을 삭제하시겠습니까?' : '정말로 이 댓글을 삭제하시겠습니까?'}
                />

                {showLoginModal && (
                    <CommunityLoginModal
                        setShowLoginModal={setShowLoginModal}
                        action={loginModalStatus}
                    />
                )}
            </div>
        </>
    );
};

export default PostDetail;
