import React, {useState, useEffect, useRef, useCallback} from 'react';

import './styles.css';
import '../../versatile-styles.css';

import axios from 'axios';
import {callBoards, callMeData, callMyBoardsPosts} from "../../../../definition/apiPath";
import BottomNavigator from "../../../../component/V2/BottomNavigator";
import useSWR from "swr";
import fetcher from "../../../../util/fetcher";
import CommunityLoginModal from "../../../../component/V2/Modal/CommunityLoginRequiredModal";
import { Question, Board } from '../interface';
import { formatTimeAgo } from 'src/util/boardUtil';
import OverlayLoadingPage from "../../../../component/Loading/OverlayLoadingPage";

// 게시판 타입 정의
interface BoardType {
    id: string;
    name: string;
    color: string;
}

// 댓글 인터페이스 추가
interface Comment {
    id: number;
    postId: number;
    postTitle: string;
    content: string;
    author: string;
    createdAt: string;
    category: number | string;
}

const MyPosts = () => {

    const { data: userData } = useSWR<{ id: string | number; tel: string; email: string; nickname?: string; name?: string } | undefined>(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [allQuestionsCount, setAllQuestionsCount] = useState(0);
    const [allBookmarks, setAllBookmarks] = useState<Question[]>([]);
    const [allBookmarksCount, setAllBookmarksCount] = useState(0);
    const [allComments, setAllComments] = useState<Comment[]>([]);
    const [allCommentsCount, setAllCommentsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [boards, setBoards] = useState<Board[]>([]);
    const [selectedBoardType, setSelectedBoardType] = useState('all');
    const [contentFilter, setContentFilter] = useState<'all' | 'posts' | 'bookmarks' | 'comments'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const limit = 20;

    useEffect(() => {
        fetchCategory();
    }, []);

    // 게시판 타입 정의 (개선된 아이콘과 색상)
    const boardTypes: BoardType[] = [
        { id: 'all', name: '전체', color: '#6366f1' },
        { id: '2', name: '질문', color: '#3b82f6' },
        { id: '3', name: '자유', color: '#10b981' },
        { id: '4', name: '꿀팁', color: '#f59e0b' },
    ];

    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // 디바운싱을 위한 타이머 ref
    const scrollTimer = useRef<NodeJS.Timeout | null>(null);
    const ticking = useRef(false);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalStatus, setLoginModalStatus] = useState<'question' | 'reply' | 'like' | 'general' | ''>('');

    // 현재 표시할 데이터를 결정하는 computed 값
    const getCurrentQuestions = () => {
        switch (contentFilter) {
            case 'posts':
                return allQuestions;
            case 'bookmarks':
                return allBookmarks;
            case 'comments':
                return allComments;
            default:
                return allQuestions
        }
    };

    const getCurrentQuestionsCount = () => {
        switch (contentFilter) {
            case 'posts':
                return allQuestionsCount;
            case 'bookmarks':
                return allBookmarksCount;
            case 'comments':
                return allCommentsCount;
            default:
                return allQuestionsCount;
        }
    };

    // boardId로 게시판 정보를 찾는 함수 (개선됨)
    const getBoardInfo = (boardId: number | string) => {
        const boardIdStr = String(boardId);

        // 먼저 메인 게시판에서 찾기
        for (const board of boards) {
            if (String(board.id) === boardIdStr) {
                return {
                    rootBoard: board,
                    branchBoard: null,
                    displayName: board.name,
                    fullPath: board.name
                };
            }

            // 브랜치 게시판에서 찾기
            if (board.branchBoards && board.branchBoards.length > 0) {
                const branchBoard = board.branchBoards.find(
                    branch => String(branch.id) === boardIdStr
                );

                if (branchBoard) {
                    return {
                        rootBoard: board,
                        branchBoard: branchBoard,
                        displayName: branchBoard.name,
                        fullPath: `${board.name} > ${branchBoard.name}`
                    };
                }
            }
        }

        return null;
    };

    // 게시판 타입 정보 가져오기
    const getBoardTypeInfo = (boardTypeId: string) => {
        return boardTypes.find(type => type.id === boardTypeId) || boardTypes[0];
    };

    // 스크롤 이벤트 핸들러
    const handleScroll = useCallback(() => {
        if (!ticking.current) {
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const documentHeight = document.documentElement.scrollHeight;
                const windowHeight = window.innerHeight;
                const scrollableHeight = documentHeight - windowHeight;
                const scrollPercent = scrollableHeight > 0 ? (currentScrollY / scrollableHeight) * 100 : 0;

                // 스크롤 임계값 설정
                const scrollThreshold = 150;
                const showThreshold = 50;
                const footerThreshold = 70;
                const bottomThreshold = 95;

                // 스크롤 방향 및 속도 감지
                const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
                const scrollDelta = Math.abs(currentScrollY - lastScrollY);

                // Footer 표시 로직
                if (scrollPercent >= bottomThreshold ||
                    (scrollPercent >= footerThreshold && currentScrollY > scrollableHeight - 200)) {
                    setIsBottomNavVisible(false);
                }
                else if (currentScrollY < 100) {
                    setIsBottomNavVisible(true);
                }
                else {
                    if (scrollDirection === 'down' &&
                        currentScrollY > scrollThreshold &&
                        scrollDelta > 5) {
                        setIsBottomNavVisible(false);
                    }
                    else if (scrollDirection === 'up' && scrollDelta > showThreshold) {
                        setIsBottomNavVisible(true);
                    }
                }

                setLastScrollY(currentScrollY);
                ticking.current = false;
            });
            ticking.current = true;
        }
    }, [lastScrollY]);

    // 디바운스된 스크롤 이벤트 등록
    useEffect(() => {
        const debouncedHandleScroll = () => {
            if (scrollTimer.current) {
                clearTimeout(scrollTimer.current);
            }
            scrollTimer.current = setTimeout(handleScroll, 10);
        };

        window.addEventListener('scroll', debouncedHandleScroll, {
            passive: true,
            capture: false
        });

        handleScroll();

        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
            if (scrollTimer.current) {
                clearTimeout(scrollTimer.current);
            }
        };
    }, [handleScroll]);

    const fetchCategory = async () => {
        try {
            const res = await axios.get(callBoards);
            if (res.data) {
                const boards: Board[] = res.data
                    .map((category: any) => ({
                        id: category.id,
                        name: category.name,
                        branchBoards: category.branchBoards || [],
                    }));

                setBoards(boards);
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    const fetchQuestions = async (page: number = 1, resetData: boolean = true) => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * limit;
            let boardIds = '';

            if (selectedBoardType !== 'all') {
                boardIds = selectedBoardType;
                // 질문 게시판의 경우 하위 브랜치들도 포함
                if (selectedBoardType === '2') {
                    const targetBoard = boards.find(board => String(board.id) === '2');

                    if (targetBoard) {
                        const branchIds = targetBoard.branchBoards.map(branch => branch.id);
                        boardIds = [targetBoard.id, ...branchIds].join(',');
                    }
                }
            }

            const res =
                await axios.get(`${callMyBoardsPosts}?limit=${limit}&offset=${offset}&boardIdList=${boardIds}&searchWord=${searchQuery}`,
                    {
                        headers: {
                            withCredentials: true,
                            Authorization: localStorage.getItem("hoppang-token")
                        },
                    }
                );
            const posts = res.data.postsList;
            const questions: Question[] = posts.map((post: any) => ({
                id: post.id,
                category: post.boardId,
                title: post.title,
                content: post.contents,
                author: post.authorName,
                createdAt: new Date(post.createdAt).toISOString(),
                replyCount: post.replyCount,
                viewCount: post.viewCount,
                imageCount: post.imageCount,
                uploadedImageUrls: post.uploadedImageUrls,
                isBookmarked: post.isBookmarked
            }));

            setAllQuestions(questions);
            setAllQuestionsCount(res.data.count);
        } catch (err) {
            console.error("게시글 조회 실패", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBookmarks = async (page: number = 1, resetData: boolean = true) => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * limit;
            let boardIds = '';
            if (selectedBoardType !== 'all') {
                boardIds = selectedBoardType;
                if (selectedBoardType === '2') {
                    const targetBoard = boards.find(board => String(board.id) === '2');
                    if (targetBoard) {
                        const branchIds = targetBoard.branchBoards.map(branch => branch.id);
                        boardIds = [targetBoard.id, ...branchIds].join(',');
                    }
                }
            }

            // 북마크 API 호출 (실제 API 엔드포인트로 변경 필요)
            const res = await axios.get(`${callMyBoardsPosts}?bookmarkOnly=true&limit=${limit}&offset=${offset}&boardIdList=${boardIds}&searchWord=${searchQuery}`, {
                headers: {
                    withCredentials: true,
                    Authorization: localStorage.getItem("hoppang-token")
                },
            });

            const bookmarks = res.data.postsList;
            const questions: Question[] = bookmarks.map((post: any) => ({
                id: post.id,
                category: post.boardId,
                title: post.title,
                content: post.contents,
                author: post.authorName,
                createdAt: new Date(post.createdAt).toISOString(),
                replyCount: post.replyCount,
                viewCount: post.viewCount,
                imageCount: post.imageCount,
                uploadedImageUrls: post.uploadedImageUrls,
                isBookmarked: true, // 북마크된 게시글임을 표시
            }));

            setAllBookmarks(questions);
            setAllBookmarksCount(res.data.count);
        } catch (err) {
            console.error("북마크 조회 실패", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 댓글 조회 함수 추가
    const fetchComments = async (page: number = 1, resetData: boolean = true) => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * limit;
            let boardIds = '';
            if (selectedBoardType !== 'all') {
                boardIds = selectedBoardType;
                if (selectedBoardType === '2') {
                    const targetBoard = boards.find(board => String(board.id) === '2');
                    if (targetBoard) {
                        const branchIds = targetBoard.branchBoards.map(branch => branch.id);
                        boardIds = [targetBoard.id, ...branchIds].join(',');
                    }
                }
            }

            // 댓글 API 호출 (실제 API 엔드포인트로 변경 필요)
            const res = await axios.get(`${callMyBoardsPosts}?repliesOnly=true&limit=${limit}&offset=${offset}&boardIdList=${boardIds}&searchWord=${searchQuery}`, {
                headers: {
                    withCredentials: true,
                    Authorization: localStorage.getItem("hoppang-token")
                },
            });

            const comments = res.data.postsList || [];
            const formattedComments: Comment[] = comments.map((comment: any) => ({
                id: comment.id,
                postId: comment.postId,
                postTitle: comment.title,
                content: comment.contents,
                author: comment.authorName,
                createdAt: new Date(comment.createdAt).toISOString(),
                category: comment.boardId
            }));

            setAllComments(formattedComments);
            setAllCommentsCount(res.data.count || 0);
        } catch (err) {
            console.error("댓글 조회 실패", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 게시판 타입 선택 핸들러
    const handleBoardTypeSelect = (boardTypeId: string) => {
        setSelectedBoardType(boardTypeId);
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 컨텐츠 필터 변경 핸들러
    const handleContentFilterChange = (filter: 'all' | 'posts' | 'bookmarks' | 'comments') => {
        setContentFilter(filter);
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 검색 핸들러
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        if (searchQuery !== '') {
            if (contentFilter === 'posts' || contentFilter === 'all') {
                fetchQuestions(1, true);
            } else if (contentFilter === 'bookmarks') {
                fetchBookmarks(1, true);
            } else if (contentFilter === 'comments') {
                fetchComments(1, true);
            }
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        setCurrentPage(1);
        setAllQuestions([]);
        setAllBookmarks([]);
        setAllComments([]);

        if (contentFilter === 'all' || contentFilter === 'posts') {
            fetchQuestions(1, true);
        }
        if (contentFilter === 'all' || contentFilter === 'bookmarks') {
            fetchBookmarks(1, true);
        }
        if (contentFilter === 'all' || contentFilter === 'comments') {
            fetchComments(1, true);
        }
    }, [selectedBoardType, searchQuery, contentFilter]);

    useEffect(() => {
        if (currentPage >= 1) {
            if (contentFilter === 'posts' || contentFilter === 'all') {
                fetchQuestions(currentPage, true);
            } else if (contentFilter === 'bookmarks') {
                fetchBookmarks(currentPage, true);
            } else if (contentFilter === 'comments') {
                fetchComments(currentPage, true);
            }
        }
    }, [currentPage]);

    // 페이지가 다시 활성화될 때 데이터 갱신 (편집/댓글 작성 후 돌아왔을 때 반영)
    useEffect(() => {
        let refreshTimeout: NodeJS.Timeout;

        const refreshData = () => {
            // 1.5초 딜레이 후 데이터 갱신 (서버 처리 대기)
            refreshTimeout = setTimeout(() => {
                if (contentFilter === 'posts' || contentFilter === 'all') {
                    fetchQuestions(currentPage, true);
                }
                if (contentFilter === 'all' || contentFilter === 'bookmarks') {
                    fetchBookmarks(currentPage, true);
                }
                if (contentFilter === 'all' || contentFilter === 'comments') {
                    fetchComments(currentPage, true);
                }
            }, 1500);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refreshData();
            }
        };

        const handleFocus = () => {
            refreshData();
        };

        // visibilitychange: 탭 전환 시
        document.addEventListener('visibilitychange', handleVisibilityChange);
        // focus: 창이 다시 포커스 받을 때
        window.addEventListener('focus', handleFocus);

        return () => {
            if (refreshTimeout) clearTimeout(refreshTimeout);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [currentPage, selectedBoardType, searchQuery, contentFilter]);

    // Pull to refresh 핸들러
    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setTouchStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && touchStartY > 0) {
            const currentY = e.touches[0].clientY;
            const distance = Math.max(0, currentY - touchStartY);
            setPullDistance(Math.min(distance, 80));
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setIsRefreshing(true);
            if (contentFilter === 'posts' || contentFilter === 'all') {
                await fetchQuestions(currentPage, true);
            } else if (contentFilter === 'bookmarks') {
                await fetchBookmarks(currentPage, true);
            } else if (contentFilter === 'comments') {
                await fetchComments(currentPage, true);
            }
            setIsRefreshing(false);
        }
        setPullDistance(0);
        setTouchStartY(0);
    };

    const handleRegisterPost = () => {
        if (!userData) {
            setShowLoginModal(true);
            setLoginModalStatus('question');
        } else {
            window.location.href = `/question/boards/posts/register?boardType=${selectedBoardType}`;
        }
    }

    const handlePostDetail = async (postId: number) => {
        if (userData) {
            window.location.href = `/question/boards/posts/${postId}?from=myPosts&loggedInUserId=${userData.id}`;
        } else {
            window.location.href = `/question/boards/posts/${postId}?from=myPosts`;
        }
    };

    const handGoBack = () => {
        window.location.href = '/v2/mypage';
    }

    const currentQuestions = getCurrentQuestions();
    const currentQuestionsCount = getCurrentQuestionsCount();
    const totalPages = Math.ceil(currentQuestionsCount / limit);

    // 페이지네이션 렌더링 함수
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // 이전 페이지
        pages.push(
            <button
                key="prev"
                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        );

        // 첫 페이지
        if (startPage > 1) {
            pages.push(
                <button key={1} className="pagination-btn" onClick={() => handlePageChange(1)}>
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
            }
        }

        // 페이지 번호들
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // 마지막 페이지
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
            }
            pages.push(
                <button key={totalPages} className="pagination-btn" onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                </button>
            );
        }

        // 다음 페이지
        pages.push(
            <button
                key="next"
                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        );

        return pages;
    };

    // 북마크 배지 렌더링 함수
    const renderBookmarkBadge = (question: Question) => {
        if (question.isBookmarked && contentFilter === 'all') {
            return (
                <span className="bookmark-badge">
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                        <path d="M3 2v12l5-3 5 3V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z"
                              stroke="currentColor" strokeWidth="1.5"
                              fill="currentColor"/>
                    </svg>
                    북마크
                </span>
            );
        }
        return null;
    };

    // 댓글 배지 렌더링 함수
    const renderCommentBadge = () => {
        if (contentFilter === 'comments' || contentFilter === 'all') {
            return (
                <span className="comment-badge">
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1C11.866 1 15 4.134 15 8C15 11.866 11.866 15 8 15C6.674 15 5.431 14.612 4.378 13.934L1 15L2.066 11.622C1.388 10.569 1 9.326 1 8C1 4.134 4.134 1 8 1Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor"/>
                    </svg>
                    내 댓글
                </span>
            );
        }
        return null;
    };

    // 게시물 배지 렌더링 함수
    const renderQuestionBadges = (question: Question | Comment) => {
        const badges = [];

        if (question.category) {
            const boardInfo = getBoardInfo(question.category);

            if (boardInfo) {
                // 루트 게시판 배지 (전체 탭이거나 다른 게시판일 때만 표시)
                if (selectedBoardType === 'all' ||
                    (selectedBoardType !== 'all' && String(boardInfo.rootBoard.id) !== selectedBoardType)) {

                    const boardTypeInfo = getBoardTypeInfo(String(boardInfo.rootBoard.id));
                    badges.push(
                        <span
                            key="root-board"
                            className="root-board-badge"
                            style={{ backgroundColor: boardTypeInfo.color }}
                        >
                            {boardInfo.rootBoard.name}
                        </span>
                    );
                }

                // 브랜치 게시판 배지 (브랜치가 있는 경우)
                if (boardInfo.branchBoard) {
                    badges.push(
                        <span key="branch-board" className="branch-board-badge">
                            {boardInfo.branchBoard.name}
                        </span>
                    );
                }
            }
        }

        return badges;
    };

    // 댓글 아이템 렌더링 함수
    const renderCommentItem = (comment: Comment) => {
        return (
            <div
                key={`comment-${comment.id}`}
                className="question-item comment-item"
                onClick={() => handlePostDetail(comment.id)}
                data-type="comment"
            >
                <div className="question-main">
                    <div className="question-header">
                        <div className="question-badges">
                            {renderCommentBadge()}
                            {renderQuestionBadges(comment)}
                        </div>
                        <h3 className="question-title comment-post-title">
                            📝 {comment.postTitle}
                        </h3>
                        <div className="question-meta">
                            <span className="question-author">{comment.author}</span>
                            <span className="meta-separator">·</span>
                            <span className="question-time">{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <div className="comment-indicator">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1C11.866 1 15 4.134 15 8C15 11.866 11.866 15 8 15C6.674 15 5.431 14.612 4.378 13.934L1 15L2.066 11.622C1.388 10.569 1 9.326 1 8C1 4.134 4.134 1 8 1Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    </svg>
                </div>
            </div>
        );
    };

    // 댓글 수 렌더링 함수
    const renderRepliesCount = (question: Question) => {
        if (question.replyCount > 0) {
            return (
                <>
                    <span className="meta-separator">·</span>
                    <span className="replies-count">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path d="M8 1C11.866 1 15 4.134 15 8C15 11.866 11.866 15 8 15C6.674 15 5.431 14.612 4.378 13.934L1 15L2.066 11.622C1.388 10.569 1 9.326 1 8C1 4.134 4.134 1 8 1Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                        </svg>
                        {question.replyCount}
                    </span>
                </>
            );
        }
        return null;
    };


    return (
        <div className="questions-container"
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>

            {/* Pull to refresh indicator */}
            {(pullDistance > 0 || isRefreshing) && (
                <div className="pull-refresh-indicator" style={{ height: `${pullDistance}px` }}>
                    <div className="pull-refresh-content">
                        {isRefreshing ? (
                            <div className="refresh-spinner">
                                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                                <span>새로고침 중...</span>
                            </div>
                        ) : (
                            <div className="pull-refresh-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${pullDistance * 2}deg)` }}>
                                    <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M3.51 15A9 9 0 1 0 6 5.3L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>{pullDistance > 60 ? '놓아서 새로고침' : '아래로 당겨서 새로고침'}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <button className="back-btn" onClick={handGoBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="header-title">내 활동</div>
                    <div style={{ width: '40px' }}></div>
                </div>
            </header>

            {/* Board Type Tabs */}
            <section className="board-tabs-section">
                <div className="board-tabs-container">
                    <div className="board-tabs">
                        {boardTypes.map((boardType) => (
                            <button
                                key={boardType.id}
                                className={`board-tab ${selectedBoardType === boardType.id ? 'active' : ''}`}
                                onClick={() => handleBoardTypeSelect(boardType.id)}
                                style={{
                                    '--board-color': boardType.color
                                } as React.CSSProperties}
                            >
                                <span className="board-tab-name">{boardType.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content Filter Tabs */}
            <section className="content-filter-section">
                <div className="content-filter-container">
                    <div className="content-filter-tabs">
                        <button
                            className={`content-filter-tab ${contentFilter === 'posts' ? 'active' : ''}`}
                            onClick={() => handleContentFilterChange('posts')}
                            data-filter="posts"
                        >
                            <span className="filter-icon">📝</span>
                            <span className="filter-name">내 게시글</span>
                            <span className="filter-count">{allQuestionsCount}</span>
                        </button>
                        <button
                            className={`content-filter-tab ${contentFilter === 'comments' ? 'active' : ''}`}
                            onClick={() => handleContentFilterChange('comments')}
                            data-filter="comments"
                        >
                            <span className="filter-icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 1C11.866 1 15 4.134 15 8C15 11.866 11.866 15 8 15C6.674 15 5.431 14.612 4.378 13.934L1 15L2.066 11.622C1.388 10.569 1 9.326 1 8C1 4.134 4.134 1 8 1Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                                </svg>
                            </span>
                            <span className="filter-name">내 댓글</span>
                            <span className="filter-count">{allCommentsCount}</span>
                        </button>
                        <button
                            className={`content-filter-tab ${contentFilter === 'bookmarks' ? 'active' : ''}`}
                            onClick={() => handleContentFilterChange('bookmarks')}
                            data-filter="bookmarks"
                        >
                        <span className="filter-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 2v12l5-3 5 3V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z"
                                      stroke="currentColor" strokeWidth="1.5"
                                      fill="currentColor"/>
                            </svg>
                        </span>
                            <span className="filter-name">북마크</span>
                            <span className="filter-count">{allBookmarksCount}</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="검색어를 입력해주세요"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="search-btn">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </form>
            </section>

            {/* Questions List */}
            <main className="questions-list-section">
                {isLoading && (
                    <OverlayLoadingPage word={"로딩 중..."}/>
                )}

                <div className={`questions-list ${isLoading ? 'loading' : ''}`}>
                    {contentFilter === 'comments' ? (
                        // 댓글 렌더링
                        allComments.map((comment) => renderCommentItem(comment))
                    ) : (
                        // 기존 게시글/북마크 렌더링
                        // @ts-ignore
                        currentQuestions.map((question: any) => (
                            <div
                                key={`${question.id}-${question.isBookmarked ? 'bookmark' : 'post'}`}
                                className="question-item"
                                onClick={() => handlePostDetail(question.id)}
                                data-bookmarked={question.isBookmarked || false}
                            >
                                <div className="question-main">
                                    <div className="question-header">
                                        <div className="question-badges">
                                            {renderBookmarkBadge(question)}
                                            {renderQuestionBadges(question)}
                                        </div>
                                        <h3 className="question-title">{question.title}</h3>
                                        <div className="question-meta">
                                            <span className="question-author">{question.author}</span>
                                            <span className="meta-separator">·</span>
                                            <span className="question-time">{formatTimeAgo(question.createdAt)}</span>
                                            <span className="meta-separator">·</span>
                                            <span className="question-stats">조회 {question.viewCount}</span>
                                            {renderRepliesCount(question)}
                                        </div>
                                    </div>
                                </div>
                                {
                                    question.imageCount && question.imageCount > 0 ? (
                                        <div className="question-thumbnail-enhanced">
                                            <div className="thumbnail-container">
                                                <img
                                                    src={question?.uploadedImageUrls?.[0]}
                                                    alt="게시물 이미지"
                                                    className="thumbnail-image"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        // @ts-ignore
                                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="thumbnail-fallback" style={{display: 'none'}}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                                                        <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                                                    </svg>
                                                </div>

                                                {/* 이미지 개수 표시 (2개 이상일 때) */}
                                                {question.imageCount > 1 && (
                                                    <div className="image-count-overlay">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" fill="none"/>
                                                        </svg>
                                                        <span>{question.imageCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : <></>
                                }
                            </div>
                        ))
                    )}
                </div>

                {/* Empty State */}
                {currentQuestions.length === 0 && !isLoading && (
                    <div className="empty-state">
                        <h3 className="empty-title">
                            {contentFilter === 'bookmarks'
                                ? '북마크한 게시글이 없습니다'
                                : contentFilter === 'posts'
                                    ? (selectedBoardType === 'all'
                                        ? '아직 게시글이 없습니다'
                                        : `${getBoardTypeInfo(selectedBoardType).name} 게시글이 없습니다`)
                                    : contentFilter === 'comments'
                                        ? '작성한 댓글이 없습니다'
                                        : '아직 활동이 없습니다'
                            }
                        </h3>
                        <p className="empty-description">
                            {contentFilter === 'bookmarks'
                                ? '관심 있는 게시글을 북마크해보세요!'
                                : contentFilter === 'posts'
                                    ? (selectedBoardType === 'all'
                                        ? '첫 번째 게시글을 등록해보세요!'
                                        : `첫 번째 ${getBoardTypeInfo(selectedBoardType).name} 게시글을 등록해보세요!`)
                                    : contentFilter === 'comments'
                                        ? '게시글에 댓글을 작성해보세요!'
                                        : '게시글을 작성하거나 댓글을 달아보세요!'
                            }
                        </p>
                        {contentFilter !== 'bookmarks' && contentFilter !== 'comments' && (
                            <div className="empty-actions">
                                <button
                                    className="empty-action-btn"
                                    onClick={handleRegisterPost}
                                    style={{ backgroundColor: getBoardTypeInfo(selectedBoardType).color }}
                                >
                                    글쓰기
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isLoading && (
                    <div className="pagination-container">
                        <div className="pagination">
                            {renderPagination()}
                        </div>
                    </div>
                )}
            </main>

            {showLoginModal && <CommunityLoginModal setShowLoginModal={setShowLoginModal} action={loginModalStatus}/>}

            {/* Bottom Navigation */}
            <BottomNavigator
                userData={userData}
                isVisible={isBottomNavVisible}
            />
        </div>
    );
};

export default MyPosts;
