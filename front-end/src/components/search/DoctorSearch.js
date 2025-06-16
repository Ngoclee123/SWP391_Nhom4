import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorService from '../../service/DoctorService';

function DoctorSearch() {
    const navigate = useNavigate();
    const doctorService = DoctorService;
    const [searchCriteria, setSearchCriteria] = useState({
        specialtyId: '',
        fullName: '',
        availabilityStatus: '',
        location: '',
        availabilityTime: '' // Default to empty, user selects via datetime-local
    });
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const searchRef = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const specialtiesResponse = await doctorService.getAllSpecialties();
                console.log('Fetched specialties:', specialtiesResponse);
                setSpecialties(Array.isArray(specialtiesResponse) ? specialtiesResponse : []);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                setMessage('Không thể tải dữ liệu ban đầu');
                setSpecialties([]);
            }
        };
        fetchInitialData();

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
        setMessage('');
        try {
            const availabilityTimeUTC = searchCriteria.availabilityTime
    ? new Date(new Date(searchCriteria.availabilityTime).getTime() + (7 * 60 * 60 * 1000)).toISOString()
    : '';
            console.log('Sent availabilityTimeUTC:', availabilityTimeUTC); // Debug log
            const response = await doctorService.searchDoctors({
                ...searchCriteria,
                availabilityTime: availabilityTimeUTC,
                page,
                size: 10
            });

            if (!response.content || response.content.length === 0) {
                setDoctors([]);
                setMessage('Không tìm thấy bác sĩ nào');
                setTotalPages(0);
                return;
            }

            setDoctors(response.content);
            setTotalPages(response.totalPages);
            setMessage('Tìm kiếm thành công');
        } catch (error) {
            console.error('Error searching doctors:', error);
            if (error.message.includes('Unauthorized')) {
                setMessage('Vui lòng đăng nhập để tìm kiếm bác sĩ');
            } else if (error.message.includes('Invalid')) {
                setMessage('Dữ liệu tìm kiếm không hợp lệ');
            } else {
                setMessage('Không thể tìm kiếm bác sĩ');
            }
            setDoctors([]);
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

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
            handleSearch({ preventDefault: () => {} });
        }
    };

    const isFormValid = searchCriteria.specialtyId || searchCriteria.fullName || searchCriteria.availabilityStatus || searchCriteria.location || searchCriteria.availabilityTime;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            {/* Banner */}
            <div className="w-full h-60 md:h-96 bg-blue-150 flex items-center justify-center overflow-hidden" style={{ marginTop: '120px' }}>
                <img
                    src="https://pclinic.ohayo.io.vn/_next/static/media/BookingByDoctorBanner.44b2fe83.svg"
                    alt="Gia đình và trẻ em"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-4xl mx-auto px-4 mt-6">
                <div ref={searchRef} className="relative">
                    <div
                        className="flex items-center border border-gray-300 rounded-lg p-2 bg-white shadow-sm cursor-pointer"
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    >
                        <input
                            type="text"
                            name="fullName"
                            value={searchCriteria.fullName}
                            onChange={handleInputChange}
                            placeholder="Tìm kiếm bác sĩ..."
                            className="flex-1 outline-none text-gray-700 px-3 py-2"
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="ml-2 text-gray-500 hover:text-blue-500 focus:outline-none"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1114.65 6.65 7.5 7.5 0 1116.65 16.65z" />
                            </svg>
                        </button>
                    </div>

                    {/* Expanded Search Form */}
                    {isSearchExpanded && (
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Chuyên khoa</label>
                                    <select
                                        name="specialtyId"
                                        value={searchCriteria.specialtyId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Chọn chuyên khoa</option>
                                        {specialties.map((specialty) => (
                                            <option key={specialty.id} value={specialty.id}>
                                                {specialty.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
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
                                    <label className="block text-sm font-medium text-gray-700">Thời gian khả dụng</label>
                                    <input
                                        type="datetime-local"
                                        name="availabilityTime"
                                        value={searchCriteria.availabilityTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
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
                                    className={`w-full py-2 rounded-lg font-semibold text-white transition duration-300 ${isFormValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'
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

            {/* Search Results */}
            <div className="w-full max-w-4xl mx-auto px-4 mt-10">
                {loading && <p className="text-center text-gray-600">Đang tìm kiếm...</p>}
                {message && !loading && (
                    <p className={`text-center mb-6 font-medium ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
                {doctors.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center">Kết quả tìm kiếm bác sĩ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {doctors.map((doctor) => (
                                <div key={doctor.id} className="p-4 bg-white rounded-lg shadow-lg flex items-start space-x-4">
                                    <img
                                        src={doctor.imgs || '/images/default-doctor.jpg'}
                                        alt={doctor.fullName}
                                        className="w-24 h-24 object-cover rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="text-lg font-medium text-blue-900">{doctor.fullName}</p>
                                        <p className="text-gray-600">Chuyên khoa: {doctor.specialtyName || 'N/A'}</p>
                                        <p className="text-gray-600">Tiểu sử: {doctor.bio ? doctor.bio.slice(0, 100) + (doctor.bio.length > 100 ? '...' : '') : 'N/A'}</p>
                                        <p className="text-gray-600">Số điện thoại: {doctor.phoneNumber || 'N/A'}</p>
                                        <p className="text-gray-600">Địa điểm: {doctor.locational || 'N/A'}</p>
                                        {/* <p className="text-gray-600">Trạng thái: {doctor.availabilityStatus || 'N/A'}</p>
                                        <p className="text-gray-600">Thời gian: {doctor.startTime ? `${doctor.startTime} - ${doctor.endTime}` : 'N/A'}</p> */}
                                    </div>
                                    <button
                                        onClick={() => handleBookNow(doctor)}
                                        className="bg-blue-700 text-white py-2 px-4 hover:bg-blue-800 transition duration-300"
                                    >
                                        Đặt lịch ngay
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                                className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">{`Trang ${page + 1} của ${totalPages}`}</span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorSearch;