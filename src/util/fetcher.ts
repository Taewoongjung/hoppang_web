import axios from "axios";
import {notAuthorizedErrorCode} from "../definition/errorCode";
import {
    appleLogin,
    appleRefreshAccessToken, googleLogin,
    googleRefreshAccessToken,
    kakaoLogin,
    kakaoRefreshAccessToken
} from "../definition/apiPath";
import {isMobileClient} from "./index";

const fetcher = async (url: string) => {

    if (!isMobileClient()) {
        return;
    }

    if (localStorage.getItem("hoppang-token")) {
        return await axios.get(url, {
            headers: {
                withCredentials: true,
                Authorization: localStorage.getItem("hoppang-token")
            },
        }).then((response) => {
            const token = localStorage.getItem("hoppang-token");
            if (token == null) {
                window.location.reload();
            }
            return response.data;
        }).catch((error) => {
            const token = localStorage.getItem("hoppang-token");
            if (token && token !== "undefined" && error.response.status === 403) {

                let callRefreshAccessTokenApi = '';
                let callReSocialLogin = '';

                if (localStorage.getItem("hoppang-login-oauthType") === "KKO") {
                    callRefreshAccessTokenApi = kakaoRefreshAccessToken;
                    callReSocialLogin = kakaoLogin;
                }

                if (localStorage.getItem("hoppang-login-oauthType") === "APL") {
                    callRefreshAccessTokenApi = appleRefreshAccessToken;
                    callReSocialLogin = appleLogin;
                }

                if (localStorage.getItem("hoppang-login-oauthType") === "GLE") {
                    callRefreshAccessTokenApi = googleRefreshAccessToken;
                    callReSocialLogin = googleLogin;
                }

                if (callRefreshAccessTokenApi !== '' || callReSocialLogin !== '') {

                    axios.put(callRefreshAccessTokenApi + "?expiredToken=" + token, {
                        withCredentials: true
                    })
                        .then((response) => {
                            const refreshedToken = response.headers['authorization'];
                            localStorage.setItem("hoppang-token", refreshedToken); // 로그인 성공 시 로컬 스토리지에 토큰 갱신
                        })
                        .catch((error) => {
                            localStorage.setItem("hoppang-token", "undefined");
                            if (error.response.data.errorCode === 7) { // 리프레시 토큰이 만료 되었을 때
                                // 모든 토큰이 만료 되었으므로 다시 로그인을 요청 한다.
                                axios.post(callReSocialLogin, {}, {withCredentials: true})
                                    .then((res) => {
                                        window.location.href = res.data; // 로그인 화면으로 리다이렉팅
                                    })
                                    .catch((err) => {
                                        window.location.href = "/";
                                    })
                            }
                        });
                }
            }
            if (notAuthorizedErrorCode.includes(error.response.status)) {
                window.location.href = '/v2/login';
            }
        });
    }
};

export default fetcher;
