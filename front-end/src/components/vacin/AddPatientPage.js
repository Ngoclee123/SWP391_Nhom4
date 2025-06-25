import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VaccineAppointmentService from '../../service/VaccineAppointmentService';
import UserService from '../../service/userService';

const AddPatientPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const vaccineId = location.state?.vaccineId; // Lấy vaccineId từ state
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        weight: '', // Thêm trường weight
        height: '', // Thêm trường height
        medicalConditions: '' // Thêm trường medicalConditions
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Reset form khi vào trang
        setFormData({ fullName: '', dateOfBirth: '', gender: '', weight: '', height: '', medicalConditions: '' });
        setError('');
        setMessage('');
        if (!vaccineId) {
            console.warn('vaccineId is not provided in state, redirecting to default vaccine page');
            navigate('/vaccines/1'); // Redirect nếu không có vaccineId
        }
    }, [vaccineId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Xóa lỗi khi người dùng sửa đổi
        if (error[name]) setError(prev => ({ ...prev, [name]: '' }));
    };

    const validateNewPatient = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Họ và tên là bắt buộc';
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
        } else {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            if (isNaN(birthDate.getTime()) || birthDate >= today) {
                newErrors.dateOfBirth = 'Ngày sinh không hợp lệ hoặc phải trước ngày hiện tại';
            }
        }
        if (!formData.gender) newErrors.gender = 'Giới tính là bắt buộc';
        // Kiểm tra weight và height (nếu nhập, phải là số hợp lệ)
        if (formData.weight && isNaN(formData.weight)) {
            newErrors.weight = 'Cân nặng phải là số';
        }
        if (formData.height && isNaN(formData.height)) {
            newErrors.height = 'Chiều cao phải là số';
        }
        setError(newErrors);
        console.log('Validation result in AddPatientPage:', newErrors); // Debug
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submission triggered in AddPatientPage at:', new Date().toISOString());
        if (!validateNewPatient() || !vaccineId) {
            console.log('Validation failed or vaccineId missing, request not sent in AddPatientPage');
            if (!vaccineId) setError({ ...error, general: 'Không thể xác định vaccineId.' });
            return;
        }

        setLoading(true);
        const maxRetries = 2;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const accountId = UserService.getAccountId();
                console.log('AccountId from UserService in AddPatientPage:', accountId, 'at:', new Date().toISOString());
                if (!accountId) {
                    throw new Error('No accountId found. Please log in again at:', new Date().toISOString());
                }

                const requestData = {
                    fullName: formData.fullName,
                    dateOfBirth: formData.dateOfBirth, // Đảm bảo định dạng YYYY-MM-DD
                    gender: formData.gender,
                    weight: formData.weight ? parseFloat(formData.weight) : null, 
                    height: formData.height ? parseFloat(formData.height) : null, 
                    medicalConditions: formData.medicalConditions || null, 
                    accountId: parseInt(accountId)
                };
                console.log('Sending add patient request with JSON:', JSON.stringify(requestData), 'at:', new Date().toISOString());

                const response = await VaccineAppointmentService.addPatient(requestData);
                console.log('Add patient response:', response, 'Status:', response.status, 'at:', new Date().toISOString());

                const newPatient = {
                    id: response.id || response.data?.id,
                    fullName: formData.fullName
                };
                if (newPatient.id && newPatient.fullName) {
                    setMessage('Đã thêm bé mới thành công!');
                    setTimeout(() => {
                        navigate(`/vaccines/${vaccineId}`, { state: { newPatient } });
                    }, 1000);
                    break;
                } else {
                    throw new Error('Invalid patient data returned from server: ' + JSON.stringify(response) + ' at:', new Date().toISOString());
                }
            } catch (error) {
                console.error('Error adding patient (Attempt ' + (attempt + 1) + '):', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    config: error.config,
                    timestamp: new Date().toISOString()
                });
                if (attempt === maxRetries) {
                    setError({ ...error, general: 'Không thể thêm bé mới sau ' + maxRetries + ' lần thử. Vui lòng đăng nhập lại.' });
                } else if (error.response?.status === 401) {
                    console.warn('401 Unauthorized detected, retrying at attempt:', attempt + 1);
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">Thêm Bé Mới</h2>
            {message && <p className="text-green-600">{message}</p>}
            {error && (
                <div>
                    {Object.values(error).map((err, index) => (
                        <p key={index} className="text-red-600">{err}</p>
                    ))}
                </div>
            )}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                            className="w-full p-2 border rounded"
                            required
                        />
                        {error.fullName && <p className="text-red-600 text-sm">{error.fullName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                        {error.dateOfBirth && <p className="text-red-600 text-sm">{error.dateOfBirth}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                        </select>
                        {error.gender && <p className="text-red-600 text-sm">{error.gender}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cân nặng (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="Nhập cân nặng"
                            className="w-full p-2 border rounded"
                            step="0.1"
                        />
                        {error.weight && <p className="text-red-600 text-sm">{error.weight}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Chiều cao (cm)</label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            placeholder="Nhập chiều cao"
                            className="w-full p-2 border rounded"
                            step="0.1"
                        />
                        {error.height && <p className="text-red-600 text-sm">{error.height}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tình trạng y tế</label>
                        <textarea
                            name="medicalConditions"
                            value={formData.medicalConditions}
                            onChange={handleChange}
                            placeholder="Nhập tình trạng y tế (nếu có)"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full p-2 rounded ${loading ? 'bg-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận thêm bé'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/vaccines/${vaccineId || '1'}`)}
                        className="mt-2 w-full p-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                        Hủy
                    </button>
                </form>
            )}
        </div>
    );
};

export default AddPatientPage;