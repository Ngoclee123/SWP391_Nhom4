// import axiosClient from '../api/axiosClient';

// const FeedbackService = {
//   async getFeedbacksForDoctor(doctorId) {
//     try {
//       const res = await axiosClient.get(`/api/feedbacks/doctor/${doctorId}`);
//       if (res && Array.isArray(res.data)) return res.data;
//       if (Array.isArray(res)) return res;
//       return [];
//     } catch (e) {
//       return [];
//     }
//   }
// };

// export default FeedbackService;
// import axiosClient from '../api/axiosClient';

// const FeedbackService = {


//   async getFeedbacksForDoctor(doctorId) {
//     try {
//       const res = await axiosClient.get(`/api/feedbacks/doctor/${doctorId}`);
//       if (res && Array.isArray(res.data)) return res.data;
//       if (Array.isArray(res)) return res;
//       return [];
//     } catch (e) {
//       return [];
//     }
//   }


// };

// export default FeedbackService;


import axiosClient from "../api/axiosClient";


/**
 * FeedbackService - Service để gọi API feedback từ frontend
 *
 * Cách hoạt động:
 * 1. getDoctorFeedbacks: Lấy tất cả feedback của một bác sĩ
 * 2. createFeedback: Tạo feedback mới
 * 3. updateFeedback: Cập nhật feedback
 * 4. deleteFeedback: Xóa feedback
 * 5. markAsRead: Đánh dấu feedback đã đọc
 * 6. getAllFeedbacks: Lấy tất cả feedback (admin)
 *
 * Tất cả method đều sử dụng axiosClient để gọi API backend
 * và xử lý error một cách thống nhất
 */
class FeedbackService {
  /**
   * Lấy tất cả feedback của một bác sĩ
   * @param {number} doctorId - ID của bác sĩ
   * @returns {Promise<Array>} - Danh sách feedback
   */

  async getFeedbacksForDoctor(doctorId) {
        try {
          const res = await axiosClient.get(`/api/feedbacks/doctor/${doctorId}`);
          if (res && Array.isArray(res.data)) return res.data;
          if (Array.isArray(res)) return res;
          return [];
        } catch (e) {
          return [];
        }
      }
  async getDoctorFeedbacks(doctorId) {
    try {
      console.log(
        `FeedbackService: Fetching feedbacks for doctor ID: ${doctorId}`
      );


      const response = await axiosClient.get(
        `/api/feedbacks/doctor/${doctorId}`
      );


      console.log("Raw API response:", response);
      console.log("Response data:", response.data);


      // API trả về trực tiếp array trong response.data
      const feedbacks = Array.isArray(response.data) ? response.data : [];


      console.log(
        `FeedbackService: Successfully fetched ${feedbacks.length} feedbacks for doctor ID: ${doctorId}`
      );
      return feedbacks;
    } catch (error) {
      console.error(
        `FeedbackService: Error fetching feedbacks for doctor ID: ${doctorId}`,
        error
      );


      // Xử lý các loại error khác nhau
      if (error.response) {
        // Server trả về error response
        const errorMessage =
          error.response.data?.message || "Không thể lấy danh sách feedback";
        throw new Error(errorMessage);
      } else if (error.request) {
        // Network error
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        // Other error
        throw new Error("Đã xảy ra lỗi không xác định");
      }
    }
  }


  /**
   * Tạo feedback mới
   * @param {Object} feedbackData - Dữ liệu feedback
   * @param {number} feedbackData.doctorId - ID bác sĩ
   * @param {number} feedbackData.parentId - ID phụ huynh
   * @param {number} feedbackData.appointmentId - ID cuộc hẹn (optional)
   * @param {number} feedbackData.rating - Đánh giá (1-5)
   * @param {string} feedbackData.comment - Nội dung phản hồi (optional)
   * @returns {Promise<Object>} - Feedback đã tạo
   */
  async createFeedback(feedbackData) {
    try {
      console.log("FeedbackService: Creating new feedback:", feedbackData);


      // Validate dữ liệu đầu vào
      this.validateFeedbackData(feedbackData);


      const response = await axiosClient.post("/api/feedbacks", feedbackData);


      console.log(
        "FeedbackService: Successfully created feedback:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("FeedbackService: Error creating feedback:", error);


      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Không thể tạo feedback";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        throw new Error("Đã xảy ra lỗi không xác định");
      }
    }
  }


