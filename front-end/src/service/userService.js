class UserService {
    setUser(token, username, fullName) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('fullName', fullName);
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

    removeUser() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
    }

    isLoggedIn() {
        return !!this.getToken();
    }
}

export default new UserService();