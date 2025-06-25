import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VaccineAppointmentService from '../../service/VaccineAppointmentService';

const ConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [appointmentData, setAppointmentData] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [bankCode, setBankCode] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!location.state?.appointmentData) {
            navigate('/vaccine-appointment');
            return;
        }
        setAppointmentData(location.state.appointmentData);
    }, [navigate, location.state]);

   const handleConfirm = async () => {
    if (!selectedMethod) {
        setMessage('Vui lòng chọn phương thức thanh toán.');
        return;
    }
    try {
        const vaccineAppointmentId = appointmentData.vaccineAppointmentId;
        if (selectedMethod === 'vnpay' && !bankCode) {
            setMessage('Vui lòng chọn ngân hàng khi thanh toán qua VNPay.');
            return;
        }

        let response;
        if (selectedMethod === 'vnpay') {
            response = await VaccineAppointmentService.createVNPayPayment(vaccineAppointmentId, { bankCode, method: 'BankCard' });
            const paymentUrl = response.data.data.paymentUrl;
            window.location.href = paymentUrl;
        } else if (selectedMethod === 'later') {
            await VaccineAppointmentService.createPayment(vaccineAppointmentId, { method: 'Cash' });
            navigate(`/payment/${vaccineAppointmentId}`, { state: { paymentMethod: 'Cash' } });
        }
        setMessage('Xác nhận thành công. Chuyển hướng...');
        console.log('Confirmation response data:', response?.data);
    } catch (error) {
        setMessage('Xác nhận thanh toán thất bại. Vui lòng thử lại.');
        console.error('Error in handleConfirm:', error.response ? error.response.data : error.message);
    }
};

    const handleBack = () => {
        navigate('/vaccines', { state: { vaccineId: appointmentData.vaccineId } });
    };

    if (!appointmentData) return <p>Loading...</p>;

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">Xác Nhận Lịch Hẹn</h2>
            {message && <p className={message.includes('thành công') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
            <div className="mb-4">
                <p>Mã lịch hẹn: {appointmentData.vaccineAppointmentId}</p>
                <p>Vaccine: {appointmentData.vaccineName || 'Không có'} - Giá: {appointmentData.price ? `${appointmentData.price} VNĐ` : 'Chưa có'}</p>
                <p>Ngày hẹn: {new Date(appointmentData.appointmentDate).toLocaleDateString('vi-VN')}</p>
                <p>Địa điểm: {appointmentData.location}</p>
                <p>Ghi chú: {appointmentData.notes || 'Không có'}</p>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Phương thức thanh toán</label>
                <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                >
                    <option value="">Chọn phương thức</option>
                    <option value="vnpay">Thanh toán qua VNPay</option>
                    <option value="later">Thanh toán sau</option>
                </select>
                {selectedMethod === 'vnpay' && (
                    <select
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Chọn ngân hàng</option>
                        <option value="NCB">Ngân hàng NCB</option>
                        <option value="AGRIBANK">Ngân hàng Agribank</option>
                        <option value="SCB">Ngân hàng SCB</option>
                    </select>
                )}
            </div>
            <button
                onClick={handleConfirm}
                className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700 mb-2"
            >
                Xác Nhận
            </button>
            <button
                onClick={handleBack}
                className="w-full p-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
                Quay Lại
            </button>
        </div>
    );
};

export default ConfirmationPage;