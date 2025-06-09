import axios from "axios";
import queryString from 'query-string';
import UserService from "../service/userService";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'content-type': 'application/json',
    },
    paramsSerializer: params => queryString.stringify(params),  
});

axiosClient.interceptors.request.use(async (req) => {
    const token = UserService.getToken();
    if (token && !req.url.includes("/api/login") && !req.url.includes("/api/register") && !req.url.startsWith("/api/auth/google/callback") && !req.url.startsWith("/api/doctors")) {
        req.headers = req.headers || {};
        req.headers.Authorization = "Bearer " + token;
    }
    return req;
});

axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
            return response.data;
        }
        return [];
    },
    (error) => {
        console.error('Axios error:', error);
        throw error;
    }
);

// Hàm xử lý redirect từ Google OAuth
const handleOAuthRedirect = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role');
    const username = urlParams.get('username');
    const fullName = urlParams.get('fullName');
    const accountId = urlParams.get('accountId');

    if (token && role) {
        UserService.setUser(token, username, fullName, accountId);
        if (role.toLowerCase() === "user") {
            window.location.href = "/home";
        } else {
            window.location.href = "/login";
        }
    }
};

// Gọi handleOAuthRedirect khi component mount
if (window.location.pathname === '/home' && window.location.search) {
    handleOAuthRedirect();
}

export default axiosClient;