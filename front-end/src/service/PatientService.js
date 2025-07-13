import axiosClient from '../api/axiosClient';

class PatientService {
  async getPatientById(id) {
    const res = await axiosClient.get(`/api/patients/${id}`);
    return res.data;
  }
}

export default new PatientService(); 