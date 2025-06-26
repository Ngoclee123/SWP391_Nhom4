// src/service/DoctorService.js
import axiosClient from "../api/axiosClient";

class DoctorService {async getAllDoctors() {
    const url = '/api/doctors';
    console.log(`Fetching all doctors from: ${url}`);
    try {
      const response = await axiosClient.get(url);
      console.log('Doctors response (raw):', response);
      // Đảm bảo response là mảng
      const data = Array.isArray(response) ? response : (response.data || []);
      return {
        data: data,
        message: data.length > 0 ? 'Danh sách bác sĩ đã được tải' : 'Không có bác sĩ nào'
      };
    } catch (error) {
      console.error('Error fetching doctors:', error.response ? error.response.data : error.message);
      return {
        data: [],
        message: 'Lỗi khi lấy danh sách bác sĩ: ' + (error.message || 'Không xác định')
      };
    }
  }
    
    

    async getDoctorById(doctorId) {
        const url = `/api/doctors/${doctorId}`;
        console.log(`Fetching doctor profile from: ${url}`);
        try {
            const response = await axiosClient.get(url);
            console.log('Doctor profile response:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching doctor details:', error);
            throw error;
        }
    }

    async getAllSpecialties() {
        const url = '/api/doctors/specialties';
        console.log(`Fetching specialties from: ${url}`);
        try {
            const response = await axiosClient.get(url);
            console.log('Specialties response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching specialties:', error);
            return [];
        }
    }
    async getScheduleByDoctorId(doctorId) {
        const url = '/api/doctor-availability/doctor/${doctorId}';
        try {
            const response = await axiosClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching doctor schedule:', error);
            throw error;
        }
    }
    async getAppointmentsByDoctorId(doctorId) {
        const url = `/api/appointments/doctor/${doctorId}`;
        try {
            const response = await axiosClient.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }
    }
    
    async searchDoctors(criteria) {
        const url = '/api/doctors/search';
        const config = {
            params: {
                ...criteria,
                specialtyId: criteria.specialtyId ? parseInt(criteria.specialtyId) : undefined
            }
        };
        console.log('Searching doctors with criteria:', criteria, 'and config:', config);
        try {
            const response = await axiosClient.get(url, config);
            console.log('Search response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching doctor IDs:', error);
            if (error.response && error.response.status === 401) {
                console.warn('Unauthorized access - Please log in');
            }
            return [];
        }
    }

    async getCertificatesByDoctorId(doctorId) {
    const url = `/api/doctors/${doctorId}/certificates`; // Cần tạo API này
    try {
      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching certificates:", error);
      return [];
    }
  }

  async getFeedbackByDoctorId(doctorId) {
    const url = `/api/feedback/doctor/${doctorId}`; // Cần tạo API này
    try {
      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      return [];
    }
  }
}

export default new DoctorService();