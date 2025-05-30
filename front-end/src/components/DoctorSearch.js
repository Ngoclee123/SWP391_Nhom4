import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorService from '../service/DoctorService';

function DoctorSearch() {
    const navigate = useNavigate();
    const [searchCriteria, setSearchCriteria] = useState({
        specialtyId: '',
        fullName: '',
        availabilityStatus: '',
        location: '',
        availabilityTime: ''
    });
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchRef = useRef(null);

    const doctorService = new DoctorService();

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const response = await doctorService.getSpecialties();
                setSpecialties(response);
            } catch (error) {
                console.error('Error fetching specialties:', error);
            }
        };
        fetchSpecialties();

        // Đóng form khi nhấp ra ngoài
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await doctorService.searchDoctors(searchCriteria);
            setDoctors(response);
            setMessage(response.length ? 'Tìm kiếm thành công' : 'Không tìm thấy bác sĩ nào');
        } catch (error) {
            console.error('Error searching doctors:', error);
            setMessage('Không thể tìm kiếm bác sĩ');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchCriteria({ ...searchCriteria, [name]: value });
    };

    const handleBookNow = (doctor) => {
        navigate('/book-appointment', { state: { doctor } });
    };

    const isFormValid = searchCriteria.specialtyId || searchCriteria.fullName || searchCriteria.availabilityStatus || searchCriteria.location || searchCriteria.availabilityTime;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            {/* Hình ảnh minh họa trên cùng, gần bằng kích thước trang */}
            <div className="w-full h-60 md:h-96 bg-blue-150 flex items-center justify-center overflow-hidden" style={{marginTop: '120px'}}>
                <img
                    src="https://pclinic.ohayo.io.vn/_next/static/media/BookingByDoctorBanner.44b2fe83.svg"
                    alt="Gia đình và trẻ em"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Thanh input tìm kiếm */}
            <div className="w-full max-w-4xl mx-auto px-4 mt-6">
                <div ref={searchRef} className="relative">
                    <div
                        className="flex items-center border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    >
                        <input
                            type="text"
                            name="fullName"
                            value={searchCriteria.fullName}
                            onChange={handleInputChange}
                            placeholder="Nhập tên bác sĩ..."
                            className="flex-1 outline-none text-gray-700"
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="ml-2 text-gray-500 hover:text-blue-500 focus:outline-none"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1114.65 6.65 7.5 7.5 0 1116.65 16.65z"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Form mở rộng khi nhấp vào */}
                    {isSearchExpanded && (
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div>
                                    <select
                                        name="specialtyId"
                                        value={searchCriteria.specialtyId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Chọn chuyên khoa</option>
                                        {specialties.map((specialty) => (
                                            <option key={specialty.specialtyId} value={specialty.specialtyId}>
                                                {specialty.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="location"
                                        value={searchCriteria.location}
                                        onChange={handleInputChange}
                                        placeholder="Nhập địa điểm (ví dụ: Hà Nội)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="datetime-local"
                                        name="availabilityTime"
                                        value={searchCriteria.availabilityTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        name="availabilityStatus"
                                        value={searchCriteria.availabilityStatus}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="Available">Rảnh</option>
                                        <option value="Booked">Đã đặt</option>
                                        <option value="Unavailable">Không rảnh</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className={`w-full py-2 rounded-lg font-semibold text-white transition duration-300 ${
                                        isFormValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                    disabled={!isFormValid}
                                >
                                    Tìm kiếm
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Kết quả tìm kiếm */}
            <div className="w-full max-w-4xl mx-auto px-4 mt-10">
                {loading && <p className="text-center text-gray-600">Đang tìm kiếm...</p>}
                {message && !loading && (
                    <p className={`text-center mb-6 font-medium ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
                {doctors.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center">Kết quả tìm kiếm</h3>
                        <ul className="space-y-4">
                            {doctors.map((doctor) => (
                                <li key={doctor.doctorId} className="p-4 bg-gray-50 rounded-lg shadow flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-medium text-blue-900">{doctor.fullName}</p>
                                        <p className="text-gray-600">Chuyên khoa: {specialties.find(s => s.specialtyId === doctor.specialtyId)?.name || 'N/A'}</p>
                                        <p className="text-gray-600">Địa điểm: {doctor.location || 'N/A'}</p>
                                        <p className="text-gray-600">Thời gian rảnh: {doctor.availabilityTime || 'N/A'}</p>
                                        <p className="text-gray-600">Số điện thoại: {doctor.phoneNumber || 'N/A'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleBookNow(doctor)}
                                        className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition duration-300"
                                    >
                                        Đặt lịch ngay
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorSearch;