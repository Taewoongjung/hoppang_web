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
    const koreaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${koreaDate.getFullYear()}-${pad(koreaDate.getMonth() + 1)}-${pad(koreaDate.getDate())} ${pad(koreaDate.getHours())}:${pad(koreaDate.getMinutes())}:${pad(koreaDate.getSeconds())}`;
};

// 상세페이지용: 절대 날짜+시간 형식 (2024.12.17 14:30)
export const formatDetailTime = (dateString: string) => {
    const date = new Date(new Date(dateString).toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
};

// 리스트용: 상대 시간 형식
export const formatTimeAgo = (dateString: string) => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const date = new Date(new Date(dateString).toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return '방금';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;

    // 7일 이상: 날짜로 표시
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 같은 해면 월/일만, 다른 해면 년.월.일
    if (date.getFullYear() === now.getFullYear()) {
        return `${month}/${day}`;
    }
    return `${date.getFullYear().toString().slice(2)}.${month}.${day}`;
};
