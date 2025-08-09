import React from "react";

export const formatUserName = (name: any) => {
    if (name === "탈퇴유저") {
        return (
            <span style={{ color: "gray", fontStyle: "italic" }}>
        탈퇴유저
      </span>
        );
    }
    return name;
}

export const formatDateTime = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 48) return '1일 전';
    return `${Math.floor(diffInHours / 24)}일 전`;
};
