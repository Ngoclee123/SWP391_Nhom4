import axios from "axios";
import queryString from 'query-string';
import UserService from "../service/userService";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'content-type': 'application/json',
    },
    paramsSerializer: params => queryString.stringify(params),
    withCredentials: true,
});

axiosClient.interceptors.request.use(async (req) => {
    const token = UserService.getToken();
    console.log("Interceptor - Request to:", req.url, "Method:", req.method, "Token:", token ? "Present" : "Absent");

    if (token && !req.url.match(/\/api\/(login|register|auth\/google\/callback|oauth2\/authorization\/google|login\/oauth2\/code\/|login|oauth2\/redirect)/)) {
        req.headers = req.headers || {};
        req.headers.Authorization = `Bearer ${token}`;
        console.log("Headers sent:", req.headers);
        console.log("Interceptor - Added Authorization header for:", req.url);
    } else if (token) {
        console.log("Interceptor - Token present but skipped for:", req.url);
    } else {
        console.warn("No valid token available, redirecting to login for:", req.url);
        window.location.href = '/login';
    }

    return req;
}, (error) => {
    return Promise.reject(error);
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.warn('Token expired or invalid, redirecting to login for:', originalRequest.url);
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

const handleOAuthRedirect = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role');
    const username = urlParams.get('username');
    const fullName = urlParams.get('fullName');
    const accountId = urlParams.get('accountId');

    if (token && role) {
        UserService.setUser(token, username, fullName, accountId);
        console.log("OAuth redirect: Token set, Role:", role, "Redirecting to:", role.toLowerCase() === "user" ? "/home" : "/login");
        if (role.toLowerCase() === "user") {
            window.location.href = "/home";
        } else {
            window.location.href = "/login";
        }
    } else {
        console.warn("OAuth redirect: Missing token or role");
    }
};

export { handleOAuthRedirect };
export default axiosClient;