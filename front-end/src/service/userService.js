import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';

class UserService {
    setUser(token, username, fullName, accountId) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('accountId', accountId);
        // Lưu vai trò từ token
        const decodedToken = jwtDecode(token);
        const role = decodedToken.role || 'USER'; // Giả sử role được nhúng trong token
        localStorage.setItem('role', role);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    getUsername() {
        return localStorage.getItem('username');
    }

    getFullName() {
        return localStorage.getItem('fullName');
    }

    getAccountId() {
        return localStorage.getItem('accountId');
    }

    getRole() {
        return localStorage.getItem('role') || 'USER';
    }

    removeUser() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('accountId');
        localStorage.removeItem('role');
    }

    isLoggedIn() {
        return !!this.getToken();
    }

    // CRUD Account APIs
    async getAllAccounts() {
        return axiosClient.get('/api/accounts');
    }
    async getAccountById(id) {
        return axiosClient.get(`/api/accounts/${id}`);
    }
    async createAccount(data) {
        const { role, ...accountData } = data;
        return axiosClient.post(`/api/accounts?role=${role}`, accountData);
    }
    async updateAccount(id, data) {
        // Đảm bảo truyền role là object nếu backend yêu cầu
        return axiosClient.put(`/api/accounts/${id}`, data);
    }
    async deleteAccount(id) {
        return axiosClient.delete(`/api/accounts/${id}`);
    }
}

export default new UserService();