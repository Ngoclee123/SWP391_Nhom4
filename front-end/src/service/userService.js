import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";

class UserService {
  setUser(token, username, fullName, accountId) {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("fullName", fullName);
    localStorage.setItem("accountId", accountId);
    // Lưu vai trò từ token
    const decodedToken = jwtDecode(token);
    const role = decodedToken.role || "USER"; // Giả sử role được nhúng trong token
    localStorage.setItem("role", role);
  }

  getToken() {
    return localStorage.getItem("token");
  }

  getUsername() {
    return localStorage.getItem("username");
  }

  getFullName() {
    return localStorage.getItem("fullName");
  }

  getAccountId() {
    return localStorage.getItem("accountId");
  }

  getRole() {
    return localStorage.getItem("role");
  }

  removeUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    localStorage.removeItem("accountId");
    localStorage.removeItem("role");
  }

  isLoggedIn() {
    return !!localStorage.getItem("token");
  }

  async login(username, password) {
    try {
      const response = await axiosClient.post("/api/auth/login", {
        username,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("accountId", response.data.accountId);
        localStorage.setItem("role", response.data.role);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("accountId");
    localStorage.removeItem("role");
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

export default new UserService();
