// src/service/DoctorService.js
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
}

export default new DoctorService();