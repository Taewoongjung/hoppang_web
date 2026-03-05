import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useSWR from "swr";
import {callBoards, callBoardsPosts, callBoardsPostsById, callMeData} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";

import './styles.css';

import QuestionRegisterFormExitModal from "../../../../component/V2/Modal/QuestionRegisterFormExitModal";
import axios from "axios";
import {Board} from "../interface";
import PostEditor from "../../../../component/V2/Board/PostEditor";
import { getAxiosError } from "../../../../util/security";

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const QuestionRegisterForm = () => {
    const history = useHistory();
    const urlParams = new URLSearchParams(window.location.search);

    useEffect(() => {
        // 뒤로가기 감지
        const unblock = history.block((location: any, action: string) => {
            if (action === 'POP') {
                setShowExitModal(true); // 상태만 바꾸고
                return false; // 페이지 이동을 막음
            }

            return; // 나머지는 허용
        });

        return () => {
            unblock(); // cleanup
        };
    }, [history]);

    const [formData, setFormData] = useState({
        category: '',
        title: '',
        contentHtml: '',
        contentText: '',
        uploadingImages: new Map<string, File>(),
        uploadingFileKeyMap: [] as unknown as Record<string, string>,
        deletedImages: [] as string[],
        isAnonymous: false
    });

    // 카테고리 선택 관련 상태
    const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null);
    const [showBranchSelection, setShowBranchSelection] = useState(false);

    const [isRegisteringReady, setIsRegisteringReady] = useState(false);
    const [isEditDataLoaded, setIsEditDataLoaded] = useState(false);


    useEffect(() => {

        const categoryId = (urlParams.get('boardType') && urlParams.get('boardType') !== 'all') ? Number(urlParams.get('boardType')) : null;

        if (categoryId !== null) {
            handleMainCategorySelect(categoryId);
        }
    }, [selectedMainCategory]);

    const fetchRevisingPost = async (revisingPostId: any, userId: any) => {
        await axios.get(
            callBoardsPostsById.replace("{postId}", revisingPostId),
            {
                withCredentials: true,
                headers: {Authorization: localStorage.getItem("hoppang-token")},
            }
        ).then((res) => {

            const post = res.data;

            if (post.registerId !== userId) {
                window.location.href = '/question/boards';
                alert("잘못된 접근입니다.");
            }

            setFormData(
                {
                    category: post.boardId,
                    title: post.title,
                    contentHtml: post.contents,
                    contentText: post.contents,
                    uploadingImages: new Map<string, File>(), // 새로 업로드 되는 이미지들
                    uploadingFileKeyMap: [] as unknown as Record<string, string>,
                    deletedImages: [] as string[], // 삭제 된 이미지
                    isAnonymous: post.isAnonymous !== 'F',
                }
            );

            setIsEditDataLoaded(true);
        });
    }

    const [boards, setBoards] = useState<Board[]>([]);
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [submitError, setSubmitError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showExitModal, setShowExitModal] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(urlParams.get('from') === 'postEdit');

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    useEffect(() => {
        mutate()
            .then(async (user) => {
                await axios.get(callBoards)
                    .then((res) => {

                        let excludeBoards = ['공지사항', '이벤트'];

                        if (user.id === 550 || user.id === 21) {
                            excludeBoards = [];
                        }

                        const boards: Board[] = res.data
                            .filter((category: any) => !excludeBoards.includes(category.name))
                            .map((category: any) => ({
                                id: category.id,
                                name: category.name,
                                branchBoards: category.branchBoards
                            }));

                        setBoards(boards);
                    })
                    .catch((err) => {
                    });

                const revisingPostId = urlParams.get('revisingPostId');
                if (revisingPostId) {
                    await fetchRevisingPost(
                        revisingPostId,
                        user.id
                    );
                }
                setIsRegisteringReady(true);
            })
            .catch((err) => {
                window.location.href = '/v2/login';
            });
    }, []);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        // 에러 상태에서 입력 시 에러 메시지 제거
        if (submitError) {
            setSubmitError('');
        }
    };

    // 메인 카테고리 선택 핸들러
    const handleMainCategorySelect = (categoryId: number) => {
        const selectedBoard = boards.find(board => board.id === categoryId);

        if (selectedBoard?.branchBoards && selectedBoard.branchBoards.length > 0) {
            // 브랜치가 있는 경우
            setSelectedMainCategory(categoryId);
            setShowBranchSelection(true);
            // 카테고리 초기화 (브랜치 선택 필요)
            handleInputChange('category', '');
        } else {
            // 브랜치가 없는 경우 바로 선택
            setSelectedMainCategory(null);
            setShowBranchSelection(false);
            handleInputChange('category', categoryId.toString());
        }
    };

    // 브랜치 카테고리 선택 핸들러
    const handleBranchCategorySelect = (branchId: number) => {
        handleInputChange('category', branchId.toString());
    };

    // 브랜치 선택 취소
    const handleBackToMainCategory = () => {
        setSelectedMainCategory(null);
        setShowBranchSelection(false);
        handleInputChange('category', '');
    };

    // 선택된 카테고리 이름 가져오기
    const getSelectedCategoryName = () => {
        if (!formData.category) return '';

        for (const board of boards) {
            if (board.id.toString() === formData.category.toString()) {
                return board.name;
            }
            if (board.branchBoards) {
                for (const branch of board.branchBoards) {
                    if (branch.id.toString() === formData.category.toString()) {
                        return `${board.name} > ${branch.name}`;
                    }
                }
            }
        }
        return '';
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.category) newErrors.category = '카테고리를 선택해주세요';
        if (!formData.title.trim()) newErrors.title = '제목을 입력해주세요';
        if (formData.title.length > 500) newErrors.title = '제목은 500자 이내로 입력해주세요';
        if (!formData.contentText.trim()) newErrors.content = '내용을 입력해주세요';
        // if (formData.contentText.length > 3000) newErrors.content = '내용은 3000자 이내로 입력해주세요';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        if (submitState === 'submitting') return;

        setSubmitState('submitting');
        setSubmitError('');

        try {
            await mutate()
                .then(async (user) => {

                    const editTargetPostId = urlParams.get('revisingPostId');

                    const payloadForPosting = new FormData();

                    // 파일들 추가
                    const uploadingFileKeyMap: Record<string, string> = {};
                    formData.uploadingImages.forEach((file, storedKey) => {
                        payloadForPosting.append("uploadingFiles", file); // 파일 추가
                        uploadingFileKeyMap[file.name] = storedKey; // storedKey ↔ 실제 파일명 매핑
                    });

                    // JSON 데이터를 별도 part로 추가
                    const jsonData = {
                        boardId: parseInt(formData.category.toString()),
                        title: formData.title,
                        contents: formData.contentHtml,
                        uploadingFileKeyMap: uploadingFileKeyMap,
                        deletingFileUrls: formData.deletedImages,
                        isAnonymous: formData.isAnonymous
                    };

                    payloadForPosting.append('req', new Blob([JSON.stringify(jsonData)], {
                        type: 'application/json'
                    }));


                    if (isEditing && editTargetPostId !== null) {

                        // 글 수정
                        const response = await axios.put(
                            callBoardsPostsById.replace("{postId}", editTargetPostId),
                            payloadForPosting,
                            {
                                withCredentials: true,
                                headers: {Authorization: localStorage.getItem("hoppang-token")}
                            }
                        );

                        if (response.data === true) {
                            window.location.href = `/question/boards/posts/${editTargetPostId}?loggedInUserId=${user.id}`;
                        }
                    } else {
                        // 글 등록
                        const response = await axios.post(
                            callBoardsPosts,
                            payloadForPosting,
                            {
                                withCredentials: true,
                                headers: {Authorization: localStorage.getItem("hoppang-token")}
                            }
                        );

                        if (response.data.createdPostId !== null) {
                            // 성공 처리
                            setSubmitState('success');

                            // 성공 애니메이션을 보여준 후 페이지 이동
                            setTimeout(() => {
                                history.push(`/question/boards/posts/${response.data.createdPostId}`);
                            }, 2000);
                        }
                    }
                });
        } catch (error: unknown) {
            console.error('Submit error:', error);
            setSubmitState('error');

            // 에러 메시지 설정
            const axiosError = getAxiosError(error);
            if (axiosError?.status === 401) {
                setSubmitError('로그인이 필요합니다. 다시 로그인해주세요.');
            } else if (axiosError?.status === 400) {
                setSubmitError('입력 정보를 다시 확인해주세요. 작성글 등록이 계속 안 되면 관리자에게 문의해주세요.');
            } else if (axiosError?.status && axiosError.status >= 500) {
                setSubmitError('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            } else {
                setSubmitError('질문 등록에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
            }

            // 3초 후 에러 상태 초기화
            setTimeout(() => {
                setSubmitState('idle');
            }, 3000);
        }
    };

    const handleRetry = () => {
        setSubmitState('idle');
        setSubmitError('');
    };

    // 성공 상태일 때 성공 화면 렌더링
    if (submitState === 'success') {
        return (
            <div className="question-form-container">
                <div className="success-container">
                    <div className="success-animation">
                        <div className="success-icon">
                            <div className="checkmark">
                                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                                    <circle cx="30" cy="30" r="28" fill="#10B981" stroke="#ffffff" strokeWidth="4"/>
                                    <path d="M18 30l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <div className="success-content">
                            <h1 className="success-title">게시글이 등록되었어요! 🎉</h1>
                            <p className="success-message">
                                다른 분들 경험담도 들어보시고<br />
                                전문가 의견까지 받아보세요
                            </p>
                        </div>
                    </div>
                    <div className="success-confetti">
                        <div className="confetti"></div>
                        <div className="confetti"></div>
                        <div className="confetti"></div>
                        <div className="confetti"></div>
                        <div className="confetti"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="question-form-container">
            {/* Header */}
            <header className="form-header">
                <div className="header-content">
                    <button
                        className="back-btn"
                        onClick={() => setShowExitModal(true)}
                        disabled={submitState === 'submitting'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="header-title">{isEditing ? '수정하기' : '게시글 작성'}</div>
                    <div className="header-spacer"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="form-main">
                {/* Hero Section */}
                <section className="form-hero">
                    <div className="hero-icon">
                        <img src="/assets/RegisterForm/register-form-icon.png" alt="Icon"/>
                    </div>
                    <h1 className="hero-title">궁금한 것을 물어보세요</h1>
                    <p className="hero-subtitle">자유롭게 글을 남겨보세요</p>
                </section>

                {/* Error Alert */}
                {submitError && (
                    <section className="error-section">
                        <div className="error-alert">
                            <div className="error-icon">⚠️</div>
                            <div className="error-content">
                                <div className="error-title">등록 실패</div>
                                <div className="error-message">{submitError}</div>
                            </div>
                            <button
                                className="error-close"
                                onClick={() => setSubmitError('')}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2"
                                          strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </section>
                )}

                {/* Form Section */}
                <section className="form-section">
                    <div className={`form-card ${submitState === 'submitting' ? 'submitting' : ''}`}>
                        {/* Category Selection */}
                        <div className="form-group">
                            <label className="form-label required">
                                카테고리
                            </label>

                            {/* 선택된 카테고리 표시 */}
                            {formData.category && (
                                <div className="selected-category-info">
                                    <div className="selected-category-content">
                                        <div className="selected-category-icon">✅&nbsp;</div>
                                        <div className="selected-category-text">
                                            <div className="selected-main">선택완료</div>
                                            <div className="selected-path">{getSelectedCategoryName()}</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="change-category-btn"
                                        onClick={() => {
                                            setSelectedMainCategory(null);
                                            setShowBranchSelection(false);
                                            handleInputChange('category', '');
                                        }}
                                        disabled={submitState === 'submitting'}
                                    >
                                        변경
                                    </button>
                                </div>
                            )}

                            {/* 카테고리 선택 UI */}
                            {!formData.category && (
                                <div className="category-selection-container">
                                    {/* 메인 카테고리 선택 */}
                                    {!showBranchSelection && (
                                        <div className="main-category-section">
                                            <div className="category-section-title">
                                                <span className="section-icon">📂</span>
                                                카테고리를 선택해주세요
                                            </div>
                                            <div className="category-grid">
                                                {boards.map((category) => (
                                                    <button
                                                        key={category.id}
                                                        type="button"
                                                        className={`category-btn ${
                                                            category.branchBoards && category.branchBoards.length > 0 ? 'has-branches' : ''
                                                        }`}
                                                        onClick={() => handleMainCategorySelect(category.id)}
                                                        disabled={submitState === 'submitting'}
                                                    >
                                                        <div className="category-content">
                                                            <span className="category-name">{category.name}</span>
                                                            {category.branchBoards && category.branchBoards.length > 0 && (
                                                                <div className="category-meta">
                                                                    <span className="branch-count">
                                                                        {category.branchBoards.length}개 세부 항목
                                                                    </span>
                                                                    <svg className="category-arrow" width="16"
                                                                         height="16" viewBox="0 0 16 16" fill="none">
                                                                        <path d="M6 4l4 4-4 4" stroke="currentColor"
                                                                              strokeWidth="2" strokeLinecap="round"
                                                                              strokeLinejoin="round"/>
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 브랜치 카테고리 선택 */}
                                    {showBranchSelection && selectedMainCategory && (
                                        <div className="branch-category-section">
                                            <div className="branch-navigation">
                                                <button
                                                    type="button"
                                                    className="back-to-main-btn"
                                                    onClick={handleBackToMainCategory}
                                                    disabled={submitState === 'submitting'}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2"
                                                              strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    <span>이전</span>
                                                </button>
                                                <div className="breadcrumb">
                                                    <span className="breadcrumb-main">
                                                        {boards.find(b => b.id === selectedMainCategory)?.name}
                                                    </span>
                                                    <span className="breadcrumb-separator"> ⮕ </span>
                                                    <span className="breadcrumb-sub">세부 카테고리 선택</span>
                                                </div>
                                            </div>

                                            <div className="branch-category-grid">
                                                {boards
                                                    .find(b => b.id === selectedMainCategory)
                                                    ?.branchBoards?.map((branch) => (
                                                        <button
                                                            key={branch.id}
                                                            type="button"
                                                            className="branch-category-btn"
                                                            onClick={() => handleBranchCategorySelect(branch.id)}
                                                            disabled={submitState === 'submitting'}
                                                        >
                                                            <div className="branch-indicator"></div>
                                                            <span className="branch-name">{branch.name}</span>
                                                            <svg className="select-icon" width="20" height="20"
                                                                 viewBox="0 0 20 20" fill="none">
                                                                <circle cx="10" cy="10" r="8" stroke="currentColor"
                                                                        strokeWidth="1.5"/>
                                                                <path d="M7 10l2 2 4-4" stroke="currentColor"
                                                                      strokeWidth="1.5" strokeLinecap="round"
                                                                      strokeLinejoin="round"/>
                                                            </svg>
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {errors.category && <span className="error-text">{errors.category}</span>}
                        </div>

                        {/* Title Input */}
                        <div className="form-group">
                            <label className="form-label required">
                                제목
                            </label>
                            <span className="char-count">{formData.title.length}/500</span>
                            <input
                                type="text"
                                className={`form-input ${errors.title ? 'error' : ''}`}
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                maxLength={500}
                                disabled={submitState === 'submitting'}
                            />
                            {errors.title && <span className="error-text">{errors.title}</span>}
                        </div>

                        {/* Content Textarea */}
                        <div className="form-group">
                            <label className="form-label required">
                                내용
                            </label>
                            <div className={`form-textarea ${errors.content ? 'error' : ''}`}>
                                {(isEditing && isEditDataLoaded) ? (
                                    <PostEditor
                                        defaultValue={formData.contentHtml}
                                        contentSaver={handleInputChange}
                                        uploadHeaders={{Authorization: localStorage.getItem("hoppang-token") || ''}}
                                        uploadingImages={formData.uploadingImages}
                                        deletedImages={formData.deletedImages}
                                    />
                                ) : (!isEditing && isRegisteringReady) ? (
                                    <PostEditor
                                        contentSaver={handleInputChange}
                                        uploadHeaders={{Authorization: localStorage.getItem("hoppang-token") || ''}}
                                        uploadingImages={formData.uploadingImages}
                                    />
                                ) : null}
                            </div>
                            {errors.content && <span className="error-text">{errors.content}</span>}
                        </div>

                        {/* Anonymous Option */}
                        <div className="form-group">
                            <div className="options-container">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAnonymous}
                                        onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                                        disabled={submitState === 'submitting'}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-text">
                                        <span className="checkbox-main">🎭 익명으로 질문</span>
                                        <span className="checkbox-desc">닉네임을 숨기고 질문</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Submit Section */}
                <section className="submit-section">
                    <button
                        className={`submit-btn ${submitState}`}
                        onClick={submitState === 'error' ? handleRetry : handleSubmit}
                        disabled={submitState === 'submitting'}
                    >
                        {submitState === 'submitting' ? (
                            <>
                                <span className="loading-spinner"></span>
                                {isEditing ? '수정 완료 중...' : '질문 등록 중...'}
                            </>
                        ) : submitState === 'error' ? (
                            <>
                                <span className="submit-icon">🔄</span>
                                다시 시도하기
                            </>
                        ) : (
                            <>
                                <span className="submit-icon">🚀</span>
                                {isEditing ? '수정 완료' : '질문 등록하기'}
                            </>
                        )}
                    </button>
                </section>
            </main>

            {showExitModal &&
                <QuestionRegisterFormExitModal
                    from={urlParams.get('from')}
                    fromDetail={urlParams.get('revisingPostId')}
                    setShowExitModal={setShowExitModal}
                />
            }
        </div>
    );
};

export default QuestionRegisterForm;
