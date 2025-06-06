class UserService {
    setUser(token, username, fullName,accountId) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('accountId', accountId);
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
        return localStorage.getItem('accountId'); // Lấy accountId
    }

    removeUser() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('accountId');
    }

    isLoggedIn() {
        return !!this.getToken();
    }
}

export default new UserService();