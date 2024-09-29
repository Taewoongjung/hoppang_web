import axios from "axios";
import {notAuthorizedErrorCode} from "../definition/admin/errorCode";

const adminFetcher = async (url: string) => await axios.get(url, {
    headers: {
        withCredentials: true,
        Authorization: localStorage.getItem("hoppang-admin-token")
    },
}).then((response) => {
    const token = localStorage.getItem("hoppang-admin-token");
    if (token == null) {
        window.location.reload();
    }

    return response.data;
}).catch((error) => {
    if (notAuthorizedErrorCode.includes(error.response.status)) {
        window.location.href = '/admin/login';
    }
});

export default adminFetcher;
