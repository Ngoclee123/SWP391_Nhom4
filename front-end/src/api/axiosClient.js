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
    if (token && !req.url.includes("/api/login") && !req.url.includes("/api/register") && !req.url.startsWith("/api/doctor-availability/doctor/1/available") && !req.url.startsWith("/api/doctors")) {
        req.headers = req.headers || {};
        req.headers.Authorization = "Bearer " + token;
    }
    return req; 
});

axiosClient.interceptors.response.use(
    (response) => {
        console.log('Response:', response);
        if (response && response.data) {
            return response.data;
        }
        return []; // Trả về mảng rỗng nếu không có data
    },
    (error) => {
        console.error('Axios error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
        });
        throw error;
    }
);

export default axiosClient;