import axios from "axios";
import {notAuthorizedErrorCode} from "../definition/Admin/errorCode";
import {getSafeToken} from "./security";

const adminFetcher = async (url: string) => {
    const token = getSafeToken("hoppang-admin-token");

    if (!token) {
        window.location.href = '/admin/login';
        return;
    }

    return await axios.get(url, {
        headers: {
            withCredentials: true,
            Authorization: token
        },
    }).then((response) => {
        const currentToken = getSafeToken("hoppang-admin-token");
        if (!currentToken) {
            window.location.reload();
        }

        return response.data;
    }).catch((error) => {
        if (!error.response) {
            console.error('Network error or request failed');
            return;
        }

        if (notAuthorizedErrorCode.includes(error.response.status)) {
            window.location.href = '/admin/login';
        }
    });
};

export default adminFetcher;
