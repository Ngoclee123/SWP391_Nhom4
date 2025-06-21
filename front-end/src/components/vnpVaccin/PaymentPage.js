import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VaccineAppointmentService from '../../service/VaccineAppointmentService';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { vaccineAppointmentId } = useParams();
    const [paymentData, setPaymentData] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                const data = await VaccineAppointmentService.getPaymentByVaccineAppointmentId(vaccineAppointmentId);
                setPaymentData(data);
            } catch (error) {
                setMessage('Không thể tải thông tin thanh toán.');
            }
        };
        fetchPaymentData();
    }, [vaccineAppointmentId]);

    const handlePayment = async () => {
        if (!selectedMethod) {
            setMessage('Vui lòng chọn phương thức thanh toán.');
            return;
        }
        try {
            if (selectedMethod === 'vnpay') {
                const response = await VaccineAppointmentService.createVNPayPayment(vaccineAppointmentId);
                window.location.href = response.paymentUrl;
            } else if (selectedMethod === 'later') {
                const response = await VaccineAppointmentService.createPayment(vaccineAppointmentId, { method: 'Cash' });
                setMessage('Đặt lịch thành công. Thanh toán sẽ được xử lý sau.');
                setTimeout(() => navigate('/home'), 2000);
            }
        } catch (error) {
            setMessage('Thanh toán thất bại. Vui lòng thử lại.');
        }
    };

    const handleRefundRequest = async () => {
        try {
            await VaccineAppointmentService.requestRefund(vaccineAppointmentId);
            setMessage('Yêu cầu hoàn tiền đã được gửi.');
        } catch (error) {
            setMessage('Không thể gửi yêu cầu hoàn tiền.');
        }
    };

    if (!paymentData) return <p>Loading...</p>;

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">Thanh Toán Lịch Hẹn</h2>
            {message && <p className={message.includes('thành công') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
            <div className="mb-4">
                <p>Mã lịch hẹn: {vaccineAppointmentId}</p>
                <p>Tổng phí: {paymentData.amount} VNĐ</p>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Phương thức thanh toán</label>
                <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Chọn phương thức</option>
                    <option value="vnpay">Thanh toán qua VNPay</option>
                    <option value="later">Thanh toán sau</option>
                </select>
            </div>
            <button
                onClick={handlePayment}
                className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
                Xác nhận thanh toán
            </button>
            {paymentData.status === 'Completed' && (
                <button
                    onClick={handleRefundRequest}
                    className="mt-4 w-full p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                    Yêu cầu hoàn tiền
                </button>
            )}
        </div>
    );
};

export default PaymentPage;