import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function ForgotPassword() {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axiosClient.post('/api/forgot-password', { username: username.trim() });
            setMessage('Đã gửi đường link đổi mật khẩu qua email, hãy kiểm tra email');
            setError('');
            setTimeout(() => navigate('/login'), 5000);
        } catch (error) {
            console.error('Yêu cầu đặt lại mật khẩu thất bại:', error);
            if (error.response && error.response.data) {
                setError(error.response.data);
            } else {
                setError('Đã có lỗi xảy ra, vui lòng thử lại!');
            }
            setMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = username.trim() !== '';

    return (
        <div className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-200">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl border-t-4 border-blue-500">
                <h2 className="text-3xl font-extrabold text-blue-900 mb-8 text-center">Quên mật khẩu</h2>
                
                {message && (
                    <p className="text-green-600 text-center mb-6 font-medium bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                        {message}
                    </p>
                )}
                
                {error && (
                    <p className="text-red-600 text-center mb-6 font-medium bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                        {error}
                    </p>
                )}
                
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white/90 backdrop-blur-sm hover:bg-white"
                            placeholder="Nhập tên đăng nhập của bạn"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                            isFormValid && !isLoading
                                ? 'bg-blue-700 hover:bg-blue-800'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </div>
                        ) : (
                            'Gửi yêu cầu đặt lại mật khẩu'
                        )}
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-700">
                    Quay lại{' '}
                    <Link to="/login" className="text-blue-700 hover:text-blue-800 hover:underline font-semibold transition duration-200">
                        Đăng nhập
                    </Link>
                </p>
            </div>

            {/* Custom animations */}
            <style>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}

export default ForgotPassword;