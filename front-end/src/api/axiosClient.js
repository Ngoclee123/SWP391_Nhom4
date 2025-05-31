import axios from "axios";
import queryString from 'query-string';
import UserService from "../service/userService"; // Nhập instance trực tiếp

const axiosClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'content-type': 'application/json',
    },
    paramsSerializer: params => queryString.stringify(params),  
});

axiosClient.interceptors.request.use(async (req) => {
    const token = UserService.getToken();
    if (token && !req.url.includes("/api/login") && !req.url.includes("/api/register")) {
        req.headers.common.Authorization = "Bearer " + token;
    }
    return req;
});

axiosClient.interceptors.response.use((response) => {
    if (response && response.data) {
        return response.data;
    }
    return response;
}, (error) => { throw error; });

export default axiosClient;