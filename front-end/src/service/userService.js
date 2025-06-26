import { jwtDecode } from 'jwt-decode';

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

    // Thêm phương thức decodeToken
    decodeToken(token) {
        try {
            return jwtDecode(token);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }
}

export default new UserService();