import axiosClient from '../api/axiosClient';

class VaccineService {
  async getVaccineById(id) {
    const res = await axiosClient.get(`/api/vaccines/${id}`);
    return res.data;
  }
}

export default new VaccineService(); 