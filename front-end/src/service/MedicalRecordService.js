import axiosClient from '../api/axiosClient';

const MedicalRecordService = {
  getAll: () => axiosClient.get('/api/medical-records'),
  getAllPaginated: (page = 0, size = 10) => axiosClient.get(`/api/medical-records?page=${page}&size=${size}`),
  getAllList: () => axiosClient.get('/api/medical-records/all'),
  getById: (id) => axiosClient.get(`/api/medical-records/${id}`),
  getByPatientId: (patientId) => axiosClient.get(`/api/medical-records/patient/${patientId}`),
  getByDoctorId: (doctorId) => axiosClient.get(`/api/medical-records/doctor/${doctorId}/all`),
  getByDoctorIdPaginated: (doctorId, page = 0, size = 10) => axiosClient.get(`/api/medical-records/doctor/${doctorId}?page=${page}&size=${size}`),
  create: (data) => axiosClient.post('/api/medical-records', data),
  update: (id, data) => axiosClient.put(`/api/medical-records/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/medical-records/${id}`),
};

export default MedicalRecordService;