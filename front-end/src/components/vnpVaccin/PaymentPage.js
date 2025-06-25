import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { vaccineAppointmentId } = useParams();

    const handleBack = () => {
        navigate('/home');
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">Thanh Toán Thành Công</h2>
            <p className="text-green-600 mb-4">Thanh toán thành công! Trạng thái: Pending.</p>
            <p>Mã lịch hẹn: {vaccineAppointmentId}</p>
            <button
                onClick={handleBack}
                className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700 mt-4"
            >
                Quay Lại Trang Chủ
            </button>
        </div>
    );
};

export default PaymentPage;