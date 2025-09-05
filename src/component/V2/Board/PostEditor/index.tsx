import React, { useEffect, useState, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './styles.css';
import {callBoardsPostsImageUpload} from "../../../../definition/apiPath";

interface PostEditorProps {
    initialContent?: string;
    placeholder?: string;
    onContentChange?: (content: string, delta: any, source: string) => void;
    readOnly?: boolean;
    height?: string;
    // 이미지 업로드 API 엔드포인트
    imageUploadUrl?: string;
    // 이미지 업로드 시 추가 헤더 (인증 토큰 등)
    uploadHeaders?: Record<string, string>;
}

const PostEditor: React.FC<PostEditorProps> = ({
                                                   initialContent = '',
                                                   placeholder = '내용을 입력해주세요...',
                                                   onContentChange,
                                                   readOnly = false,
                                                   height = '400px',
                                                   imageUploadUrl = callBoardsPostsImageUpload,
                                                   uploadHeaders = {}
                                               }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const [content, setContent] = useState<string>(initialContent);
    const [wordCount, setWordCount] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);

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
                    // Authorization: localStorage.getItem("hoppang-token") || '',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFpcG9vaDg4ODJAbmF2ZXIuY29tIiwicm9sZSI6IlJPTEVfQ1VTVE9NRVIiLCJvQXV0aFR5cGUiOiJLS08iLCJpYXQiOjE3NTcwMzQ0NTUsImV4cCI6MTc1NzA1NjA1NH0.FkLiuVD3JbeSnDsx4ofcgMlK2xrGlbjqyBGoCoT40lU',
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`업로드 실패: ${response.status}`);
            }

            const imageUrl = await response.text();

            if (!imageUrl) {
                throw new Error('이미지 URL을 받지 못했습니다.');
            }

            return imageUrl;

        } catch (error) {
            console.error('이미지 업로드 에러:', error);
            alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // Quill 이미지 핸들러 커스터마이징
    const imageHandler = () => {
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

            // 파일 크기 검증 (예: 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('파일 크기는 10MB를 초과할 수 없습니다.');
                return;
            }

            // 파일 타입 검증
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }

            const quill = quillRef.current;
            if (!quill) return;

            // @ts-ignore
            // 현재 커서 위치 저장
            const range = quill?.getSelection(true);

            // 임시 로딩 이미지 삽입
            const loadingImageData = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuyXheyUnOuTnCDspJEuLi48L3RleHQ+Cjwvc3ZnPg==';
            // @ts-ignore
            quill?.insertEmbed(range.index, 'image', loadingImageData);

            // 이미지 업로드 실행
            const imageUrl = await handleImageUpload(file);

            if (imageUrl) {
                // 업로드 성공 시 로딩 이미지를 실제 URL로 대체
                // @ts-ignore
                quill?.deleteText(range.index, 1);
                // @ts-ignore
                quill?.insertEmbed(range.index, 'image', imageUrl);
                // @ts-ignore
                quill?.setSelection(range.index + 1);

                console.log('이미지 업로드 성공:', imageUrl);
            } else {
                // 업로드 실패 시 로딩 이미지 제거
                // @ts-ignore
                quill?.deleteText(range.index, 1);
            }
        };

        input.click();
    };

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {

            // Quill 설정
            // @ts-ignore
            const quill = new Quill(editorRef.current, {
                theme: 'snow',
                readOnly,
                placeholder,
                modules: {
                    toolbar: readOnly ? false : {
                        container: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'align': [] }],
                            ['image'],
                            ['clean']
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

            // 초기 내용 설정
            if (initialContent) {
                // @ts-ignore
                quill.root.innerHTML = initialContent;
            }

            // 텍스트 변경 이벤트 리스너
            // @ts-ignore
            quill.on('text-change', (delta, oldDelta, source) => {
                // @ts-ignore
                const currentContent = quill.root.innerHTML;
                // @ts-ignore
                const textLength = quill.getText().trim().length;

                setContent(currentContent);
                setWordCount(textLength);

                if (onContentChange) {
                    onContentChange(currentContent, delta, source);
                }

                // 디버깅용 로그
                console.log('Content changed:', {
                    htmlContent: currentContent,
                    textLength: textLength,
                    source: source
                });
            });

            quillRef.current = quill;
        }

        // cleanup
        return () => {
            if (quillRef.current) {
                quillRef.current = null;
            }
        };
    }, [initialContent, placeholder, onContentChange, readOnly, imageUploadUrl]);

    // 내용 가져오기 헬퍼 함수
    const getEditorContent = () => {
        if (!quillRef.current) return { html: '', text: '', delta: null };

        return {
            // @ts-ignore
            html: quillRef.current?.root.innerHTML,
            // @ts-ignore
            text: quillRef.current?.getText(),
            // @ts-ignore
            delta: quillRef.current?.getContents()
        };
    };

    // 내용이 비어있는지 확인하는 함수
    const isEmpty = () => {
        if (!quillRef.current) return true;

        // @ts-ignore
        const text = quillRef.current?.getText().trim();
        // @ts-ignore
        const html = quillRef.current?.root.innerHTML;

        // 비어있거나 기본 빈 태그만 있는 경우
        return !text || html === '<p><br></p>' || html === '<div><br></div>';
    };

    // 내용 초기화
    const handleClear = () => {
        if (quillRef.current) {
            // @ts-ignore
            quillRef.current?.setContents([]);
            setContent('');
            setWordCount(0);
        }
    };

    // 저장 버튼 핸들러
    const handleSave = () => {
        console.log("@@ = ", quillRef.current);

        if (isEmpty()) {
            alert('내용을 입력해주세요.');
            return;
        }

        if (isUploading) {
            alert('이미지 업로드가 진행 중입니다. 완료 후 다시 시도해주세요.');
            return;
        }

        const { html, text, delta } = getEditorContent();

        console.log('저장할 내용:', {
            html,
            textLength: text.length,
            isEmpty: isEmpty()
        });
    };

    return (
        <div className="post-editor-container">
            {/* 업로드 상태 표시 */}
            {isUploading && (
                <div className="upload-status">
                    <span>이미지 업로드 중...</span>
                </div>
            )}

            {/* Quill 에디터 */}
            <div className="editor-wrapper" style={{ height }}>
                <div ref={editorRef} className="quill-editor" />
            </div>

            {/* 에디터 푸터 */}
            {!readOnly && (
                <div className="editor-footer">
                    <div className="word-count">
                        <span>글자 수: {wordCount.toLocaleString()}</span>
                    </div>
                </div>
            )}
            {!readOnly && (
                <div className="editor-header">
                    <div className="editor-actions">
                        <button
                            className="btn-clear"
                            onClick={handleClear}
                            type="button"
                            disabled={isUploading}
                        >
                            초기화
                        </button>
                        <button
                            className="btn-save"
                            onClick={handleSave}
                            type="button"
                            disabled={isUploading}
                        >
                            {isUploading ? '업로드 중...' : '저장'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostEditor;
