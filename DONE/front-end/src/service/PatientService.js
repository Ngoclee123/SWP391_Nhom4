import axiosClient from '../api/axiosClient';

class PatientService {
  async getPatientId(id) {
    const res = await axiosClient.get(`/api/patients/${id}`);
    return res.data;
  }


   // Nếu là admin thì lấy toàn bộ, nếu là user thì lấy theo parent
  getAllPatients(isAdmin = false) {
    return axiosClient.get(isAdmin ? "/api/admin/patients" : "/api/parents/patients");
  }
  getPatientById(id) {
    return axiosClient.get(`/api/parents/patients/${id}`);
  }
  addPatient(data) {
    console.log('Sending addPatient request with data:', data);
    return axiosClient.post("/api/parents/patients", data);
  }
  updatePatient(id, data, isAdmin = false) {
    if (isAdmin) {
      return axiosClient.put(`/api/admin/patients/${id}`, data);
    }
    return axiosClient.put(`/api/parents/patients/${id}`, data);
  }
  deletePatient(id, isAdmin = false) {
    if (isAdmin) {
      return axiosClient.delete(`/api/admin/patients/${id}`);
    }
    return axiosClient.delete(`/api/parents/patients/${id}`);
  }
  getPatientStats() {
    return axiosClient.get('/api/admin/patient-stats');
  }

};

export default new PatientService(); 