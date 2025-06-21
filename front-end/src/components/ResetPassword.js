import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Token không hợp lệ hoặc thiếu');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axiosClient.post('/api/reset-password', {
                token,
                newPassword,
            });
            setMessage('Đặt lại mật khẩu thành công!');
            setError('');
            setIsSuccess(true);
            
            // Đếm ngược 5 giây
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/login');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
        } catch (error) {
            console.error('Đặt lại mật khẩu thất bại:', error);
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

    const isFormValid = newPassword.trim() !== '' && confirmPassword.trim() !== '' && newPassword.length >= 8;

    return (
        <div className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-200">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl border-t-4 border-blue-500">
                <h2 className="text-3xl font-extrabold text-blue-900 mb-8 text-center">Đặt lại mật khẩu</h2>
                
                {message && (
                    <div className="text-center mb-6">
                        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p className="text-green-600 font-semibold">{message}</p>
                            </div>
                            {isSuccess && (
                                <p className="text-green-500 text-sm">
                                    Chuyển hướng về trang đăng nhập trong {countdown} giây...
                                </p>
                            )}
                        </div>
                    </div>
                )}
                
                {error && (
                    <p className="text-red-600 text-center mb-6 font-medium bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                        {error}
                    </p>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="newPassword" className="block text-gray-800 font-semibold mb-2">
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white/90 backdrop-blur-sm hover:bg-white"
                            placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                            required
                        />
                        {newPassword && newPassword.length < 8 && (
                            <p className="text-orange-500 text-sm mt-1">Mật khẩu phải có ít nhất 8 ký tự</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-800 font-semibold mb-2">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white/90 backdrop-blur-sm hover:bg-white"
                            placeholder="Xác nhận mật khẩu mới"
                            required
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">Mật khẩu xác nhận không khớp</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                            isFormValid && !isLoading && !isSuccess
                                ? 'bg-blue-700 hover:bg-blue-800'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isFormValid || isLoading || isSuccess}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </div>
                        ) : isSuccess ? (
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Thành công
                            </div>
                        ) : (
                            'Đặt lại mật khẩu'
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
            <style jsx>{`
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

export default ResetPassword;