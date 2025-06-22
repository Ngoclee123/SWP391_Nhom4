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

  axiosClient.interceptors.request.use(async (req) => {
      const token = UserService.getToken();
      console.log("Request to:", req.url, "Token:", token ? "Present" : "Absent");

      if (token && !req.url.match(/\/api\/(login|register|auth\/google\/callback|oauth2\/authorization\/google|login\/oauth2\/code\/|login|oauth2\/redirect|vnpay|doctors|vaccine-appointments\/availability)/)) {
          req.headers = req.headers || {};
          req.headers.Authorization = `Bearer ${token}`;
          console.log("Added Authorization header for:", req.url);
      } else if (token) {
          console.log("Token present but skipped for:", req.url);
      }

      return req;
  });

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