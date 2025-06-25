import { jwtDecode } from 'jwt-decode';

class UserService {
    setUser(token, username, fullName, accountId) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('accountId', accountId);
        const decodedToken = jwtDecode(token);
        const role = decodedToken.role || 'USER';
        localStorage.setItem('role', role);
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
}

export default new UserService(); // Giữ nguyên export instance