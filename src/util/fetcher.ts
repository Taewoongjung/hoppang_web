import axios from "axios";
import {notAuthorizedErrorCode} from "../definition/errorCode";
import {
    appleLogin,
    appleRefreshAccessToken, googleLogin,
    googleRefreshAccessToken,
    kakaoLogin,
    kakaoRefreshAccessToken
} from "../definition/apiPath";
import {getSafeToken, setSafeToken, removeSafeToken, getSafeRedirectUrl, isValidOAuthType} from "./security";

const fetcher = async (url: string) => {
    const token = getSafeToken("hoppang-token");

    if (!token) {
        return;
    }

    return await axios.get(url, {
        headers: {
            withCredentials: true,
            Authorization: token
        },
    }).then((response) => {
        const currentToken = getSafeToken("hoppang-token");
        if (!currentToken) {
            window.location.reload();
        }
        return response.data;
    }).catch((error) => {
        if (!error.response) {
            console.error('Network error or request failed');
            return;
        }

        const currentToken = getSafeToken("hoppang-token");
        if (currentToken && error.response.status === 403) {
            const oauthType = getSafeToken("hoppang-login-oauthType");

            let callRefreshAccessTokenApi = '';
            let callReSocialLogin = '';

            if (isValidOAuthType(oauthType)) {
                switch (oauthType) {
                    case "KKO":
                        callRefreshAccessTokenApi = kakaoRefreshAccessToken;
                        callReSocialLogin = kakaoLogin;
                        break;
                    case "APL":
                        callRefreshAccessTokenApi = appleRefreshAccessToken;
                        callReSocialLogin = appleLogin;
                        break;
                    case "GLE":
                        callRefreshAccessTokenApi = googleRefreshAccessToken;
                        callReSocialLogin = googleLogin;
                        break;
                }
            }

            if (callRefreshAccessTokenApi !== '' && callReSocialLogin !== '') {
                axios.put(callRefreshAccessTokenApi + "?expiredToken=" + currentToken, {
                    withCredentials: true
                })
                    .then((response) => {
                        const refreshedToken = response.headers['authorization'];
                        if (refreshedToken) {
                            setSafeToken("hoppang-token", refreshedToken);
                        }
                    })
                    .catch((refreshError) => {
                        removeSafeToken("hoppang-token");
                        if (refreshError.response?.data?.errorCode === 7) {
                            axios.post(callReSocialLogin, {}, {withCredentials: true})
                                .then((res) => {
                                    // 오픈 리다이렉트 방지: URL 검증 후 이동
                                    const redirectUrl = typeof res.data === 'string' ? res.data : '/v2/login';
                                    window.location.href = getSafeRedirectUrl(redirectUrl, '/v2/login');
                                })
                                .catch(() => {
                                    window.location.href = "/v2/login";
                                });
                        }
                    });
            }
        }

        if (notAuthorizedErrorCode.includes(error.response.status)) {
            window.location.href = '/v2/login';
        }
    });
};

export default fetcher;
