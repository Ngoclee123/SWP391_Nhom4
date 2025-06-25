// src/components/doctor/DoctorDashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../service/userService';

function DoctorDashboard() {
    const navigate = useNavigate();

    // Kiểm tra vai trò khi component được render
    useEffect(() => {
        const role = UserService.getRole();
        if (role !== 'DOCTOR') {
            navigate('/login'); // Chuyển hướng nếu không phải DOCTOR
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-6">Doctor Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card xem lịch hẹn */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Lịch hẹn hôm nay</h2>
                        <p className="text-gray-600">Xem và quản lý các lịch hẹn khám trong ngày.</p>
                        <button
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                            onClick={() => navigate('/doctor/appointments')}
                        >
                            Xem chi tiết
                        </button>
                    </div>
                    {/* Card hồ sơ bệnh nhân */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Hồ sơ bệnh nhân</h2>
                        <p className="text-gray-600">Xem thông tin bệnh nhân đã đặt lịch khám.</p>
                        <button
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                            onClick={() => navigate('/doctor/patients')}
                        >
                            Xem chi tiết
                        </button>
                    </div>
                    {/* Card lịch tiêm chủng */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Lịch tiêm chủng</h2>
                        <p className="text-gray-600">Quản lý lịch tiêm vaccine cho bệnh nhân.</p>
                        <button
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                            onClick={() => navigate('/doctor/vaccine-appointments')}
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard;