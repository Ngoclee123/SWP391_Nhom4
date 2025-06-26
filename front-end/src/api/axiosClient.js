import axios from "axios";
  import queryString from 'query-string';
  import UserService from "../service/userService";

  const axiosClient = axios.create({
      baseURL: "http://localhost:8080",
      headers: {
          'content-type': 'application/json',
      },
      paramsSerializer: params => queryString.stringify(params),
      withCredentials: true,
  });
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Giả sử token được lưu trong localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request:', token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

  axiosClient.interceptors.response.use(
      (response) => {
          console.log("Response from:", response.config.url, "Status:", response.status, "Raw Data:", response.data);
          return response.data || [];
      },
      (error) => {
          console.error('Axios error:', error.response ? error.response.data : error.message, "Status:", error.response?.status);
          throw error;
      }
  );

  const handleOAuthRedirect = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const role = urlParams.get('role');
      const username = urlParams.get('username');
      const fullName = urlParams.get('fullName');
      const accountId = urlParams.get('accountId');

      if (token && role) {
          UserService.setUser(token, username, fullName, accountId);
          console.log("OAuth redirect: Token set, Role:", role, "Redirecting to:", role.toLowerCase() === "user" ? "/home" : "/login");
          if (role.toLowerCase() === "user") {
              window.location.href = "/home";
            }  else if (role.toLowerCase() === "doctor") {
                window.location.href = "/doctor-dashboard";
             } else if (role.toLowerCase() === "admin") {
                    window.location.href = "/admin-dashboard";
          } else {
        
              window.location.href = "/login";
          }
      } else {
          console.warn("OAuth redirect: Missing token or role");
      }
  };

  if (window.location.pathname === '/home' && window.location.search) {
      handleOAuthRedirect();
  }

  export default axiosClient;