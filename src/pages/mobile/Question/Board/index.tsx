import React, { useState, useEffect } from 'react';

import './styles.css';
import '../../versatile-styles.css';
import axios from 'axios';
import {callBoards, callBoardsPosts} from "../../../../definition/apiPath";
import {useHistory} from "react-router-dom";
import { truncateContent } from 'src/util';

interface Question {
    id: number;
    category: any;
    title: string;
    content: string;
    author: string;
    isAnonymous: boolean;
    createdAt: string;
    answersCount: number;
    viewCount: number;
    isAnswered: boolean;
    tags?: string[];
    imageCount?: number;
    boardType?: string;
}

interface Category {
    id: any;
    name: string;
}

// 게시판 타입 정의
interface BoardType {
    id: string;
    name: string;
    color: string;
}

const QuestionsBoard = () => {
    const history = useHistory();

    useEffect(() => {
        fetchCategory();
    }, []);

    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [allQuestionsCount, setAllQuestionsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedBoardType, setSelectedBoardType] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const limit = 20;
    const offset = (currentPage - 1) * limit;

    // 게시판 타입 정의
    const boardTypes: BoardType[] = [
        { id: 'all', name: '전체', color: '#6366f1' },
        { id: 'notice', name: '공지사항', color: '#ef4444' },
        { id: 'question', name: '질문', color: '#3b82f6' },
        { id: 'free', name: '자유', color: '#10b981' },
        { id: 'tips', name: '꿀팁', color: '#f59e0b' },
        { id: 'event', name: '이벤트', color: '#8b5cf6' }
    ];

    // 시간 포맷팅 함수
    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return '방금 전';
        if (diffInHours < 24) return `${diffInHours}시간 전`;
        if (diffInHours < 48) return '1일 전';
        return `${Math.floor(diffInHours / 24)}일 전`;
    };

    const getBoardTypeInfo = (boardTypeId: string) => {
        return boardTypes.find(type => type.id === boardTypeId) || boardTypes[0];
    };

    const fetchCategory = async () => {
        try {
            const res = await axios.get(callBoards);
            if (res.data) {
                const categories: Category[] = res.data.map((category: any) => ({
                    id: category.id,
                    name: category.name
                }));
                setCategories(categories);
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300)); // 시뮬레이션

            const res = await axios.get(`${callBoardsPosts}?limit=${limit}&offset=${offset}&boardType=${selectedBoardType}&search=${searchQuery}`);
            const posts = res.data.postsList;
            const questions: Question[] = posts.map((post: any) => ({
                id: post.id,
                category: post.boardId,
                title: post.title,
                content: post.contents,
                author: post.authorName,
                createdAt: new Date(post.createdAt).toISOString(),
                answersCount: Math.floor(Math.random() * 10),
                viewCount: Math.floor(Math.random() * 500) + 20,
                isAnswered: Math.random() > 0.3,
                boardType: post.boardType || 'question',
                isPinned: post.isPinned || false,
                imageCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0
            }));

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
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 페이지 변경 시 데이터 로드
    useEffect(() => {
        fetchQuestions();
    }, [selectedBoardType, searchQuery, currentPage]);

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
            await fetchQuestions();
            setIsRefreshing(false);
        }
        setPullDistance(0);
        setTouchStartY(0);
    };

    const handleRegisterPost = () => {
        history.push(`/question/boards/posts/register?boardType=${selectedBoardType}`);
    }

    const handlePostDetail = (postId: number) => {
        history.push(`/question/boards/posts/${postId}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handleLoadMore = () => {
        setCurrentPage(prev => prev + 1);
    };

    const handGoBack = () => {
        history.push('/chassis/v2/calculator');
    }

    const totalPages = Math.ceil(allQuestionsCount / limit);
    const hasMore = currentPage < totalPages;

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
                    <div className="header-title">커뮤니티</div>
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
                {isLoading && currentPage === 1 && (
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
                                <h3 className="question-title">{question.title}</h3>
                                    <div className="question-badges">
                                        {/*{question.imageCount && question.imageCount > 0 && (*/}
                                        {/*    <span className="image-badge">[{question.imageCount}]</span>*/}
                                        {/*)}*/}
                                    </div>
                                    <div className="question-meta">
                                        <span className="question-author">{question.author}</span>
                                        <span className="question-time">{formatTimeAgo(question.createdAt)}</span>
                                        <span className="question-stats">조회 {question.viewCount}</span>
                                        <span className="question-stats">추천 {question.answersCount}</span>
                                    </div>
                                </div>
                                <hr style={{ borderTop: '3px darkGrey' }} />
                            </div>
                            {/*{question.imageCount && question.imageCount > 0 && (*/}
                            {/*    <div className="question-thumbnail">*/}
                            {/*        <div className="thumbnail-placeholder">*/}
                            {/*            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">*/}
                            {/*                <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>*/}
                            {/*            </svg>*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*)}*/}
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
                        <p className="empty-description">
                            {selectedBoardType === 'all'
                                ? '첫 번째 게시글을 등록해보세요!'
                                : `첫 번째 ${getBoardTypeInfo(selectedBoardType).name} 게시글을 등록해보세요!`
                            }
                        </p>
                        <div className="empty-actions">
                            <button
                                className="empty-action-btn"
                                onClick={handleRegisterPost}
                            >
                                글쓰기
                            </button>
                        </div>
                    </div>
                )}

                {/* Load More Button */}
                {hasMore && allQuestions.length > 0 && (
                    <div className="load-more-container">
                        <button
                            className="load-more-btn"
                            onClick={handleLoadMore}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="loading-spinner-small"></div>
                                    로딩 중...
                                </>
                            ) : (
                                '더보기'
                            )}
                        </button>
                    </div>
                )}
            </main>

            {/* Floating Write Button */}
            <button
                className="floating-write-btn"
                onClick={handleRegisterPost}
                style={{
                    backgroundColor: getBoardTypeInfo(selectedBoardType).color
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
        </div>
    );
};

export default QuestionsBoard;
