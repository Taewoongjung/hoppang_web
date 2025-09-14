import React, {useEffect, useState, useRef, useCallback, useMemo} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import './styles.css';

import {callBoardsPostsImageUpload} from "../../../../definition/apiPath";
import OverlayLoadingPage from "../../../Loading/OverlayLoadingPage";


interface PostEditorProps {
    initialContent?: string;
    placeholder?: string;
    readOnly?: boolean;
    imageUploadUrl?: string;
    imageDeleteUrl?: string;
    uploadHeaders?: Record<string, string>;
    onContentChange?: (content: string, delta: any, source: string) => void;
    contentSaver?: (field: string, content: any) => void;
    defaultValue?: string;
    uploadingImages?: Map<string, File>
}

const PostEditor: React.FC<PostEditorProps> = ({
                                                   initialContent = '',
                                                   placeholder = '내용을 입력해주세요...',
                                                   readOnly = false,
                                                   imageUploadUrl = callBoardsPostsImageUpload,
                                                   imageDeleteUrl = callBoardsPostsImageUpload,
                                                   uploadHeaders = {},
                                                   onContentChange,
                                                   contentSaver,
                                                   defaultValue = '',
                                                   uploadingImages,
                                               }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isInitializedRef = useRef<boolean>(false);
    const lastContentRef = useRef<string>('');
    const currentImageUrlsRef = useRef<string[]>([]);

    const [wordCount, setWordCount] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
    const [initialEditorContent, setInitialEditorContent] = useState<string>();


    // currentImageUrls가 변경될 때마다 ref도 업데이트
    useEffect(() => {
        currentImageUrlsRef.current = currentImageUrls;
    }, [currentImageUrls]);

    // 이미지 삭제 처리 함수
    const handleImageDelete = async (deletingFileUrls: string[]): Promise<void> => {
        try {
            // console.log('이미지 삭제 시도:', deletingFileUrls);

            const response = await fetch(imageDeleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...uploadHeaders,
                },
                body: JSON.stringify({ deletingFileUrls })
            });

            if (response.ok) {
                console.log('이미지 삭제 성공:', deletingFileUrls);

                const deletingUrlsFromOriginalContents = deletingFileUrls.filter(
                    deletedImageUrl => extractImageUrls(defaultValue).includes(deletedImageUrl)
                ); // 기존 원본에서 삭제 될 이미지들을 필터링

                console.log("실제 삭제 될 이미지 = ", deletingUrlsFromOriginalContents);

                if (contentSaver && deletingUrlsFromOriginalContents.length > 0) {
                    contentSaver('deletedImages', deletingUrlsFromOriginalContents); // 삭제 될 이미지
                }
            } else {
                // console.error('이미지 삭제 실패:', response.status);
            }
        } catch (error) {
            // console.error('이미지 삭제 에러:', error);
        }
    };

    // 이미지 업로드 처리 함수
    const handleImageUpload = async (file: File): Promise<string | null> => {
        try {
            setIsUploading(true);

            const formData = new FormData();
            await formData.append('uploadingFile', file);

            const response = await fetch(imageUploadUrl, {
                method: 'POST',
                headers: {
                    ...uploadHeaders,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`업로드 실패: ${response.statusText}`);
            }

            const uploadedImageUrl = await response.text();

            if (!uploadedImageUrl) {
                throw new Error('이미지 URL을 받지 못했습니다.');
            }

            setCurrentImageUrls(prev => {
                const updated = prev.includes(uploadedImageUrl) ? prev : [...prev, uploadedImageUrl];
                currentImageUrlsRef.current = updated; // ref도 즉시 업데이트
                return updated;
            });

            if (contentSaver) {
                contentSaver('uploadingImages',
                    uploadingImages?.set(uploadedImageUrl, file)
                );
            }

            return uploadedImageUrl;

        } catch (error) {
            alert(error);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // HTML 내용에서 이미지 URL 추출
    const extractImageUrls = (htmlContent: string): string[] => {
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        const urls: string[] = [];
        let match;

        while ((match = imgRegex.exec(htmlContent)) !== null) {
            const url = match[1];
            if (!url.startsWith('data:')) {
                urls.push(url);
            }
        }

        return urls;
    };

    const imageHandler = useCallback(() => {
        if (isUploading) {
            alert('이미지 업로드 중입니다. 잠시만 기다려주세요.');
            return;
        }

        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            // 파일 크기 체크 (5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
                alert('이미지 크기는 5MB 이하만 업로드 가능합니다.');
                return;
            }

            const quill = quillRef.current;
            if (!quill) return;

            // @ts-ignore
            const range = quill.getSelection(true);
            if (!range) return;

            try {
                const imageUrl = await handleImageUpload(file);

                if (imageUrl) {
                    // 이미지 삽입
                    // @ts-ignore
                    quill.insertEmbed(range.index, 'image', imageUrl);
                    // @ts-ignore
                    quill.setSelection(range.index + 1);
                }

            } catch (error) {
                console.error('이미지 업로드 실패:', error);
            }
        };

        input.click();
    }, [isUploading, handleImageUpload]);

    // 콘텐츠 변경 핸들러 - 디바운싱 적용
    const handleContentChange = useCallback(async (delta: any, oldDelta: any, source: string) => {
        const quill = quillRef.current;
        if (!quill) return;

        // @ts-ignore
        const currentContent = quill.root.innerHTML;
        // @ts-ignore
        const textLength = quill.getText().trim().length;

        lastContentRef.current = currentContent;

        setWordCount(textLength);

        if (!isUploading && currentImageUrlsRef.current.length > 0) {
            setTimeout(() => {
                // @ts-ignore
                const latestContent = quillRef.current?.root.innerHTML || '';
                const currentlyRemainedImageUrls = extractImageUrls(latestContent);

                const deletedImageUrls = currentImageUrlsRef.current.filter(
                    url => !currentlyRemainedImageUrls.includes(url)
                );

                if (deletedImageUrls.length > 0) {
                    handleImageDelete(deletedImageUrls);
                    setCurrentImageUrls(currentlyRemainedImageUrls);
                    currentImageUrlsRef.current = currentlyRemainedImageUrls;
                }
            }, 50);
        }

        // contentSaver 호출 - 디바운싱으로 처리
        if (contentSaver) {
            setTimeout(() => {
                contentSaver('contentHtml', currentContent);
                // @ts-ignore
                contentSaver('contentText', quill.getText());
            }, 30);
        }

        // onContentChange 콜백 호출
        if (onContentChange) {
            onContentChange(currentContent, delta, source);
        }
    }, [initialEditorContent, currentImageUrls, isUploading, contentSaver, onContentChange, handleImageDelete]);

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (defaultValue !== undefined) {
            setInitialEditorContent(defaultValue);
            lastContentRef.current = defaultValue;
            setIsReady(true);
        }
    }, [defaultValue]);

    // Quill 설정 메모이제이션
    const quillConfig = useMemo(() => ({
        theme: 'snow',
        readOnly,
        placeholder,
        modules: {
            toolbar: readOnly ? false : {
                container: [
                    [{ 'header': [1, 2, 3, 4, 5, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['image'],
                ],
                handlers: {
                    image: imageHandler
                }
            },
            history: {
                delay: 1000,
                maxStack: 100,
                userOnly: true
            }
        },
        formats: [
            'header', 'bold', 'italic', 'underline', 'strike',
            'color', 'background', 'align', 'image'
        ]
    }), [readOnly, placeholder, imageHandler]);

    // 초기화 및 데이터 로딩
    useEffect(() => {
        const initializeEditor = async () => {
            if (!editorRef.current || quillRef.current || isInitializedRef.current) return;

            try {
                isInitializedRef.current = true;

                // Quill 생성
                // @ts-ignore
                const quill = new Quill(editorRef.current, quillConfig);

                // 초기 콘텐츠 설정
                // @ts-ignore
                const contentToSet = defaultValue || initialContent;
                if (contentToSet) {
                    // @ts-ignore
                    quill.clipboard.dangerouslyPasteHTML(contentToSet);

                    // 초기 이미지 URL 설정
                    const initialImageUrls = extractImageUrls(contentToSet);
                    currentImageUrlsRef.current = initialImageUrls;

                    // @ts-ignore
                    setWordCount(quill.getText().trim().length);
                    lastContentRef.current = contentToSet;
                }

                // 이벤트 리스너 등록
                // @ts-ignore
                quill.on('text-change', handleContentChange);

                quillRef.current = quill;
                setIsReady(true);

            } catch (error) {
                console.error('에디터 초기화 오류:', error);
                alert('에디터 로딩에 실패했습니다. 페이지를 새로고침해주세요.');
            }
        };

        initializeEditor();

        // 클린업
        return () => {
        };
    }, [defaultValue, initialContent, extractImageUrls, handleContentChange, quillConfig]);

    // 컴포넌트 언마운트시 cleanup
    useEffect(() => {
        return () => {
            if (quillRef.current) {
                // @ts-ignore
                quillRef.current.off('text-change', handleContentChange);
                quillRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, []);


    if (!isReady) {
        return <OverlayLoadingPage word={"에디터 로딩중..."}/>
    }

    return (
        <div className="post-editor-container" style={{ position: 'relative', zIndex: 1 }}>
            {/* 업로드 상태 표시 */}
            {isUploading && (
                <div className="upload-status">
                    <span>이미지 업로드 중...</span>
                </div>
            )}

            {/* Quill 에디터 */}
            <div className="editor-wrapper" style={{
                minHeight: '300px',
                position: 'relative',
                overflow: 'visible',
                zIndex: 1
            }}>
                <div ref={editorRef} className="quill-editor" style={{
                    position: 'relative',
                    zIndex: 1,
                    border: "none"
                }}/>
            </div>

            {/* 에디터 푸터 */}
            {!readOnly && (
                <div className="editor-footer">
                    <div className="word-count">
                        <span>글자 수: {wordCount.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostEditor;