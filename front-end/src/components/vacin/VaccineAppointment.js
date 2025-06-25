import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VaccineAppointmentService from '../../service/VaccineAppointmentService';
import UserService from '../../service/userService';

const VaccineAppointment = () => {
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
        notes: '',
        newPatient: { fullName: '', dateOfBirth: '', gender: '' },
        paymentMethod: 'later',
        bankCode: ''
    });
    const [message, setMessage] = useState('');
    const [vaccine, setVaccine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewPatientForm, setShowNewPatientForm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
    if (!UserService.isLoggedIn()) {
        navigate('/login');
        return;
    }

    const fetchData = async () => {
        try {
            setLoading(true);
            const vaccineData = await VaccineAppointmentService.getVaccine(vaccineId);
            console.log('Vaccine data:', vaccineData);
            setVaccine(vaccineData);

            const patientsRes = await VaccineAppointmentService.getPatients();
            console.log('Patients response:', patientsRes, 'Data:', patientsRes);
            const patientsData = Array.isArray(patientsRes) ? patientsRes : (patientsRes.data || []);
            setPatients(patientsData.map(patient => ({
                id: patient.id || patient.patient_id,
                fullName: patient.fullName || patient.full_name
            })));

            const availabilityRes = await VaccineAppointmentService.getVaccineAvailability(vaccineId);
            console.log('Availability response:', availabilityRes, 'Data:', availabilityRes.data);
            const availabilityData = availabilityRes.data?.data || availabilityRes.data || [];
            if (Array.isArray(availabilityData)) {
                setAvailableDates([...new Set(availabilityData.map(item => item.available_date.split('T')[0]))]);
                setAvailableLocations([...new Set(availabilityData.map(item => item.location))]);
            } else {
                console.warn('Availability data is not an array:', availabilityData);
            }
        } catch (err) {
            console.error('Fetch error:', err.response ? err.response.status : err.message);
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
}, [navigate, vaccineId]);

    const handleChange = (e) => {
        console.log('Changing form data:', e.target.name, e.target.value);
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNewPatientChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            newPatient: { ...prev.newPatient, [name]: value }
        }));
    };

    const addNewPatient = async (e) => {
        e.preventDefault();
        try {
            const response = await VaccineAppointmentService.addPatient(formData.newPatient);
            console.log('Add patient response:', response);
            const newPatient = {
                id: response.data.id || response.data.patient_id,
                fullName: response.data.fullName || response.data.full_name
            };
            if (newPatient.id && newPatient.fullName) {
                setPatients([...patients, newPatient]);
                setFormData((prev) => ({ ...prev, patientId: newPatient.id }));
                setShowNewPatientForm(false);
                setMessage('Đã thêm bé mới thành công!');
                setError('');
            } else {
                throw new Error('Invalid patient data returned from server');
            }
        } catch (error) {
            setError('Không thể thêm bé mới. Vui lòng thử lại.');
            setMessage('');
            console.error('Error adding patient:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patientId || !formData.appointmentDate || !formData.location) {
            setError('Vui lòng chọn bé, ngày hẹn và địa điểm.');
            setMessage('');
            return;
        }
        try {
            setLoading(true);
            const appointmentData = {
                vaccineId: formData.vaccineId,
                patientId: formData.patientId,
                appointmentDate: formData.appointmentDate,
                location: formData.location,
                notes: formData.notes,
                paymentMethod: formData.paymentMethod,
                bankCode: formData.bankCode
            };
            const response = await VaccineAppointmentService.createVaccineAppointment(appointmentData);
            setMessage(response.data.message);
            setError('');

            if (response.data.message.includes('thành công')) {
                navigate(`/payment/${response.data.vaccineAppointmentId}`);
            }
        } catch (error) {
            setError('Đặt lịch thất bại. Vui lòng thử lại.');
            setMessage('');
            console.error('Error creating appointment:', error);
        } finally {
            setLoading(false);
        }
    };

    const isFormDisabled = loading;

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
                                value={`${vaccine.name} - ${vaccine.description}`}
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
                            {patients.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowNewPatientForm(true)}
                                    className="mt-2 text-blue-600 hover:underline"
                                >
                                    Thêm bé mới
                                </button>
                            )}
                        </div>
                        {showNewPatientForm && (
                            <form onSubmit={addNewPatient} className="mb-4 p-4 border rounded">
                                <h3 className="text-lg font-semibold mb-2">Đăng ký bé mới</h3>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.newPatient.fullName}
                                    onChange={handleNewPatientChange}
                                    placeholder="Họ và tên"
                                    className="w-full p-2 mb-2 border rounded"
                                    required
                                />
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.newPatient.dateOfBirth}
                                    onChange={handleNewPatientChange}
                                    className="w-full p-2 mb-2 border rounded"
                                    required
                                />
                                <select
                                    name="gender"
                                    value={formData.newPatient.gender}
                                    onChange={handleNewPatientChange}
                                    className="w-full p-2 mb-2 border rounded"
                                    required
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="Male">Nam</option>
                                    <option value="Female">Nữ</option>
                                </select>
                                <button
                                    type="submit"
                                    className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Xác nhận thêm bé
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewPatientForm(false)}
                                    className="mt-2 w-full p-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                                >
                                    Hủy
                                </button>
                            </form>
                        )}
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
                        <div className="mb-4">
                            <label className="block text-gray-700">Phương thức thanh toán</label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                disabled={isFormDisabled}
                            >
                                <option value="later">Thanh toán sau</option>
                                <option value="vnpay">Thanh toán qua VNPay</option>
                            </select>
                        </div>
                        {formData.paymentMethod === 'vnpay' && (
                            <div className="mb-4">
                                <label className="block text-gray-700">Mã ngân hàng</label>
                                <select
                                    name="bankCode"
                                    value={formData.bankCode}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    disabled={isFormDisabled}
                                >
                                    <option value="">Chọn ngân hàng</option>
                                    <option value="NCB">Ngân hàng NCB</option>
                                    <option value="AGRIBANK">Ngân hàng Agribank</option>
                                    <option value="SCB">Ngân hàng SCB</option>
                                </select>
                            </div>
                        )}
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