import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import VaccineAppointmentService from '../../service/VaccineAppointmentService';
import UserService from '../../service/userService';

const VaccineAppointment = () => {
    const navigate = useNavigate();
    const { vaccineId } = useParams();
    const location = useLocation();
    const [patients, setPatients] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [formData, setFormData] = useState({
        vaccineId: vaccineId || '',
        patientId: '',
        appointmentDate: '',
        appointmentTime: '',
        location: '',
        notes: '',
        newPatient: { fullName: '', dateOfBirth: '', gender: '' }
    });
    const [message, setMessage] = useState('');
    const [vaccine, setVaccine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!UserService.isLoggedIn()) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const vaccineData = await VaccineAppointmentService.getVaccine(vaccineId);
                console.log('Vaccine data received:', vaccineData);
                setVaccine(vaccineData.data || vaccineData || {});

                const patientsRes = await VaccineAppointmentService.getPatients();
                const patientsData = Array.isArray(patientsRes) ? patientsRes : (patientsRes.data || []);
                setPatients(patientsData.map(patient => ({
                    id: patient.id || patient.patient_id,
                    fullName: patient.fullName || patient.full_name
                })));

                const availabilityRes = await VaccineAppointmentService.getVaccineAvailability(vaccineId);
                const availabilityData = availabilityRes.data?.data || availabilityRes.data || [];
                if (Array.isArray(availabilityData)) {
                    setAvailableDates([...new Set(availabilityData.map(item => item.available_date.split('T')[0]))]);
                    setAvailableLocations([...new Set(availabilityData.map(item => item.location))]);
                }
            } catch (err) {
                console.error('Fetch error:', err.response ? err.response.status : err.message);
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        if (location.state?.newPatient) {
            setPatients(prev => [...prev, location.state.newPatient]);
            setFormData(prev => ({ ...prev, patientId: location.state.newPatient.id }));
            setMessage('Đã thêm bé mới thành công!');
        }
    }, [navigate, vaccineId, location.state]);

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setFormData(prev => ({ ...prev, appointmentDate: selectedDate, appointmentTime: '' }));
        const availabilityRes = VaccineAppointmentService.getVaccineAvailability(vaccineId);
        availabilityRes.then(response => {
            const availabilityData = response.data?.data || response.data || [];
            const times = availabilityData
                .filter(item => item.available_date.startsWith(selectedDate))
                .map(item => {
                    const timePart = item.available_date.split('T')[1].split(':')[0] + ':' + item.available_date.split('T')[1].split(':')[1];
                    return timePart;
                });
            setAvailableTimes([...new Set(times)]);
        }).catch(err => {
            console.error('Error fetching availability times:', err);
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (isSubmitting || !formData.patientId || !formData.appointmentDate || !formData.appointmentTime || !formData.location) {
            setError('Vui lòng chọn bé, ngày hẹn, khung giờ và địa điểm.');
            setMessage('');
            return;
        }
        try {
            setLoading(true);
            setIsSubmitting(true);
            const token = UserService.getToken();
            console.log('Token before request:', token);
            const appointmentData = {
                vaccineId: formData.vaccineId,
                patientId: formData.patientId,
                appointmentDate: `${formData.appointmentDate}T${formData.appointmentTime}:00Z`,
                location: formData.location,
                notes: formData.notes
            };
            console.log('Request data:', appointmentData);
            const response = await VaccineAppointmentService.createVaccineAppointment(appointmentData);
            setMessage(response.data.message);
            setError('');
            if (response.data.message.includes('thành công')) {
                navigate('/confirmation', { state: {
                    appointmentData: {
                        vaccineAppointmentId: response.data.vaccineAppointmentId,
                        vaccineName: vaccine?.name,
                        price: vaccine?.price,
                        appointmentDate: `${formData.appointmentDate} ${formData.appointmentTime}`,
                        location: formData.location,
                        notes: formData.notes
                    }
                } });
            }
        } catch (error) {
            console.error('Error creating appointment:', error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 401) {
                console.warn('Unauthorized, redirecting to login');
            }
            setError('Đặt lịch thất bại. Vui lòng thử lại.');
            setMessage('');
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    }, [isSubmitting, formData, navigate, vaccine]);

    const isFormDisabled = loading || isSubmitting;

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">Đặt Lịch Tiêm Vaccine</h2>
            {message && <p className={message.includes('thành công') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {vaccine && (
                        <div className="mb-4">
                            <label className="block text-gray-700">Vaccine</label>
                            <input
                                type="text"
                                value={vaccine.name ? `${vaccine.name} - ${vaccine.description || ''} - Giá: ${vaccine.price ? vaccine.price.toString() : 'Chưa có'} VNĐ` : 'Không có dữ liệu vaccine'}
                                readOnly
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
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
                            <button
                                type="button"
                                onClick={() => navigate('/add-patient', { state: { vaccineId } })}
                                className="mt-2 text-blue-600 hover:underline"
                                disabled={isFormDisabled}
                            >
                                Thêm bé mới
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Ngày Hẹn</label>
                            <select
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleDateChange}
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
                        {formData.appointmentDate && (
                            <div className="mb-4">
                                <label className="block text-gray-700">Khung Giờ Tiêm</label>
                                <select
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    disabled={isFormDisabled}
                                    required
                                >
                                    <option value="">Chọn khung giờ</option>
                                    {availableTimes.map((time, index) => (
                                        <option key={index} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
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
                    {patients.length === 0 && !error && <p className="text-red-600">Không có thông tin bé. Vui lòng thêm bé vào hệ thống.</p>}
                    {!availableDates.length && !error && <p className="text-red-600">Không có lịch hẹn khả dụng cho vaccine này.</p>}
                </>
            )}
        </div>
    );
};

export default VaccineAppointment;