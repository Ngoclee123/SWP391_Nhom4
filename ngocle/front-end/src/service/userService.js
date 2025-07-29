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


    

 getUserInfo() {
    if (!this.isLoggedIn()) {
      return null;
    }


    return {
      token: this.getToken(),
      username: localStorage.getItem("username"),
      fullName: localStorage.getItem("fullName"),
      accountId: parseInt(localStorage.getItem("accountId")),
      role: localStorage.getItem("role"),
    };
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



      //
      async getParentIdFromAccountId(accountId) {
        try {
          console.log("🔍 Getting parentId for accountId:", accountId);
    
    
          // Gọi API để lấy parentId từ account
          const response = await axiosClient.get(
            `/api/parents/account/${accountId}`
          );
    
    
          console.log("📋 API response:", response.data);
    
    
          const parentId = response.data?.parentId;
    
    
          if (parentId) {
            console.log("✅ Got parentId:", parentId);
            return parentId;
          } else {
            console.error("❌ No parentId found in response");
            throw new Error("Không tìm thấy thông tin phụ huynh");
          }
        } catch (error) {
          console.error("❌ Error getting parentId:", error);
          console.error("❌ Error details:", error.response?.data);
          throw error;
        }
      }
    
      /**
   * Tạm thời hardcode mapping từ account_id sang parent_id
   * Dựa trên database hiện tại của bạn
   */
  getParentIdFromAccountIdTemp(accountId) {
    console.log(
      "🔧 Using temporary hardcode mapping for account_id:",
      accountId
    );
    // Từ database của bạn:
    // account_id = 1 -> parent_id = 1
    // account_id = 5 -> parent_id = 2
    const mapping = {
      1: 1,
      5: 2,
    };
    const parentId = mapping[accountId];
    console.log("🎯 Mapped parent_id:", parentId);


    return parentId || null;
  }
  // CRUD Account APIs
  async getAllAccounts() {
    return axiosClient.get("/api/accounts");
  }
  async getAccountById(id) {
    return axiosClient.get(`/api/accounts/${id}`);
  }


  async getParentId() {
    let parentId = localStorage.getItem("parentId");
    if (!parentId) {
      try {
        const accountId = this.getAccountId();
        if (accountId) {
          console.log("Fetching parentId for accountId:", accountId);
          const response = await axiosClient.get(
            `/api/parents/account/${accountId}`
          );
          parentId = response.data.parentId; // Sử dụng endpoint mới
          if (parentId) {
            localStorage.setItem("parentId", parentId);
            console.log("Fetched and stored parentId:", parentId);
          } else {
            console.warn(
              "No parentId returned from API for accountId:",
              accountId
            );
          }
        } else {
          console.warn("No accountId found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching parentId:", error);
        parentId = null; // Không throw để fallback tiếp
      }
    } else {
      console.log("Using cached parentId:", parentId);
    }
    return parentId;
  }





}

export default new UserService(); // Giữ nguyên export instance