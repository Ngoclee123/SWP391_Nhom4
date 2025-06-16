import axiosClient from "../api/axiosClient";

const VaccineAppointmentService = {
    getVaccines: () => axiosClient.get('/api/vaccines'),
    getVaccine: (vaccineId) => axiosClient.get(`/api/vaccines/${vaccineId}`),
    getPatients: () => axiosClient.get('/api/parents/patients'),
    getVaccineAvailability: (vaccineId) => axiosClient.get(`/api/vaccine-appointments/availability/${vaccineId}`),
    createAppointment: (appointmentData) => axiosClient.post('/api/vaccine-appointments', {
        patientId: appointmentData.patientId,
        vaccineId: appointmentData.vaccineId,
        appointmentDate: appointmentData.appointmentDate,
        location: appointmentData.location,
        notes: appointmentData.notes
    }),
};

export default VaccineAppointmentService;