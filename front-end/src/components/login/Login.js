import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import UserService from '../../service/userService';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Kiểm tra nếu quay lại từ Google OAuth
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        if (token) {
            const role = urlParams.get('role');
            const username = urlParams.get('username');
            const fullName = urlParams.get('fullName');
            const accountId = urlParams.get('accountId');
            UserService.setUser(token, username, fullName, accountId);
            if (role && role.toLowerCase() === "user") {
                navigate('/home', { replace: true });
            } else if (role && role.toLowerCase() === "doctor") {
                navigate('/doctor-dashboard', { replace: true });
            } else if (role && role.toLowerCase() === "admin") {
                navigate('/admin-dashboard', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        }
    }, [location.search, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Current pathname:", location.pathname); // Debug
        const endpoint = '/api/login'; // Sử dụng endpoint duy nhất

        try {
            const response = await axiosClient.post(endpoint, {
                username: username.trim(),
                password: password.trim(),
            });
            UserService.setUser(response.token, response.username, response.fullName, response.accountId);
            setError('');
            console.log('Đăng nhập thành công:', { 
                username: response.username, 
                fullName: response.fullName, 
                accountId: response.accountId, 
                role: response.role 
            });

            // Chuyển hướng dựa trên vai trò, không phụ thuộc location.state
            if (response.role.toLowerCase() === 'doctor') {
                navigate('/doctor-dashboard', { replace: true });
            } else if (response.role.toLowerCase() === 'admin') {
                navigate('/admin-dashboard', { replace: true }); // Đảm bảo chuyển đến admin-dashboard
            } else {
                navigate('/home', { replace: true }); // Mặc định là home cho user
            }
        } catch (error) {
            console.error('Đăng nhập thất bại:', error);
            if (error.response && error.response.data) {
                setError(error.response.data);
            } else {
                setError('Đã có lỗi xảy ra, vui lòng thử lại!');
            }
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const isFormValid = username.trim() !== '' && password.trim() !== '';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 pt-20 relative">
            <div className="hidden md:flex w-1/2 justify-center items-center">
                <img
                    src="/images/Logo.jpg"
                    alt="Đặt khám dễ dàng hơn"
                    className="w-[450px] max-w-full h-auto rounded-full shadow-xl transform hover:scale-105 transition duration-300"
                />
            </div>
            <div className="w-full md:w-1/2 flex justify-center items-center">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border-t-4 border-blue-500">
                    <h2 className="text-3xl font-extrabold text-blue-900 mb-8 text-center">Đăng nhập</h2>
                    {error && <p className="text-red-600 text-center mb-6 font-medium">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-gray-800 font-semibold mb-2">
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                placeholder="Nhập tên đăng nhập của bạn"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-gray-800 font-semibold mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                placeholder="Nhập mật khẩu"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 ${isFormValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!isFormValid}
                        >
                            Đăng nhập
                        </button>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 bg-red-600 hover:bg-red-700`}
                        >
                            Đăng nhập với Google
                        </button>
                    </form>
                    <div className="mt-6 text-center text-gray-700">
                        <Link to="/forgot-password" className="text-blue-700 hover:underline font-semibold">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <p className="mt-4 text-center text-gray-700">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-blue-700 hover:underline font-semibold">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;