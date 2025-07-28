// import { jwtDecode } from 'jwt-decode';
// import axiosClient from '../api/axiosClient';
// class UserService {
//     setUser(token, username, fullName, accountId, role) {
//         console.log('setUser called with:', { token, username, fullName, accountId, role });

//         localStorage.setItem('token', token);
//         localStorage.setItem('username', username);
//         localStorage.setItem('fullName', fullName);
//         localStorage.setItem('accountId', accountId);
//         localStorage.setItem('role', role || 'USER');
//     }

//     getToken() {
//         const token = localStorage.getItem('token');
//         if (token) {
//             try {
//                 const decoded = jwtDecode(token);
//                 if (decoded.exp * 1000 > Date.now()) {
//                     return token; // Token còn hiệu lực
//                 }
//                 console.warn('Token expired');
//                 return null; // Yêu cầu làm mới
//             } catch (e) {
//                 console.error('Invalid token:', e);
//                 return null;
//             }
//         }
//         return null;
//     }

//     getUsername() {
//         return localStorage.getItem('username');
//     }

//     getFullName() {
//         return localStorage.getItem('fullName');
//     }

//     getAccountId() {
//         return localStorage.getItem('accountId');
//     }

//     getRole() {
//         return localStorage.getItem('role') || 'USER';
//     }

//     removeUser() {
//         localStorage.removeItem('token');
//         localStorage.removeItem('username');
//         localStorage.removeItem('fullName');
//         localStorage.removeItem('accountId');
//         localStorage.removeItem('role');
//     }

//     isLoggedIn() {
//         return !!this.getToken();
//     }

//   // CRUD Account APIs
//     async getAllAccounts() {
//         return axiosClient.get('/api/accounts');
//     }
//     async getAccountById(id) {
//         return axiosClient.get(`/api/accounts/${id}`);
//     }
    
//     async createAccount(data) {
//         let { role, ...accountData } = data;
//         // Nếu role là object, lấy rolename, nếu là string thì giữ nguyên
//         if (typeof role === 'object' && role !== null) {
//             role = role.rolename;
//         }
//         // Đảm bảo truyền passwordHash, không truyền password
//         if (accountData.password) {
//             accountData.passwordHash = accountData.password;
//             delete accountData.password;
//         }
//         // Gọi API đúng chuẩn BE yêu cầu
//         return axiosClient.post(`/api/accounts?role=${role}`, accountData);
//     }

    
    

//     async updateAccount(id, data) {
//         // Đảm bảo truyền role là object nếu backend yêu cầu
//         let payload = { ...data };
//         if (typeof payload.role === 'string') {
//             payload.role = { rolename: payload.role };
//         }
//         return axiosClient.put(`/api/accounts/${id}`, payload);
//     }
//     async deleteAccount(id) {
//         return axiosClient.delete(`/api/accounts/${id}`);
//     }

//     async getAccountStats() {
//         return axiosClient.get('/api/accounts/stats');
//     }
//     async getPatients() {
//         try {
//           const response = await axiosClient.get("/api/parents/patients");
//           return response;
//         } catch (error) {
//           console.error("Error getting patients:", error);
//           throw error;
//         }
//       }
// }

// export default new UserService(); // Giữ nguyên export instance

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
        let { role, ...accountData } = data;
        // Nếu role là object, lấy rolename, nếu là string thì giữ nguyên
        if (typeof role === 'object' && role !== null) {
            role = role.rolename;
        }
        // Đảm bảo truyền passwordHash, không truyền password
        if (accountData.password) {
            accountData.passwordHash = accountData.password;
            delete accountData.password;
        }
        // Nếu là doctor thì gọi API riêng admin
        if (role && (role.toLowerCase() === 'doctor')) {
            return axiosClient.post('/api/admin/accounts/create-doctor', accountData);
        }
        // Gọi API đúng chuẩn BE yêu cầu cho các role khác
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
    async getPatients() {
        try {
          const response = await axiosClient.get("/api/parents/patients");
          return response;
        } catch (error) {
          console.error("Error getting patients:", error);
          throw error;
        }
      }
}

export default new UserService(); // Giữ nguyên export instance