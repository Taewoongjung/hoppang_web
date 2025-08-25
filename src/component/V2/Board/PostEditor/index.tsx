import React, { useEffect, useState, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './styles.css';

interface PostEditorProps {
    initialContent?: string;
    placeholder?: string;
    onContentChange?: (content: string, delta: any, source: string) => void;
    readOnly?: boolean;
    height?: string;
}

const PostEditor: React.FC<PostEditorProps> = ({
   initialContent = '',
   placeholder = '내용을 입력해주세요...',
   onContentChange,
   readOnly = false,
   height = '400px'
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const [content, setContent] = useState<string>(initialContent);
    const [wordCount, setWordCount] = useState<number>(0);

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            // Quill 설정
            // @ts-ignore
            const quill = new Quill(editorRef.current, {
                theme: 'snow',
                readOnly,
                placeholder,
                modules: {
                    toolbar: readOnly ? false : [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        [ 'image'],
                        ['clean']
                    ],
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
    }, [initialContent, placeholder, onContentChange, readOnly]);

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
        // if (!onSave || !quillRef.current) return;

        if (isEmpty()) {
            alert('내용을 입력해주세요.');
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
                    {/*<div className="editor-title">*/}
                    {/*    <h3>게시글 작성</h3>*/}
                    {/*</div>*/}
                    <div className="editor-actions">
                        <button
                            className="btn-clear"
                            onClick={handleClear}
                            type="button"
                        >
                            초기화
                        </button>
                        <button
                            className="btn-save"
                            onClick={handleSave}
                            type="button"
                        >
                            저장
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostEditor;
