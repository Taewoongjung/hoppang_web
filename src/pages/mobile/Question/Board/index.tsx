import React, {useState, useEffect, useRef, useCallback} from 'react';

import './styles.css';
import '../../versatile-styles.css';

import axios from 'axios';
import {callBoards, callBoardsPosts, callMeData} from "../../../../definition/apiPath";
import BottomNavigator from "../../../../component/V2/BottomNavigator";
import useSWR from "swr";
import fetcher from "../../../../util/fetcher";
import CommunityLoginModal from "../../../../component/V2/Modal/CommunityLoginRequiredModal";
import { Question, Board } from '../interface';
import {formatTimeAgo, formatUserName} from "../../../../util/boardUtil";

// 게시판 타입 정의
interface BoardType {
    id: string;
    name: string;
    color: string;
}

const QuestionsBoard = () => {

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    // Safe area 지원 감지
    const [supportsSafeArea, setSupportsSafeArea] = useState(false);

    // Safe area 지원 여부 확인 및 viewport 설정
    useEffect(() => {
        const checkSafeAreaSupport = () => {
            if (CSS && CSS.supports) {
                const supports = CSS.supports('padding', 'env(safe-area-inset-top)');
                setSupportsSafeArea(supports);

                // 디버깅용 로그
                console.log('🔍 QuestionsBoard Safe area support:', supports);

                // body에 safe area 관련 클래스 추가
                if (supports) {
                    document.body.classList.add('supports-safe-area');
                } else {
                    document.body.classList.add('no-safe-area');
                }
            }
        };

        // Safe area를 위한 viewport meta tag 동적 설정
        const setViewportMeta = () => {
            let viewportMeta = document.querySelector('meta[name="viewport"]');
            if (!viewportMeta) {
                viewportMeta = document.createElement('meta');
                viewportMeta.setAttribute('name', 'viewport');
                document.head.appendChild(viewportMeta);
            }

            // Safe area를 고려한 viewport 설정
            viewportMeta.setAttribute('content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
            );
        };

        setViewportMeta();
        checkSafeAreaSupport();
    }, []);

    useEffect(() => {
        fetchCategory();
    }, []);

    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [allQuestionsCount, setAllQuestionsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [boards, setBoards] = useState<Board[]>([]);
    const [selectedBoardType, setSelectedBoardType] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const limit = 20;

    // 게시판 타입 정의
    const boardTypes: BoardType[] = [
        { id: 'all', name: '전체', color: '#6366f1' },
        { id: '1', name: '공지사항', color: '#ef4444' },
        { id: '2', name: '질문', color: '#3b82f6' },
        { id: '3', name: '자유', color: '#10b981' },
        { id: '4', name: '꿀팁', color: '#f59e0b' },
        { id: '10', name: '이벤트', color: '#8b5cf6' }
    ];

    const sometimesExcludeBoardTypeId = ['1', '10'];

    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // 디바운싱을 위한 타이머 ref
    const scrollTimer = useRef<NodeJS.Timeout | null>(null);
    const ticking = useRef(false);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalStatus, setLoginModalStatus] = useState<'question' | 'reply' | 'like' | 'general' | ''>('');

    const getBoardNames = (boardId: number | string): { rootName?: string; branchName?: string } => {
        const result: { rootName?: string; branchName?: string } = {};

        for (const board of boards) {
            // branch에서 먼저 찾기
            const branchBoard = board.branchBoards.find(
                branch => String(branch.id) === String(boardId)
            );

            if (branchBoard) {
                result.branchName = branchBoard.name;
                result.rootName = board.name; // branch가 있으면 root는 부모 board
                return result; // 둘 다 찾았으면 여기서 끝내도 됨
            }

            // branch에 없으면 root에서 찾기
            if (String(board.id) === String(boardId)) {
                result.rootName = board.name;
                return result;
            }
        }

        return result;
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
                const scrollThreshold = 150; // 150px 이상 스크롤하면 숨김
                const showThreshold = 50; // 50px 이상 위로 스크롤하면 다시 표시
                const footerThreshold = 70; // 스크롤 70% 지점에서 Footer 표시
                const bottomThreshold = 95; // 95% 이상에서는 무조건 Footer 표시

                // 스크롤 방향 및 속도 감지
                const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
                const scrollDelta = Math.abs(currentScrollY - lastScrollY);

                // Footer 표시 로직
                if (scrollPercent >= bottomThreshold ||
                    (scrollPercent >= footerThreshold && currentScrollY > scrollableHeight - 200)) {
                    setIsBottomNavVisible(false);
                }
                // 페이지 상단 근처에서는 Footer 숨김, BottomNav 표시
                else if (currentScrollY < 100) {
                    setIsBottomNavVisible(true);
                }
                // 중간 영역에서의 BottomNav 표시/숨김 로직
                else {
                    // 아래로 빠르게 스크롤할 때
                    if (scrollDirection === 'down' &&
                        currentScrollY > scrollThreshold &&
                        scrollDelta > 5) {
                        setIsBottomNavVisible(false);
                    }
                    // 위로 스크롤할 때
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

        // 초기 상태 설정
        handleScroll();

        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
            if (scrollTimer.current) {
                clearTimeout(scrollTimer.current);
            }
        };
    }, [handleScroll]);

    const getBoardTypeInfo = (boardTypeId: string) => {
        return boardTypes.find(type => type.id === boardTypeId) || boardTypes[0];
    };

    const fetchCategory = async () => {
        try {
            const res = await axios.get(callBoards);
            if (res.data) {
                const boards: Board[] = res.data.map((category: any) => ({
                    id: category.id,
                    name: category.name,
                    branchBoards: category.branchBoards
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
            await new Promise(resolve => setTimeout(resolve, 300)); // 시뮬레이션

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

            const res = await axios.get(`${callBoardsPosts}?limit=${limit}&offset=${offset}&boardIdList=${boardIds}&searchWord=${searchQuery}`);
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
                isAnswered: Math.random() > 0.3,
                imageCount: null
            }));

            // 항상 새 데이터로 교체 (기존 데이터에 추가하지 않음)
            setAllQuestions(questions);
            setAllQuestionsCount(res.data.count);
        } catch (err) {
            console.error("게시글 조회 실패", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 게시판 타입 선택 핸들러
    const handleBoardTypeSelect = (boardTypeId: string) => {
        setSelectedBoardType(boardTypeId);
        setCurrentPage(1); // 페이지 리셋
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 검색 핸들러
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // 페이지 리셋
        if (searchQuery !== '') {
            fetchQuestions(currentPage, true);
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        // 게시판 타입이나 검색어 변경 시 첫 페이지로 리셋
        setCurrentPage(1);
        setAllQuestions([]);
        fetchQuestions(1, true);
    }, [selectedBoardType, searchQuery]);

    // 페이지 변경만 처리하는 별도 useEffect
    useEffect(() => {
        if (currentPage >= 1) {
            fetchQuestions(currentPage, true);
        }
    }, [currentPage]);

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
            await fetchQuestions(currentPage, true);
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
            window.location.href = `/question/boards/posts/${postId}?loggedInUserId=${userData.id}`;
        } else {
            window.location.href = `/question/boards/posts/${postId}`;
        }
    };

    const handGoBack = () => {
        window.location.href = '/chassis/calculator';
    }

    const totalPages = Math.ceil(allQuestionsCount / limit);

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

    // 게시물 배지 렌더링 함수
    const renderQuestionBadges = (question: Question) => {
        const badges = [];

        // 카테고리 배지 (전체 탭에서만 표시하고, 카테고리가 있는 경우)
        if ((selectedBoardType === 'all' || selectedBoardType === '2' ) && question.category) {
            const categoryNames = getBoardNames(question.category);
            if (categoryNames.rootName) {
                badges.push(
                    <span
                        key="board-type"
                        className="board-type-badge"
                        style={{ backgroundColor: boardTypes.find(type => type.name === categoryNames.rootName)?.color }}
                    >
                    {categoryNames.rootName}
                </span>
                );
            }
            if (categoryNames.branchName) {
                badges.push(
                    <span
                        key="category"
                        className="category-badge"
                    >
                        {categoryNames.branchName}
                    </span>
                );
            }
        }

        // 이미지 배지
        if (question.imageCount && question.imageCount > 0) {
            badges.push(
                <span key="image" className="image-badge">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <path d="M14 2H2C1.45 2 1 2.45 1 3V13C1 13.55 1.45 14 2 14H14C14.55 14 15 13.55 15 13V3C15 2.45 14.55 2 14 2ZM5 10.5L7 12.5L10 8.5L14 12H2L5 10.5Z" fill="currentColor"/>
                    </svg>
                    {question.imageCount}
                </span>
            );
        }

        return badges;
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
        <div
            className="questions-container"
            style={{
                // Safe area를 고려한 인라인 스타일
                paddingTop: supportsSafeArea ? 'env(safe-area-inset-top)' : '0',
                paddingBottom: supportsSafeArea ? 'env(safe-area-inset-bottom)' : '0',
                paddingLeft: supportsSafeArea ? 'env(safe-area-inset-left)' : '0',
                paddingRight: supportsSafeArea ? 'env(safe-area-inset-right)' : '0',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >

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
                    <div className="header-title">커뮤니티</div>
                    {userData && <div className="header-my-activity" onClick={() => window.location.href = "/question/my/boards"}>내 활동</div>}
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
                    <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        <span>로딩 중...</span>
                    </div>
                )}

                <div className={`questions-list ${isLoading ? 'loading' : ''}`}>
                    {allQuestions.map((question) => (
                        <div
                            key={question.id}
                            className={`question-item`}
                            onClick={() => handlePostDetail(question.id)}
                        >
                            <div className="question-main">
                                <div className="question-header">
                                    <div className="question-badges">
                                        {renderQuestionBadges(question)}
                                        {/*{renderAnsweredBadge(question)}*/}
                                    </div>
                                    <h3 className="question-title">{question.title}</h3>
                                    <div className="question-meta">
                                        <span className="question-author">{formatUserName(question.author)}</span>
                                        <span className="meta-separator">·</span>
                                        <span className="question-time">{formatTimeAgo(question.createdAt)}</span>
                                        <span className="meta-separator">·</span>
                                        <span className="question-stats">조회 {question.viewCount}</span>
                                        {renderRepliesCount(question)}
                                    </div>
                                </div>
                            </div>
                            {question.imageCount && question.imageCount > 0 && (
                                <div className="question-thumbnail">
                                    <div className="thumbnail-placeholder">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {allQuestions.length === 0 && !isLoading && (
                    <div className="empty-state">
                        <h3 className="empty-title">
                            {selectedBoardType === 'all'
                                ? '아직 게시글이 없습니다'
                                : `${getBoardTypeInfo(selectedBoardType).name} 게시글이 없습니다`
                            }
                        </h3>
                        {!sometimesExcludeBoardTypeId.includes(selectedBoardType) &&
                            <p className="empty-description">
                                {selectedBoardType === 'all'
                                    ? '첫 번째 게시글을 등록해보세요!'
                                    : `첫 번째 ${getBoardTypeInfo(selectedBoardType).name} 게시글을 등록해보세요!`
                                }
                            </p>
                        }
                        {!sometimesExcludeBoardTypeId.includes(selectedBoardType) &&
                            <div className="empty-actions">
                                <button
                                    className="empty-action-btn"
                                    onClick={handleRegisterPost}
                                >
                                    글쓰기
                                </button>
                            </div>
                        }
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

            {/* Floating Write Button */}
            {(!sometimesExcludeBoardTypeId.includes(selectedBoardType)) &&
                <button
                    className="floating-write-btn"
                    onClick={handleRegisterPost}
                    style={{
                        backgroundColor: getBoardTypeInfo(selectedBoardType).color,
                        // Safe area 고려한 동적 위치 조정
                        bottom: supportsSafeArea
                            ? `calc(100px + max(0px, env(safe-area-inset-bottom)))`
                            : '100px',
                        right: supportsSafeArea
                            ? `calc(20px + max(0px, env(safe-area-inset-right)))`
                            : '20px'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            }

            {showLoginModal && <CommunityLoginModal setShowLoginModal={setShowLoginModal} action={loginModalStatus}/>}

            {/* Bottom Navigation - 조건부 렌더링 */}
            <BottomNavigator
                userData={userData}
                isVisible={isBottomNavVisible}
            />
        </div>
    );
};

export default QuestionsBoard;
