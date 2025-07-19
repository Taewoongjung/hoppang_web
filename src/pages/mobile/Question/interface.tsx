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
    isBookmarked: boolean;
}

export interface Board {
    id: any;
    name: string;
    branchBoards: BranchBoard[]
}

export interface BranchBoard {
    id: any;
    name: string;
}
