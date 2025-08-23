import React, { useEffect, useState, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './styles.css';

// Quill 인스턴스를 위한 타입 정의
interface QuillInstance extends Quill {
    root: HTMLElement;
    on(eventName: string, handler: (...args: any[]) => void): void;
    getText(index?: number, length?: number): string;
    setContents(delta: any[], source?: string): void;
}

interface PostEditorProps {
    initialContent?: string;
    placeholder?: string;
    onContentChange?: (content: string, delta: any, source: string) => void;
    onSave?: (content: string) => void;
    readOnly?: boolean;
    height?: string;
}

const PostEditor: React.FC<PostEditorProps> = ({
                                                   initialContent = '',
                                                   placeholder = '내용을 입력해주세요...',
                                                   onContentChange,
                                                   onSave,
                                                   readOnly = false,
                                                   height = '400px'
                                               }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<QuillInstance | null>(null);
    const [content, setContent] = useState<string>(initialContent);
    const [wordCount, setWordCount] = useState<number>(0);

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
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
            }) as QuillInstance;

            // 초기 내용 설정
            if (initialContent) {
                quill.root.innerHTML = initialContent;
            }

            // 텍스트 변경 이벤트 리스너
            quill.on('text-change', (delta: any, oldDelta: any, source: string) => {
                const currentContent = quill.root.innerHTML;
                const textLength = quill.getText().trim().length;

                setContent(currentContent);
                setWordCount(textLength);

                if (onContentChange) {
                    onContentChange(currentContent, delta, source);
                }
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

    // 내용 초기화
    const handleClear = () => {
        if (quillRef.current) {
            quillRef.current.setContents([]);
            setContent('');
            setWordCount(0);
        }
    };

    // 저장 버튼 핸들러
    const handleSave = () => {
        if (onSave && quillRef.current) {
            const currentContent = quillRef.current.root.innerHTML;
            onSave(currentContent);
        }
    };

    return (
        <div className="post-editor-container">
            {/* 에디터 헤더 */}
            {!readOnly && (
                <div className="editor-header">
                    <div className="editor-title">
                        <h3>게시글 작성</h3>
                    </div>
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
        </div>
    );
};

export default PostEditor;
