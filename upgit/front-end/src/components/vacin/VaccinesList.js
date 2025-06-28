import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../service/userService';
import VaccineAppointmentService from '../../service/VaccineAppointmentService';

const VaccinesList = () => {
    const navigate = useNavigate();
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!UserService.isLoggedIn()) {
            navigate('/login');
            return;
        }

        const fetchVaccines = async () => {
            try {
                setLoading(true);
                const response = await VaccineAppointmentService.getAllVaccines();
                console.log('Fetched vaccines:', response);
                if (Array.isArray(response)) {
                    setVaccines(response);
                } else {
                    setVaccines(response.data || []);
                }
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách vaccine. Vui lòng thử lại.');
                console.error('Error fetching vaccines:', err);
                setLoading(false);
            }
        };
        fetchVaccines();
    }, [navigate]);

    const handleVaccineClick = (vaccineId) => {
        navigate(`/vaccines/${vaccineId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4" style={{ marginTop: '80px' }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Danh Sách Vaccine
                    </h2>
                    <p className="mt-3 text-gray-600 text-lg">Chọn vaccine để đặt lịch tiêm cho bé</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 border-l-4 border-red-400 text-red-700">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vaccines.length > 0 ? (
                        vaccines.map((vaccine) => (
                            <div
                                key={vaccine.id}
                                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                onClick={() => handleVaccineClick(vaccine.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === 'Space') {
                                        handleVaccineClick(vaccine.id);
                                    }
                                }}
                            >
                                <div className="relative group mb-4">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                    <img
                                        src={vaccine.image || '/images/vaccines/default.jpg'}
                                        alt={vaccine.name}
                                        className="relative h-48 w-full object-cover rounded-2xl shadow-md"
                                    />
                                </div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                    {vaccine.name}
                                </h3>
                                <p className="text-gray-600 mb-2">{vaccine.description}</p>
                                <p className="text-sm text-gray-500">Độ tuổi khuyến nghị: {vaccine.recommendedAge}</p>
                            </div>
                        ))
                    ) : (
                        !error && <p className="text-center text-gray-500">Không có vaccine nào để hiển thị.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VaccinesList;
