import React, { useState, useEffect } from 'react';
import AppointmentService from '../../service/AppointmentService';

function AppointmentHistory() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const appointmentService = new AppointmentService();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const userId = localStorage.getItem('userId') || 1;
            const response = await appointmentService.getAppointmentsByPatientId(userId);
            setAppointments(response.data || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setError('Failed to load appointment history');
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            const userId = localStorage.getItem('userId') || 1;
            await appointmentService.cancelAppointment(appointmentId, userId);
            // Refresh the list
            fetchAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading appointment history...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Appointment History</h2>
                
                {appointments.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
                        <p className="text-gray-600 text-lg">No appointments found.</p>
                        <p className="text-gray-500 mt-2">You haven't booked any appointments yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div key={appointment.appointmentId} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-semibold text-gray-800">
                                                Appointment #{appointment.appointmentId}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-gray-600 text-sm">Appointment Time</p>
                                                <p className="font-medium">{formatDateTime(appointment.appointmentTime)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-sm">Total Fee</p>
                                                <p className="font-medium">{appointment.totalFee.toLocaleString('vi-VN')} VND</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-sm">Payment Method</p>
                                                <p className="font-medium">{appointment.paymentMethod}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-sm">Created At</p>
                                                <p className="font-medium">{formatDateTime(appointment.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="ml-4">
                                        {appointment.status === 'Pending' && (
                                            <button
                                                onClick={() => cancelAppointment(appointment.appointmentId)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AppointmentHistory; 