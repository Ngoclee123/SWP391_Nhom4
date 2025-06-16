import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VaccineAppointmentService from '../../service/VaccineAppointmentService';
import UserService from '../../service/userService';

const AppointmentForm = () => {
    const navigate = useNavigate();
    const { vaccineId } = useParams();
    const [patients, setPatients] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [formData, setFormData] = useState({
        vaccineId: vaccineId || '',
        patientId: '',
        appointmentDate: '',
        location: '',
        notes: ''
    });
    const [message, setMessage] = useState('');
    const [vaccine, setVaccine] = useState(null);

    useEffect(() => {
        if (!UserService.isLoggedIn()) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                console.log('Fetching vaccine data for vaccineId:', vaccineId);
                const vaccineData = await VaccineAppointmentService.getVaccine(vaccineId);
                console.log('Vaccine data received:', vaccineData);
                setVaccine(vaccineData);

                console.log('Fetching patient data');
                const patientRes = await VaccineAppointmentService.getPatients();
                console.log('Patient response:', patientRes);
                setPatients(patientRes.data || []);

                console.log('Fetching availability for vaccineId:', vaccineId);
                const availabilityRes = await VaccineAppointmentService.getVaccineAvailability(vaccineId);
                console.log('Availability response:', availabilityRes);
                const availability = availabilityRes.data || [];
                setAvailableDates([...new Set(availability.map(item => item.available_date.split('T')[0]))]);
                setAvailableLocations([...new Set(availability.map(item => item.location))]);
            } catch (error) {
                console.error('Error fetching data:', error.response ? error.response.data : error.message);
                setMessage('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối.');
            }
        };
        fetchData();
    }, [navigate, vaccineId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!availableDates.length || !availableLocations.length || !formData.patientId) {
            setMessage('Vui lòng chọn bé, ngày hẹn và địa điểm.');
            return;
        }
        try {
            console.log('Submitting appointment data:', formData);
            const response = await VaccineAppointmentService.createAppointment(formData);
            console.log('Appointment response:', response);
            setMessage(response.data);
            if (response.data.includes('thành công')) {
                setTimeout(() => navigate('/home'), 2000);
            }
        } catch (error) {
            console.error('Error creating appointment:', error.response ? error.response.data : error.message);
            setMessage(error.response?.data || 'Đặt lịch thất bại. Vui lòng thử lại.');
        }
    };

    const isFormDisabled = !availableDates.length || !availableLocations.length || !formData.patientId || !formData.appointmentDate || !formData.location;

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">Đặt Lịch Tiêm Vaccine</h2>
            {message && <p className={message.includes('thành công') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
            {vaccine && (
                <div className="mb-4">
                    <label className="block text-gray-700">Vaccine</label>
                    <input
                        type="text"
                        value={vaccine.name}
                        readOnly
                        className="w-full p-2 border rounded"
                    />
                </div>
            )}
            <form onSubmit={handleSubmit} disabled={isFormDisabled}>
                <div className="mb-4">
                    <label className="block text-gray-700">Chọn Bé</label>
                    <select
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        disabled={isFormDisabled}
                        required
                    >
                        <option value="">Chọn bé</option>
                        {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                                {patient.fullName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Ngày Hẹn</label>
                    <select
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        disabled={isFormDisabled}
                        required
                    >
                        <option value="">Chọn ngày</option>
                        {availableDates.map((date) => (
                            <option key={date} value={date}>
                                {new Date(date).toLocaleDateString('vi-VN')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Địa Điểm</label>
                    <select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        disabled={isFormDisabled}
                        required
                    >
                        <option value="">Chọn địa điểm</option>
                        {availableLocations.map((loc) => (
                            <option key={loc} value={loc}>
                                {loc}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Ghi Chú</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        disabled={isFormDisabled}
                    />
                </div>
                <button
                    type="submit"
                    className={`w-full p-2 rounded ${isFormDisabled ? 'bg-gray-400' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                    disabled={isFormDisabled}
                >
                    Đặt Lịch
                </button>
            </form>
            {!patients.length && <p className="text-red-600">Không có thông tin bé. Vui lòng thêm bé vào hệ thống.</p>}
            {!availableDates.length && <p className="text-red-600">Không có lịch hẹn khả dụng cho vaccine này.</p>}
        </div>
    );
};

export default AppointmentForm;