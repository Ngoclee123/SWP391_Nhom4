// src/service/ProfileService.js
import axiosClient from "../api/axiosClient";
import UserService from "./userService";
import { jwtDecode } from 'jwt-decode';  


class ProfileService {
    async getAccountId() {
          const token = UserService.getToken();
    if (!token) throw new Error("No token found");

    const decoded = jwtDecode(token);
    console.log("Decoded token:", decoded); 

    const accountId = decoded.accountId;
    if (!accountId) throw new Error("No accountId found in token");

    return accountId;
    }

    async getUserProfile() {
        const accountId = await this.getAccountId();
        const response = await axiosClient.get(`/api/accounts/profile/${accountId}`);
        return response;
    }
  async updateUserProfile(profileData) {
        const accountId = await this.getAccountId();
        await axiosClient.put(`/api/accounts/profile/${accountId}`, profileData);
    }
}

export default new ProfileService();