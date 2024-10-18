import axios from "axios";
import {notAuthorizedErrorCode} from "../definition/errorCode";
import {kakaoLogin, kakaoRefreshAccessToken} from "../definition/apiPath";

const fetcher = async (url: string) => {

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
                axios.put(kakaoRefreshAccessToken + "?expiredToken=" + token, {
                    withCredentials: true
                })
                    .then((response) => {
                        const refreshedToken = response.headers['authorization'];
                        localStorage.setItem("hoppang-token", refreshedToken); // 로그인 성공 시 로컬 스토리지에 토큰 갱신
                    })
                    .catch((error) => {
                        if (error.response.data.errorCode === 7) { // 리프레시 토큰이 만료 되었을 때
                            // 모든 토큰이 만료 되었으므로 다시 로그인을 요청 한다.
                            axios.post(kakaoLogin, {}, {withCredentials: true})
                                .then((res) => {
                                    console.log("All headers:", res.headers);
                                    console.log("Authorization header:", res.headers['authorization']);
                                    const token = res.headers['authorization'];
                                    localStorage.setItem("hoppang-token", token); // 로그인 성공 시 로컬 스토리지에 토큰 저장

                                    window.location.href = res.data; // 로그인 화면으로 리다이렉팅
                                })
                                .catch((err) => {
                                })
                        }
                    })
            }
            if (notAuthorizedErrorCode.includes(error.response.status)) {
                window.location.href = '/login';
            }
        });
    }
};

export default fetcher;
