import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import UserService from '../service/userService';

function ChangePassword() {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    console.log('ChangePassword rendered with accountId:', accountId);

    useEffect(() => {
        if (!accountId || accountId === 'undefined') {
            setError('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [accountId, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        console.log('Form submitted');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        if (!accountId || accountId === 'undefined') {
            setError('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            const response = await axiosClient.put(`/api/accounts/change-password/${accountId}`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            setSuccess(response || 'Đổi mật khẩu thành công!');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            console.error('API Error:', err);
            setError(err.response?.data || 'Lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="max-w-md w-full mx-auto bg-white p-10 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
                <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center tracking-wide">
                    Đổi Mật Khẩu
                </h2>
                {error && <p className="text-red-600 mb-6 text-center font-medium">{error}</p>}
                {success && <p className="text-green-600 mb-6 text-center font-medium">{success}</p>}
                {!error && !success && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2 text-lg">
                                Mật khẩu hiện tại
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2 text-lg">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                required
                            />
                        </div>
                        <div className="mb-8">
                            <label className="block text-gray-700 font-semibold mb-2 text-lg">
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold text-lg shadow-md hover:shadow-lg"
                        >
                            Đổi Mật Khẩu
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ChangePassword;