  /**
   * Cập nhật feedback
   * @param {number} feedbackId - ID của feedback
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object>} - Feedback đã cập nhật
   */
  async updateFeedback(feedbackId, updateData) {
    try {
      console.log(
        `FeedbackService: Updating feedback ID: ${feedbackId}`,
        updateData
      );


      const response = await axiosClient.put(
        `/api/feedbacks/${feedbackId}`,
        updateData
      );


      console.log(
        `FeedbackService: Successfully updated feedback ID: ${feedbackId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `FeedbackService: Error updating feedback ID: ${feedbackId}`,
        error
      );


      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Không thể cập nhật feedback";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        throw new Error("Đã xảy ra lỗi không xác định");
      }
    }
  }


  /**
   * Xóa feedback
   * @param {number} feedbackId - ID của feedback
   * @returns {Promise<Object>} - Kết quả xóa
   */
  async deleteFeedback(feedbackId) {
    try {
      console.log(`FeedbackService: Deleting feedback ID: ${feedbackId}`);


      const response = await axiosClient.delete(`/api/feedbacks/${feedbackId}`);


      console.log(
        `FeedbackService: Successfully deleted feedback ID: ${feedbackId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `FeedbackService: Error deleting feedback ID: ${feedbackId}`,
        error
      );


      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Không thể xóa feedback";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        throw new Error("Đã xảy ra lỗi không xác định");
      }
    }
  }


  /**
   * Đánh dấu feedback đã đọc
   * @param {number} feedbackId - ID của feedback
   * @returns {Promise<Object>} - Kết quả đánh dấu
   */
  async markAsRead(feedbackId) {
    try {
      console.log(
        `FeedbackService: Marking feedback as read ID: ${feedbackId}`
      );


      const response = await axiosClient.patch(
        `/api/feedbacks/${feedbackId}/read`
      );


      console.log(
        `FeedbackService: Successfully marked feedback as read ID: ${feedbackId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `FeedbackService: Error marking feedback as read ID: ${feedbackId}`,
        error
      );


      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Không thể đánh dấu feedback đã đọc";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        throw new Error("Đã xảy ra lỗi không xác định");
      }
    }
  }


  /**
   * Lấy tất cả feedback (cho admin)
   * @returns {Promise<Array>} - Danh sách tất cả feedback
   */
  async getAllFeedbacks() {
    try {
      console.log("FeedbackService: Fetching all feedbacks");


      const response = await axiosClient.get("/api/feedbacks");


      const feedbacks = Array.isArray(response) ? response : [];


      console.log(
        `FeedbackService: Successfully fetched ${feedbacks.length} total feedbacks`
      );
      return feedbacks;
    } catch (error) {
      console.error("FeedbackService: Error fetching all feedbacks", error);


      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Không thể lấy danh sách feedback";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        throw new Error("Đã xảy ra lỗi không xác định");
      }
    }
  }


  /**
   * Validate dữ liệu feedback trước khi gửi
   * @param {Object} feedbackData - Dữ liệu feedback
   */
  validateFeedbackData(feedbackData) {
    if (!feedbackData.doctorId) {
      throw new Error("Doctor ID không được để trống");
    }


    if (!feedbackData.parentId) {
      throw new Error("Parent ID không được để trống");
    }


    if (
      !feedbackData.rating ||
      feedbackData.rating < 1 ||
      feedbackData.rating > 5
    ) {
      throw new Error("Rating phải từ 1 đến 5");
    }


    // Comment là optional, không cần validate
  }


  /**
   * Utility method để format feedback data trước khi gửi
   * @param {Object} rawData - Dữ liệu thô từ form
   * @returns {Object} - Dữ liệu đã format
   */
  formatFeedbackData(rawData) {
    return {
      doctorId: parseInt(rawData.doctorId),
      parentId: parseInt(rawData.parentId),
      appointmentId: rawData.appointmentId
        ? parseInt(rawData.appointmentId)
        : null,
      rating: parseInt(rawData.rating),
      comment: rawData.comment ? rawData.comment.trim() : null,
    };
  }
}


// Export singleton instance
const feedbackService = new FeedbackService();
export default feedbackService;





