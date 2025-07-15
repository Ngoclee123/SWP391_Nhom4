import axiosClient from "../api/axiosClient";

const PatientService = {
  // Nếu là admin thì lấy toàn bộ, nếu là user thì lấy theo parent
  getAllPatients: (isAdmin = false) => {
    return axiosClient.get(isAdmin ? "/api/admin/patients" : "/api/parents/patients");
  },
  getPatientById: (id) => {
    return axiosClient.get(`/api/parents/patients/${id}`);
  },
  addPatient: (data) => {
    console.log('Sending addPatient request with data:', data);
    return axiosClient.post("/api/parents/patients", data);
  },
  updatePatient: (id, data) => {
    console.log('Sending updatePatient request with id:', id, 'data:', data);
    return axiosClient.put(`/api/parents/patients/${id}` , data);
  },
  deletePatient: (id) => {
    return axiosClient.delete(`/api/parents/patients/${id}`);
  },
  getPatientStats: () => {
    return axiosClient.get('/api/admin/patient-stats');
  },
};

export default PatientService;
