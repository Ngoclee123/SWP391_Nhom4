import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProfileService from '../service/ProfileService';

function ProfileForm() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await ProfileService.getUserProfile();
<<<<<<< HEAD
                const data = response.data || response; // fallback nếu response là object data luôn
                setUserData({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                    dateOfBirth: data.dateOfBirth || ''
=======
                setUserData({
                    fullName: response.fullName || '',
                    email: response.email || '',
                    phoneNumber: response.phoneNumber || '',
                    address: response.address || '',
                    dateOfBirth: response.dateOfBirth || ''
>>>>>>> ngocle_new
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                setMessage('Không thể tải thông tin người dùng');
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
        if (value.trim()) setErrors({ ...errors, [name]: '' });
    };

    const handleDateChange = (date) => {
        const formattedDate = date ? date.toISOString().split('T')[0] : '';
        setUserData({ ...userData, dateOfBirth: formattedDate });
        if (formattedDate) setErrors({ ...errors, dateOfBirth: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!userData.fullName.trim()) newErrors.fullName = 'Họ và tên là bắt buộc';
        if (!userData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (!userData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
        } else if (!/^\d{10,11}$/.test(userData.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 chữ số)';
        }
        if (!userData.address.trim()) newErrors.address = 'Địa chỉ là bắt buộc';
        if (!userData.dateOfBirth) {
            newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
        } else {
            const birthDate = new Date(userData.dateOfBirth);
            const today = new Date();
            if (isNaN(birthDate.getTime())) {
                newErrors.dateOfBirth = 'Ngày sinh không hợp lệ';
            } else if (birthDate >= today) {
                newErrors.dateOfBirth = 'Ngày sinh phải trước ngày hiện tại';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await ProfileService.updateUserProfile(userData);
            setMessage('Cập nhật hồ sơ thành công!');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Cập nhật hồ sơ thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };


    const handleCancel = () => navigate('/home');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ marginTop: '100px' }}>
            <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                <img src="/images/Logo.jpg" alt="Baby Health Hub Logo" className="w-[450px] max-w-full h-auto rounded-lg shadow-xl transform hover:scale-105 transition duration-300" />
            </div>
            <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-blue-900">Hồ sơ của bạn</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Xem và chỉnh sửa thông tin cá nhân</p>
                </div>
                {message && (
                    <div className={`text-center p-3 rounded-lg ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                            <input type="text" name="fullName" value={userData.fullName} onChange={handleInputChange} className={`mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.fullName ? 'border-red-500' : ''}`} placeholder="Nhập họ và tên" />
                            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={userData.email} onChange={handleInputChange} className={`mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.email ? 'border-red-500' : ''}`} placeholder="Nhập email" />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                            <DatePicker
                                selected={userData.dateOfBirth ? new Date(userData.dateOfBirth) : null}
                                onChange={handleDateChange}
                                dateFormat="yyyy-MM-dd"
                                className={`mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                                placeholderText="YYYY-MM-DD"
                                showYearDropdown
                                yearDropdownItemNumber={100}
                                scrollableYearDropdown
                                maxDate={new Date()}
                            />
                            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Thông tin liên hệ</h3>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input type="tel" name="phoneNumber" value={userData.phoneNumber} onChange={handleInputChange} className={`mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.phoneNumber ? 'border-red-500' : ''}`} placeholder="Nhập số điện thoại" />
                            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                            <input type="text" name="address" value={userData.address} onChange={handleInputChange} className={`mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.address ? 'border-red-500' : ''}`} placeholder="Nhập địa chỉ" />
                            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button type="submit" className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button type="button" onClick={handleCancel} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200">
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileForm;