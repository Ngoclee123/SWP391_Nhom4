import axiosClient from "../api/axiosClient";

const DoctorService = {
  getAllDoctors: async () => {
    try {
      console.log("Fetching all doctors");
      const response = await axiosClient.get("/api/doctors");
      console.log("Doctors response:", response);

      if (!response) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      if (response.error) {
        return { error: response.error };
      }

      if (!response.data) {
        return { error: "Định dạng dữ liệu không hợp lệ" };
      }

      return response;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return {
        error:
          error.response?.data?.error ||
          error.message ||
          "Không thể tải danh sách bác sĩ",
      };
    }
  },

  getDoctorById: async (id) => {
    try {
      console.log(`Fetching doctor with ID: ${id}`);
      const response = await axiosClient.get(`/api/doctors/${id}`);
      console.log("Doctor response:", response);

      if (!response) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      if (response.error) {
        return { error: response.error };
      }

      return response;
    } catch (error) {
      console.error(`Error fetching doctor ${id}:`, error);
      return {
        error: error.error || "Không thể tải thông tin bác sĩ",
      };
    }
  },

  getAvailableSlots: async (doctorId, date) => {
    try {
      console.log(`Fetching available slots for doctor ${doctorId} on ${date}`);
      const response = await axiosClient.get(
        `/api/doctors/${doctorId}/available-slots`,
        {
          params: { date },
        }
      );
      console.log("Available slots response:", response);

      if (!response) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      if (response.error) {
        return { error: response.error };
      }

      return response;
    } catch (error) {
      console.error(`Error fetching slots for doctor ${doctorId}:`, error);
      return {
        error: error.error || "Không thể tải lịch trống",
      };
    }
  },

  searchDoctors: async (searchParams) => {
    try {
      console.log("Searching doctors with params:", searchParams);
      const response = await axiosClient.get("/api/doctors/search", {
        params: searchParams,
      });
      console.log("Search response:", response);

      if (!response) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      if (response.error) {
        return { error: response.error };
      }

      return response;
    } catch (error) {
      console.error("Error searching doctors:", error);
      return {
        error: error.error || "Không thể tìm kiếm bác sĩ",
      };
    }
  },

  getAllSpecialties: async () => {
    try {
      console.log("Fetching all specialties");
      const response = await axiosClient.get("/api/doctors/specialties");
      console.log("Specialties response:", response);

      if (!response) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      if (response.error) {
        return { error: response.error };
      }

      return response;
    } catch (error) {
      console.error("Error fetching specialties:", error);
      return {
        error: error.error || "Không thể tải danh sách chuyên khoa",
      };
    }
  },
};

export default DoctorService;
