import axios from "axios";
import { notAuthorizedErrorCode } from "../definition/errorCode";
import {
    appleRefreshAccessToken,
    googleRefreshAccessToken,
    kakaoRefreshAccessToken
} from "../definition/apiPath";
import {
    getSafeToken,
    setSafeToken,
    removeSafeToken,
    getSafeRedirectUrl,
    isValidOAuthType,
    getAxiosError
} from "./security";

/** 토큰 리프레시 진행 중인지 여부 (레이스 컨디션 방지) */
let isRefreshing = false;
/** 리프레시 대기 중인 요청 큐 */
let refreshSubscribers: ((token: string) => void)[] = [];

const clearLoginTokens = (): void => {
    removeSafeToken("hoppang-token");
    removeSafeToken("hoppang-login-oauthType");
};

const redirectToLogin = (redirectUrl?: string): void => {
    clearLoginTokens();
    window.location.href = getSafeRedirectUrl(redirectUrl || '/v2/login', '/v2/login');
};

/**
 * 리프레시 완료 후 대기 중인 요청들 실행
 */
const onRefreshed = (token: string): void => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

/**
 * 리프레시 실패 시 대기 중인 요청들 실패 처리
 */
const onRefreshFailed = (): void => {
    refreshSubscribers = [];
};

/**
 * OAuth 타입에 따른 리프레시 API 경로 반환
 */
const getRefreshEndpoints = (oauthType: string): { refreshApi: string } | null => {
    switch (oauthType) {
        case "KKO":
            return { refreshApi: kakaoRefreshAccessToken };
        case "APL":
            return { refreshApi: appleRefreshAccessToken };
        case "GLE":
            return { refreshApi: googleRefreshAccessToken };
        default:
            return null;
    }
};

/**
 * 토큰 리프레시 수행
 */
const refreshToken = async (oauthType: string, currentToken: string): Promise<string | null> => {
    const endpoints = getRefreshEndpoints(oauthType);
    if (!endpoints) {
        return null;
    }

    try {
        const response = await axios.put(
            `${endpoints.refreshApi}?expiredToken=${currentToken}`,
            {},
            { withCredentials: true }
        );

        const refreshedToken = response.headers['authorization'];
        if (refreshedToken && typeof refreshedToken === 'string') {
            setSafeToken("hoppang-token", refreshedToken);
            return refreshedToken;
        }
        return null;
    } catch (error) {
        const axiosError = getAxiosError(error);

        // errorCode 7: 리프레시 토큰 만료 또는 유실 - 백엔드가 내려준 OAuth URL로 재로그인
        if (axiosError?.data?.errorCode === 7) {
            redirectToLogin(axiosError.data.redirectUrl);
        }

        return null;
    }
};

/**
 * SWR 데이터 페처
 * 토큰 인증 및 자동 리프레시 처리
 */
const fetcher = async <T = unknown>(url: string): Promise<T | undefined> => {
    const token = getSafeToken("hoppang-token");

    if (!token) {
        return undefined;
    }

    try {
        const response = await axios.get<T>(url, {
            headers: {
                Authorization: token
            },
            withCredentials: true,
        });

        const currentToken = getSafeToken("hoppang-token");
        if (!currentToken) {
            window.location.reload();
        }

        return response.data;
    } catch (error) {
        const axiosError = getAxiosError(error);

        // 네트워크 에러 처리
        if (!axiosError) {
            console.error('Network error or request failed');
            return undefined;
        }

        const currentToken = getSafeToken("hoppang-token");

        // 403 에러: 토큰 만료 - 리프레시 시도
        if (currentToken && axiosError.status === 403) {
            const oauthType = getSafeToken("hoppang-login-oauthType");

            if (isValidOAuthType(oauthType)) {
                // 레이스 컨디션 방지: 이미 리프레시 중이면 대기
                if (isRefreshing) {
                    return new Promise((resolve) => {
                        refreshSubscribers.push((newToken: string) => {
                            // 새 토큰으로 재요청
                            axios.get<T>(url, {
                                headers: { Authorization: newToken },
                                withCredentials: true,
                            })
                                .then(res => resolve(res.data))
                                .catch(() => resolve(undefined));
                        });
                    });
                }

                isRefreshing = true;

                try {
                    const newToken = await refreshToken(oauthType, currentToken);

                    if (newToken) {
                        onRefreshed(newToken);
                        // 새 토큰으로 재요청
                        const retryResponse = await axios.get<T>(url, {
                            headers: { Authorization: newToken },
                            withCredentials: true,
                        });
                        return retryResponse.data;
                    } else {
                        onRefreshFailed();
                        clearLoginTokens();
                    }
                } finally {
                    isRefreshing = false;
                }
            }
        }

        // 인증되지 않은 에러: 로그인 페이지로 리다이렉트
        if (axiosError.status && notAuthorizedErrorCode.includes(axiosError.status)) {
            redirectToLogin();
        }

        return undefined;
    }
};

export default fetcher;
