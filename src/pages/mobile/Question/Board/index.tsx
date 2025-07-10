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
}

interface Category {
    id: any;
    name: string;
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
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);

    const limit = 20;
    const offset = (currentPage - 1) * limit;

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

    const getCategoryLabel = (categoryId: any) => {
        if (!categories || !categoryId) {
            return;
        }

        if (categoryId === '0') {
            return;
        }

        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : '기타';
    };

    const fetchCategory = async () => {
        const apiCall = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    axios.get(callBoards)
                        .then((res) => {
                            if (!res.data) {
                                console.error("No categories data");
                                return;
                            }

                            const categories: Category[] = res.data.map((category: any) => ({
                                id: category.id,
                                name: category.name
                            }));

                            setCategories([
                                { id: 0, name: "전체" },
                                ...categories
                            ]);
                        })
                        .catch((err) => {
                            console.error("Failed to fetch categories:", err);
                        });
                }, 300);
            });
        };

        const res: any = await apiCall();
        setCategories(res);
    };

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const apiCall = () => {
                return new Promise((resolve) => {
                    setTimeout(() => {

                        let categoryId = selectedCategory === 0 ? '' : selectedCategory;

                        axios.get(`${callBoardsPosts}?limit=${limit}&offset=${offset}&boardIdList=${categoryId}`)
                            .then((res) => {
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
                                    isAnswered: Math.random() > 0.3
                                }));

                                resolve({
                                    postsList: questions,
                                    count: res.data.count
                                });
                            })
                            .catch((err) => {
                                console.error("게시글 조회 실패", err);
                            });
                    }, 500);
                });
            };

            const res: any = await apiCall();
            setAllQuestions(res.postsList);
            setAllQuestionsCount(res.count);
        } catch (err) {
            console.error("게시글 조회 실패", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 카테고리 선택 핸들러
    const handleCategorySelect = (categoryId: any) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1); // 카테고리 변경 시 첫 페이지로 이동

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 페이지 변경 시 데이터 로드
    useEffect(() => {
        fetchQuestions();
    }, [offset, selectedCategory]);


    // 페이지네이션
    const totalPages = Math.ceil(allQuestionsCount / limit);

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRegisterPost = () => {
        history.push('/question/boards/posts/register');
    }

    const handlePostDetail = (postId: number) => {
        history.push(`/question/boards/posts/${postId}`);
    };

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

    const handGoBack = () => {
        history.push('/chassis/v2/calculator');
    }


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
                    <div className="header-title">샷시 지식인</div>
                    <div style={{ width: '40px' }}></div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {/* Intro Section */}
                <section className="intro-section">
                    <h2 className="intro-title">샷시 전문가들과 함께하는 Q&A</h2>
                    <p className="intro-subtitle">궁금한 점을 물어보고 전문가의 답변을 받아보세요</p>
                </section>

                {/* Category Filter Section */}
                <section className="filter-section">
                    <div className="category-filter-header">
                        <h3 className="filter-title">카테고리</h3>
                        <div className="filter-subtitle">원하는 분야를 선택해보세요</div>
                    </div>

                    <div className="category-tabs">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => handleCategorySelect(category.id)}
                            >
                                <div className="category-content">
                                    <span className="category-name">{category.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Questions List */}
                <section className="questions-list-section">
                    <div className="questions-count">
                        <div className="count-main">
                            <span className="selected-category-name">
                                {getCategoryLabel(selectedCategory)}
                            </span>
                            <strong>{allQuestionsCount}개</strong>의 질문
                        </div>
                        <span className="page-info">
                            {currentPage}페이지 / {totalPages}페이지
                        </span>
                    </div>

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
                                className="question-card"
                                onClick={() => handlePostDetail(question.id)}
                            >
                                <div className="question-header">
                                    <div className="question-meta">
                                        <span className="category-badge">
                                            {getCategoryLabel(question.category)}
                                        </span>
                                        <span className="question-time">
                                            {formatTimeAgo(question.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="question-title">{question.title}</h3>

                                <p className="question-preview">{truncateContent(question.content)}</p>

                                <div className="question-footer">
                                    <div className="question-author">
                                        <span className="author-icon">👤</span>
                                        <span className="author-name">
                                            {question.author}
                                        </span>
                                        {question.imageCount && question.imageCount > 0 && (
                                            <span className="image-indicator">
                                                📷 {question.imageCount}
                                            </span>
                                        )}
                                    </div>

                                    <div className="question-stats">
                                        <span className="stat">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M1 8A7 7 0 1 1 15 8A7 7 0 0 1 1 8Z" stroke="currentColor" strokeWidth="1.5"/>
                                                <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            </svg>
                                            {question.viewCount}
                                        </span>
                                        <span className="stat">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M14 1L7 8L4.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M16 8V14A2 2 0 0 1 14 16H2A2 2 0 0 1 0 14V2A2 2 0 0 1 2 0H10" stroke="currentColor" strokeWidth="1.5"/>
                                            </svg>
                                            {question.answersCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {allQuestions.length === 0 && !isLoading && (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3 className="empty-title">
                                {selectedCategory === 0
                                    ? '아직 질문이 없습니다'
                                    : `${getCategoryLabel(selectedCategory)} 질문이 없습니다`
                                }
                            </h3>
                            <p className="empty-description">
                                {selectedCategory === 0
                                    ? '첫 번째 질문을 등록해보세요!'
                                    : '다른 카테고리를 선택하거나 첫 번째 질문을 등록해보세요!'
                                }
                            </p>
                            <div className="empty-actions">
                                {selectedCategory !== 0 && (
                                    <button
                                        className="empty-secondary-btn"
                                        onClick={() => handleCategorySelect(0)}
                                    >
                                        전체 보기
                                    </button>
                                )}
                                <button
                                    className="empty-action-btn"
                                    onClick={handleRegisterPost}
                                >
                                    질문하기
                                </button>
                            </div>
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
                </section>
            </main>

            {/* Floating Write Button */}
            <button className="floating-write-btn" onClick={handleRegisterPost}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
        </div>
    );
};

export default QuestionsBoard;
