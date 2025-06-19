import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import UserService from '../../service/userService';
import { FaUserMd, FaCalendarAlt, FaStethoscope, FaUser, FaBed, FaUserPlus, FaChartLine, FaPhone, FaProcedures } from 'react-icons/fa';

function DoctorDashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!UserService.isLoggedIn() || !UserService.isDoctor()) {
            navigate('/login');
            return;
        }

        const fetchDashboard = async () => {
            try {
                const accountId = UserService.getAccountId();
                console.log('Fetching dashboard for accountId:', accountId);
                const response = await axiosClient.get(`/api/doctors/dashboard/${accountId}`);
                console.log('API Response:', response);
                if (response) {
                    setDashboardData(response);
                } else {
                    setError('Dữ liệu không hợp lệ từ server');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard:', err);
                setError('Không thể tải dữ liệu dashboard: ' + (err.response?.data || err.message));
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Đang tải...</div>;
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="text-6xl text-gray-400 mb-4">😔</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-4">{error}</h2>
                <button
                    onClick={() => navigate('/home')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Quay về trang chủ
                </button>
            </div>
        </div>
    );

    const doctorName = dashboardData?.fullName || 'Bác Sĩ';
    const stats = dashboardData || {
        newPatients: 0,
        surgeries: 0,
        discharges: 0,
        opdPatients: 0,
        labTests: 0,
        earnings: 0,
        appointments: 0,
        doctors: 0,
        staff: 0,
        operations: 0,
        admitted: 0,
        discharged: 0,
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="container mx-auto px-4 py-6">
                <div className="bg-white text-gray-800 rounded-lg shadow-lg p-6">
                    {/* Header with Profile */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Good Morning, Dr. {doctorName}</h1>
                            <p className="text-sm">Your schedule today.</p>
                            <p className="text-sm text-gray-600">Chuyên khoa: {dashboardData?.specialtyName || 'N/A'}</p>
                            <p className="text-sm text-gray-600">Số điện thoại: {dashboardData?.phoneNumber || 'N/A'}</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search"
                            className="p-2 rounded-lg border border-gray-300"
                        />
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-100 p-4 rounded-lg text-center">
                            <FaUser className="mx-auto text-2xl text-blue-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.newPatients} New Patients</p>
                            <p className="text-sm text-gray-600">+40% this month</p>
                            <button className="text-blue-600 text-sm mt-2">View All</button>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg text-center">
                            <FaStethoscope className="mx-auto text-2xl text-green-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.surgeries} Surgeries</p>
                            <p className="text-sm text-gray-600">this month</p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-lg text-center">
                            <FaBed className="mx-auto text-2xl text-orange-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.discharges} Discharges</p>
                            <p className="text-sm text-gray-600">this month</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
                        <div className="bg-blue-100 p-4 rounded-lg text-center">
                            <FaUserPlus className="mx-auto text-2xl text-blue-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.opdPatients} OPD Patients</p>
                            <p className="text-sm text-gray-600">+30% this month</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg text-center">
                            <FaChartLine className="mx-auto text-2xl text-green-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.labTests} Lab Tests</p>
                            <p className="text-sm text-gray-600">+60% this month</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded-lg text-center">
                            <FaChartLine className="mx-auto text-2xl text-yellow-600 mb-2" />
                            <p className="text-lg font-semibold">${stats.earnings} Total Earnings</p>
                            <p className="text-sm text-gray-600">+20% this month</p>
                        </div>
                    </div>

                    {/* Navigation and Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        <div className="bg-blue-100 p-4 rounded-lg text-center">
                            <FaCalendarAlt className="mx-auto text-2xl text-blue-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.appointments} Appointments</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg text-center">
                            <FaUserMd className="mx-auto text-2xl text-green-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.doctors} Doctors</p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-lg text-center">
                            <FaUser className="mx-auto text-2xl text-orange-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.staff} Staff</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg text-center">
                            <FaProcedures className="mx-auto text-2xl text-blue-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.operations} Operations</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg text-center">
                            <FaBed className="mx-auto text-2xl text-green-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.admitted} Admitted</p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-lg text-center">
                            <FaUserPlus className="mx-auto text-2xl text-orange-600 mb-2" />
                            <p className="text-lg font-semibold">{stats.discharged} Discharged</p>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="mt-6 flex space-x-4">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center">
                            <FaPhone className="mr-2" /> Emergency Contact: 0987654321
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard;