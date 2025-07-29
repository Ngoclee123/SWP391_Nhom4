import axiosClient from '../api/axiosClient';

const MedicalRecordService = {
  getAll: () => axiosClient.get('/api/medical-records'),
  getById: (id) => axiosClient.get(`/api/medical-records/${id}`),
  getByPatientId: (patientId) => axiosClient.get(`/api/medical-records/patient/${patientId}`),
  getByDoctorId: (doctorId) => axiosClient.get(`/api/medical-records/doctor/${doctorId}`),
  create: (data) => axiosClient.post('/api/medical-records', data),
  update: (id, data) => axiosClient.put(`/api/medical-records/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/medical-records/${id}`),
};

export default MedicalRecordService;