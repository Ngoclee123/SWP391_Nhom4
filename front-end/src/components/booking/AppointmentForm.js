import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppointmentService from '../../service/AppointmentService';

function AppointmentForm() {
    const location = useLocation();
    const { doctor } = location.state || {};

    const [appointmentData, setAppointmentData] = useState({
        doctorId: doctor?.doctorId || '',
        appointmentTime: '',
        totalFee: 500000, // Giả sử phí cố định
        paymentMethod: 'VNPay',
        bankCode: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const appointmentService = new AppointmentService();

    useEffect(() => {
        if (doctor) {
            setAppointmentData((prev) => ({ ...prev, doctorId: doctor.doctorId }));
        }
    }, [doctor]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAppointmentData({ ...appointmentData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userId = 1; // Giả sử userId được lấy từ context hoặc localStorage
            // Bước 1: Tạo lịch hẹn (nếu cần tách riêng bước này)
            await appointmentService.bookAppointment(userId, appointmentData);
            // Bước 2: Tạo URL thanh toán VNPay
            const response = await appointmentService.createPayment(userId, appointmentData);
            window.location.href = response.paymentUrl;
        } catch (error) {
            console.error('Error creating payment:', error);
            setMessage('Failed to create payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Book Appointment</h2>
                {message && (
                    <p className={`text-center mb-4 p-2 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Doctor</label>
                        <input
                            type="text"
                            value={doctor?.fullName || 'Select a doctor'}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Appointment Time</label>
                        <input
                            type="datetime-local"
                            name="appointmentTime"
                            value={appointmentData.appointmentTime}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Total Fee (VND)</label>
                        <input
                            type="number"
                            name="totalFee"
                            value={appointmentData.totalFee}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={appointmentData.paymentMethod}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="VNPay">VNPay</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Bank Code (Optional)</label>
                        <select
                            name="bankCode"
                            value={appointmentData.bankCode}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select Bank (Optional)</option>
                            <option value="NCB">NCB</option>
                            <option value="VNPAYQR">VNPay QR</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white p-3 rounded-lg hover:bg-secondary transition duration-300"
                        disabled={loading || !doctor}
                    >
                        {loading ? 'Processing...' : 'Book and Pay'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AppointmentForm;