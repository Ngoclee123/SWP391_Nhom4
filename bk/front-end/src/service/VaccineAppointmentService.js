
    // VaccineAppointmentService.js
    import axiosClient from '../api/axiosClient';

    const VaccineAppointmentService = {
        getAllVaccines: () => axiosClient.get('/api/vaccines'),
        getVaccine: (vaccineId) => axiosClient.get(`/api/vaccines/${vaccineId}`),
        getPatients: () => axiosClient.get('/api/parents/patients'),
        getVaccineAvailability: (vaccineId) => axiosClient.get(`/api/vaccine-appointments/availability/${vaccineId}`),
        createVaccineAppointment: (appointmentData) => {
            const request = {
                patientId: appointmentData.patientId,
                vaccineId: appointmentData.vaccineId,
                appointmentDate: appointmentData.appointmentDate,
                doseNumber: appointmentData.doseNumber || 1,
                location: appointmentData.location,
                notes: appointmentData.notes,
                paymentMethod: appointmentData.paymentMethod,
                bankCode: appointmentData.bankCode  
            };
            return axiosClient.post('/api/vaccine-appointments', request);
        },
        addPatient: (patientData) => {
            const request = {
                fullName: patientData.fullName,
                dateOfBirth: patientData.dateOfBirth,
                gender: patientData.gender,
                weight: patientData.weight || null,
                height: patientData.height || null
            };
            return axiosClient.post('/api/parents/patients', request);
        },
        getPaymentByVaccineAppointmentId: (vaccineAppointmentId) => axiosClient.get(`/api/vaccine-appointments/${vaccineAppointmentId}/payment`),
        createVNPayPayment: (vaccineAppointmentId) => axiosClient.post(`/api/vnpay/create-payment`, { vaccineAppointmentId }, { headers: { userId: localStorage.getItem('accountId') } }),
        createPayment: (vaccineAppointmentId, paymentData) => axiosClient.post(`/api/payments`, { ...paymentData, vaccineAppointmentId }),
        requestRefund: (vaccineAppointmentId) => axiosClient.post(`/api/vaccine-appointments/${vaccineAppointmentId}/refund`)
    };

    export default VaccineAppointmentService;


