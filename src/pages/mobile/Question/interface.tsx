export interface Question {
    id: number;
    category: any;
    title: string;
    content: string;
    author: string;
    isAnonymous: boolean;
    createdAt: string;
    replyCount: number;
    viewCount: number;
    isAnswered: boolean;
    tags?: string[];
    imageCount?: number;
}
