import axiosClient from '../api/axiosClient';

const FeedbackService = {
  getFeedbacksForDoctor: (doctorId) =>
    axiosClient.get(`/api/feedbacks/doctor/${doctorId}`),
};

export default FeedbackService;