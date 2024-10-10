import axios from "axios";
import {notAuthorizedErrorCode} from "../definition/errorCode";
import {kakaoRefreshAccessToken} from "../definition/apiPath";

const fetcher = async (url: string) => await axios.get(url, {
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
    if (token && error.response.status === 403) {
        axios.put(kakaoRefreshAccessToken + "?expiredToken=" + token, {
            withCredentials: true
        })
            .then((response) => {
                const refreshedToken = response.headers['authorization'];
                localStorage.setItem("hoppang-token", refreshedToken); // 로그인 성공 시 로컬 스토리지에 토큰 갱신
            });
    }
    if (notAuthorizedErrorCode.includes(error.response.status)) {
        window.location.href = '/login';
    }
});

export default fetcher;
