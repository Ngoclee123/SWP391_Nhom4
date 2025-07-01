import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';
class UserService {
    setUser(token, username, fullName, accountId, role) {
        console.log('setUser called with:', { token, username, fullName, accountId, role });

        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('accountId', accountId);
        localStorage.setItem('role', role || 'USER');
    }

    getToken() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    return token; // Token còn hiệu lực
                }
                console.warn('Token expired');
                return null; // Yêu cầu làm mới
            } catch (e) {
                console.error('Invalid token:', e);
                return null;
            }
        }
        return null;
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
        let payload = { ...data };
        if (typeof payload.role === 'string') {
            payload.role = { rolename: payload.role };
        }
        return axiosClient.put(`/api/accounts/${id}`, payload);
    }
    async deleteAccount(id) {
        return axiosClient.delete(`/api/accounts/${id}`);
    }

    async getAccountStats() {
        return axiosClient.get('/api/accounts/stats');
    }

}

export default new UserService(); // Giữ nguyên export instance