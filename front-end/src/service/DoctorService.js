import axiosClient from "../api/axiosClient";

class DoctorService {
    //
    

    //
    async getAllDoctors() {
        const url = '/api/doctors';
        console.log(`Fetching all doctors from: ${url}`);
        try {
            const response = await axiosClient.get(url);
            console.log('Doctors response (raw):', response);
            const data = response.data && response.data.data ? response.data.data : (response.data || []);    
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

    //
    async getAllDoctorsBySpecialty(specialtyId) {
        const url = `/api/doctors/specialty/${specialtyId}/all`;
        console.log(`Fetching all doctors for specialty ${specialtyId} from: ${url}`);
        try {
            const response = await axiosClient.get(url);
            console.log('All doctors response:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching all doctors:', error);
            return { data: [] }; // Trả về đối tượng với data rỗng để xử lý đồng nhất
        }
    }
//
    async getScheduleByDoctorId(doctorId) {
        const url = `/api/doctor-availability/doctor/${doctorId}`;
        try {
            const response = await axiosClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching doctor schedule:', error);
            throw error;
        }
    }
//
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
//

async getCertificatesByDoctorId(doctorId) {
    const url = `/api/doctors/${doctorId}/certificates`;
    try {
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching certificates:", error);
        return [];
    }
}

async getFeedbackByDoctorId(doctorId) {
    const url = `/api/feedback/doctor/${doctorId}`;
    try {
        const response = await axiosClient.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return [];
    }
}



    async getDoctorById(doctorId) {
        const url = `/api/doctors/${doctorId}`;
        console.log(`Fetching doctor profile from: ${url}`);
        try {
            const response = await axiosClient.get(url);
            console.log('Doctor profile response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
            throw new Error(error.response?.data?.error || 'Không thể tải thông tin bác sĩ');
        }
    }


    async getAllSpecialties() {
        const url = '/api/doctors/special';
        console.log(`Fetching specialties from: ${url}`);
        try {
            const response = await axiosClient.get(url);
            console.log('Specialties response:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching specialties:', error);
            throw new Error('Không thể tải danh sách chuyên khoa');
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
            return response.data; // Trả về object { content: [], totalPages, ... }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            if (error.response?.status === 401) {
                throw new Error('Unauthorized access - Please log in');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data.error || 'Dữ liệu tìm kiếm không hợp lệ');
            } else {
                throw new Error(error.response?.data?.error || 'Không thể tìm kiếm bác sĩ');
            }
        }
    }

    async getRecommendedDoctors(limit = 10) {
        const url = '/api/doctors/recommended';
        const config = {
            params: { limit }
        };
        try {
            const response = await axiosClient.get(url, config);
            console.log('Recommended doctors response:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching recommended doctors:', error);
            throw new Error(error.response?.data?.error || 'Không thể tải danh sách bác sĩ được gợi ý');
        }
    }

    async createDoctor(data) {
        return axiosClient.post('/api/doctors', data);
    }

    async updateDoctor(id, data) {
        return axiosClient.put(`/api/doctors/${id}`, data);
    }

    async deleteDoctor(id) {
        return axiosClient.delete(`/api/doctors/${id}`);
    }

  // ADMIN: Lấy chi tiết bác sĩ kèm certificates
  async getDoctorEntityById(id) {
    return axiosClient.get(`/api/doctors/entity/${id}`);
}

// ADMIN: Lấy danh sách chứng chỉ
async getAllCertificates() {
    return axiosClient.get('/api/doctors/certificates');
}

async uploadAvatar(formData) {
    // interceptor đã trả về response.data, nên response là chuỗi đường dẫn ảnh
    const response = await axiosClient.post('/api/doctors/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
}

// Lấy danh sách bác sĩ online
async getOnlineDoctors() {
    // Gọi API backend trả về danh sách bác sĩ online
    return await axiosClient.get('/api/doctors/online');
}

  // ADMIN: Lấy danh sách chứng chỉ của bác sĩ (API riêng admin)
  async getAdminCertificatesByDoctorId(doctorId) {
    const res = await axiosClient.get(`/api/admin/doctors/${doctorId}/certificates`);
    return res.data || [];
}


}

export default new DoctorService();