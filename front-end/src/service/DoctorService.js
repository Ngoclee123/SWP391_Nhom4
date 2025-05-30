import axiosClient from "../api/axiosClient";

class DoctorService {
    /**
     * Fetches the list of all specialties from the server.
     * 
     * @returns {Promise} A promise that resolves to the response from the server containing the list of specialties.
     */

    getSpecialties() {
        const url = '/api/doctors/specialties';
        return axiosClient.get(url);
    }

    searchDoctors(criteria) {
        const url = '/api/doctors/search';
        return axiosClient.get(url, { params: criteria });
    }
}

export default DoctorService;