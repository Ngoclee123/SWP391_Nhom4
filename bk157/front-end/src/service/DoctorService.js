import axiosClient from "../api/axiosClient";

class DoctorService {
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
        const url = '/api/doctors/specialties';
        console.log(`Fetching specialties from: ${url}`);
        try {
            const response = await axiosClient.get(url);
            console.log('Specialties response:', response);
            return response;
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
            return response; // Expect { content: [], totalPages: number, ... }
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

    async createDoctor(data) {
        // Đảm bảo specialty là object {id: ...} và dateOfBirth là yyyy-MM-dd
        const payload = {
            ...data,
            specialty: typeof data.specialty === 'object' ? data.specialty : { id: Number(data.specialty) },
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth : null,
        };
        return axiosClient.post('/api/doctors', payload);
    }

    async updateDoctor(id, data) {
        const payload = {
            ...data,
            specialty: typeof data.specialty === 'object' ? data.specialty : { id: Number(data.specialty) },
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth : null,
        };
        return axiosClient.put(`/api/doctors/${id}`, payload);
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
}

export default new DoctorService();