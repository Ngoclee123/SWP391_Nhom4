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
import axiosClient from '../api/axiosClient';

const FeedbackService = {
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
};

export default FeedbackService;