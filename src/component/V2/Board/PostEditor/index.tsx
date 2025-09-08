import React, { useEffect, useState, useRef, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './styles.css';
import {callBoardsPostsImageUpload} from "../../../../definition/apiPath";

interface PostEditorProps {
    initialContent?: string;
    placeholder?: string;
    readOnly?: boolean;
    height?: string;
    imageUploadUrl?: string;
    imageDeleteUrl?: string;
    uploadHeaders?: Record<string, string>;
    onContentChange?: (content: string, delta: any, source: string) => void;
    contentSaver?: (field: string, content: any) => void;
    defaultValue?: string;
}

const PostEditor: React.FC<PostEditorProps> = ({
                                                   initialContent = '',
                                                   placeholder = '내용을 입력해주세요...',
                                                   readOnly = false,
                                                   height = '400',
                                                   imageUploadUrl = callBoardsPostsImageUpload,
                                                   imageDeleteUrl = callBoardsPostsImageUpload,
                                                   uploadHeaders = {},
                                                   onContentChange,
                                                   contentSaver,
                                                   defaultValue = ''
                                               }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isInitializedRef = useRef<boolean>(false);
    const lastContentRef = useRef<string>('');

    const initialEditorContent = defaultValue || initialContent;

    const [content, setContent] = useState<string>(initialEditorContent);
    const [wordCount, setWordCount] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);

    // 이미지 삭제 처리 함수
    const handleImageDelete = async (deletingFileUrls: string[]): Promise<void> => {
        try {
            console.log('이미지 삭제 시도:', deletingFileUrls);

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
            } else {
                console.error('이미지 삭제 실패:', response.status);
            }
        } catch (error) {
            console.error('이미지 삭제 에러:', error);
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

            const imageUrl = await response.text();

            if (!imageUrl) {
                throw new Error('이미지 URL을 받지 못했습니다.');
            }

            setCurrentImageUrls(prev =>
                prev.includes(imageUrl) ? prev : [...prev, imageUrl]
            );

            return imageUrl;

        } catch (error) {
            console.error('이미지 업로드 에러:', error);
            alert(error);
            return null;
        } finally {
            setIsUploading(false);
        }
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

            const quill = quillRef.current;
            if (!quill) return;

            // @ts-ignore
            const range = quill.getSelection(true);

            // 로딩 요소를 DOM에 직접 삽입
            const loadingElement = document.createElement('div');
            loadingElement.className = 'image-upload-loading';
            loadingElement.innerHTML = `
            <div class="upload-progress-container">
                <div class="upload-icon">📤</div>
                <div class="upload-text">이미지 업로드 중...</div>
                <div class="upload-progress-bar">
                    <div class="upload-progress-fill"></div>
                </div>
            </div>
        `;

            // Quill 에디터 내부에 직접 삽입
            // @ts-ignore
            const editorElement = quill.root;
            const paragraph = document.createElement('p');
            paragraph.appendChild(loadingElement);

            // 현재 커서 위치에 요소 삽입
            if (range.index === 0) {
                editorElement.insertBefore(paragraph, editorElement.firstChild);
            } else {
                const beforeElement = editorElement.children[Math.min(range.index, editorElement.children.length - 1)];
                editorElement.insertBefore(paragraph, beforeElement.nextSibling);
            }

            const imageUrl = await handleImageUpload(file);

            if (imageUrl) {
                // 로딩 요소 제거하고 이미지 삽입
                paragraph.remove();
                // @ts-ignore
                quill.insertEmbed(range.index, 'image', imageUrl);
                // @ts-ignore
                quill.setSelection(range.index + 1);
            } else {
                // 실패시 로딩 요소 제거
                paragraph.remove();
            }
        };
        input.click();
    }, [isUploading]);

    // 콘텐츠 변경 핸들러 - 디바운싱 적용
    const handleContentChange = useCallback((delta: any, oldDelta: any, source: string) => {
        const quill = quillRef.current;
        if (!quill) return;

        // @ts-ignore
        const currentContent = quill.root.innerHTML;
        // @ts-ignore
        const textLength = quill.getText().trim().length;

        // 내용이 실제로 변경되었을 때만 처리
        if (lastContentRef.current !== currentContent) {
            lastContentRef.current = currentContent;

            setContent(currentContent);
            setWordCount(textLength);

            // 이미지 URL 추적 및 삭제된 이미지 처리
            const remainedImageUrls = extractImageUrls(currentContent);
            const deletedImageUrls = currentImageUrls.filter(
                url => !remainedImageUrls.includes(url)
            );

            if (deletedImageUrls.length > 0) {
                handleImageDelete(deletedImageUrls);
            }
            setCurrentImageUrls(remainedImageUrls);

            // contentSaver 호출 - 디바운싱으로 처리
            if (contentSaver && source === 'user') {
                setTimeout(() => {
                    contentSaver('contentHtml', currentContent);
                    // @ts-ignore
                    contentSaver('contentText', quill.getText());
                }, 300);
            }

            // onContentChange 콜백 호출
            if (onContentChange) {
                onContentChange(currentContent, delta, source);
            }
        }
    }, [currentImageUrls, contentSaver, onContentChange, handleImageDelete]);

    // Quill 초기화
    useEffect(() => {
        if (editorRef.current && !quillRef.current && !isInitializedRef.current) {
            isInitializedRef.current = true;

            // @ts-ignore
            const quill = new Quill(editorRef.current, {
                theme: 'snow',
                readOnly,
                placeholder,
                modules: {
                    toolbar: readOnly ? false : {
                        container: [
                            [{ 'header': [1, 2, 3, 4, 5, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'align': [] }],
                            ['image'],
                        ],
                        handlers: {
                            image: imageHandler
                        }
                    },
                    history: {
                        delay: 2000,
                        maxStack: 500,
                        userOnly: true
                    }
                },
                formats: [
                    'header', 'bold', 'italic', 'underline', 'strike',
                    'color', 'background', 'list', 'bullet', 'align',
                    'image'
                ]
            });

            // 초기 내용 설정 - setContents 사용으로 변경
            if (initialEditorContent) {
                // innerHTML 대신 clipboard API 사용
                // @ts-ignore
                quill.clipboard.dangerouslyPasteHTML(initialEditorContent);

                // 초기 이미지 URLs 설정
                const initialImageUrls = extractImageUrls(initialEditorContent);
                setCurrentImageUrls(initialImageUrls);
                lastContentRef.current = initialEditorContent;
            }

            // 텍스트 변경 이벤트 리스너
            // @ts-ignore
            quill.on('text-change', handleContentChange);

            quillRef.current = quill;
        }

        // cleanup은 컴포넌트 언마운트시에만
        return () => {
            // 여기서는 cleanup 하지 않음
        };
    }, [readOnly, placeholder, imageHandler, handleContentChange]);

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

    // 내용 가져오기 헬퍼 함수
    const getEditorContent = () => {
        if (!quillRef.current) return { html: '', text: '', delta: null };

        return {
            // @ts-ignore
            html: quillRef.current.root.innerHTML,
            // @ts-ignore
            text: quillRef.current.getText(),
            // @ts-ignore
            delta: quillRef.current.getContents()
        };
    };

    // 내용이 비어있는지 확인하는 함수
    const isEmpty = () => {
        if (!quillRef.current) return true;

        // @ts-ignore
        const text = quillRef.current.getText().trim();
        // @ts-ignore
        const html = quillRef.current.root.innerHTML;

        return !text || html === '<p><br></p>' || html === '<div><br></div>';
    };

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
                height,
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