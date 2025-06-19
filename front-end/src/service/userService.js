class UserService {
    setUser(token, refreshToken, username, fullName, accountId, roleId, roleName) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('accountId', accountId);
        localStorage.setItem('roleId', roleId);
        localStorage.setItem('roleName', roleName);
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

    getRoleId() {
        return localStorage.getItem('roleId');
    }

    getRoleName() {
        return localStorage.getItem('roleName');
    }

    removeUser() {
        localStorage.removeItem('token');
    
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('accountId');
        localStorage.removeItem('roleId');
        localStorage.removeItem('roleName');
    }

    isLoggedIn() {
        return !!this.getToken();
    }
isDoctor() {
        const roleId = this.getRoleId();
        const roleName = this.getRoleName();
        console.log('RoleId:', roleId, 'RoleName:', roleName); // Debug
        return roleId === '3' || roleName === 'DOCTOR';
    }

    
}

export default new UserService();