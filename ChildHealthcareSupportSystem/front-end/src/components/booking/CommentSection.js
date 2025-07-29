
import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaUser,
  FaCalendarAlt,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";
import FeedbackService from "../../service/FeedbackService";
import userService from "../../service/userService";


/**
 * CommentSection Component - Hiển thị và tạo feedback cho bác sĩ
 *
 * Props:
 * - doctorId: ID của bác sĩ
 * - parentId: ID của phụ huynh (từ DoctorDetail)
 *
 * Cách hoạt động:
 * 1. Hiển thị danh sách feedback hiện có của bác sĩ
 * 2. Cho phép phụ huynh tạo feedback mới nếu đã login
 * 3. Hiển thị form đánh giá với rating (1-5 sao) và comment
 * 4. Gửi feedback qua FeedbackService
 */
const CommentSection = ({ doctorId, parentId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // State cho form tạo feedback
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");


  // Load feedbacks khi component mount
  useEffect(() => {
    console.log("🔍 CommentSection useEffect triggered");
    console.log("📋 Received doctorId:", doctorId);
    console.log("📋 Type of doctorId:", typeof doctorId);


    if (doctorId) {
      console.log("✅ doctorId is valid, calling fetchFeedbacks");
      fetchFeedbacks();
    } else {
      console.log("❌ doctorId is invalid:", doctorId);
    }
  }, [doctorId]);


  // Kiểm tra điều kiện hiển thị form feedback
  useEffect(() => {
    console.log("===> FEEDBACK DEBUG <===");
    console.log("doctorId:", doctorId);
    console.log("parentId:", parentId);
    console.log("feedbacks:", feedbacks);
    console.log("feedbacks length:", feedbacks.length);


    // Kiểm tra user đã login
    const isLoggedIn = userService.isLoggedIn();
    // const userInfo = userService.getUserInfo(); // REMOVE THIS LINE
    // Thay thế userInfo bằng các hàm riêng lẻ nếu cần
    // Ví dụ:
    // const username = userService.getUsername();
    // const fullName = userService.getFullName();
    // const accountId = userService.getAccountId();
    // const role = userService.getRole();


    console.log("isLoggedIn:", isLoggedIn);
    // console.log("userInfo:", userInfo); // REMOVE THIS LINE


    // Hiển thị form nếu user đã login (không cần kiểm tra completed appointments)
    setShowFeedbackForm(isLoggedIn);
  }, [doctorId, parentId, feedbacks]);


  /**
   * Lấy danh sách feedback của bác sĩ
   */
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");


      console.log("🔄 Fetching feedbacks for doctorId:", doctorId);
      const feedbackList = await FeedbackService.getDoctorFeedbacks(doctorId);


      console.log("✅ API Response:", feedbackList);
      console.log("📊 Data type:", Array.isArray(feedbackList));
      console.log("📝 Number of feedbacks:", feedbackList?.length || 0);


      if (feedbackList && feedbackList.length > 0) {
        console.log("🔍 First feedback sample:", feedbackList[0]);
      }


      setFeedbacks(feedbackList || []);
    } catch (err) {
      console.error("❌ Error fetching feedbacks:", err);
      setError("Không thể tải danh sách đánh giá");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };


  /**
   * Kiểm tra xem phụ huynh đã có feedback cho doctor này chưa
   */
  const hasExistingFeedback = () => {
    return feedbacks.some((fb) => fb.parent?.id === parentId);
  };


  /**
   * Xử lý submit feedback
   */
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();


    console.log("🚀 Form submitted!");
    console.log("📊 Current form data:", {
      doctorId,
      parentId,
      rating,
      comment,
    });


    if (rating === 0) {
      setSubmitError("Vui lòng chọn số sao đánh giá");
      return;
    }


    try {
      setSubmitting(true);
      setSubmitError("");


      console.log("📝 Formatting feedback data...");


      // Lấy parentId - ưu tiên từ props, nếu không có thì lấy từ API
      let effectiveParentId = parentId;


      if (!effectiveParentId) {
        const accountId = userService.getAccountId();
        console.log("🔍 Getting parentId from accountId:", accountId);


        try {
          effectiveParentId = await userService.getParentIdFromAccountId(
            accountId
          );
          console.log("✅ Got parentId:", effectiveParentId);
        } catch (error) {
          console.error("❌ Error getting parentId:", error);
          setSubmitError(
            "Không thể lấy thông tin phụ huynh. Vui lòng thử lại."
          );
          return;
        }
      }


      if (!effectiveParentId) {
        setSubmitError("Không tìm thấy thông tin phụ huynh.");
        return;
      }


      const feedbackData = FeedbackService.formatFeedbackData({
        doctorId: doctorId,
        parentId: effectiveParentId,
        appointmentId: null, // Không cần appointmentId
        rating: rating,
        comment: comment,
      });


      console.log("✅ Formatted data:", feedbackData);
      console.log("🌐 Calling API...");
      await FeedbackService.createFeedback(feedbackData);


      // Reset form
      setRating(0);
      setComment("");
      setShowFeedbackForm(false);


      // Reload feedbacks
      await fetchFeedbacks();


      alert("Cảm ơn bạn đã đánh giá!");
    } catch (err) {
      console.error("Error creating feedback:", err);
      setSubmitError(err.message || "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };


  /**
   * Render rating stars
   */
  const renderStars = (
    currentRating,
    interactive = false,
    size = "text-base"
  ) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${size} ${
            i <= (interactive ? hoverRating || rating : currentRating)
              ? "text-yellow-400"
              : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:text-yellow-500" : ""}`}
          onClick={interactive ? () => setRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      );
    }
    return stars;
  };


  /**
   * Format thời gian
   */
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Không xác định";
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaStar className="text-yellow-500 mr-3" />
        Đánh giá từ phụ huynh
      </h2>


      {/* Thông báo nếu chưa đăng nhập */}
      {!userService.isLoggedIn() && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            <strong>Đăng nhập để đánh giá:</strong> Bạn cần đăng nhập để có thể
            đánh giá bác sĩ.
          </p>
        </div>
      )}


      {/* Thông báo nếu đã có feedback */}
      {userService.isLoggedIn() && hasExistingFeedback() && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            <strong>Cảm ơn bạn đã đánh giá:</strong> Bạn đã đánh giá bác sĩ này
            rồi.
          </p>
        </div>
      )}


      {/* Form tạo feedback mới */}
      {showFeedbackForm && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Đánh giá bác sĩ
          </h3>


          <form onSubmit={handleSubmitFeedback}>
            {/* Rating stars */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá chất lượng khám bệnh *
              </label>
              <div className="flex items-center space-x-1">
                {renderStars(rating, true, "text-2xl")}
                <span className="ml-3 text-gray-600">
                  {rating > 0 ? `${rating}/5 sao` : "Chọn số sao"}
                </span>
              </div>
            </div>


            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét (tùy chọn)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Chia sẻ trải nghiệm của bạn về bác sĩ..."
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {comment.length}/500 ký tự
              </div>
            </div>


            {/* Error message */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {submitError}
              </div>
            )}


            {/* Submit button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowFeedbackForm(false);
                  setRating(0);
                  setComment("");
                  setSubmitError("");
                }}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Gửi đánh giá
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Danh sách feedback */}


      {loading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-2xl text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Đang tải đánh giá...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchFeedbacks}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Thử lại
          </button>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-8">
          <FaStar className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có đánh giá nào cho bác sĩ này</p>
          <p className="text-sm text-gray-500 mt-2">
            Debug: API có thể chưa trả về dữ liệu hoặc dữ liệu rỗng
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {feedback.parent?.fullName || "Phụ huynh"}
                    </h4>
                    <div className="flex items-center mt-1">
                      {renderStars(feedback.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {feedback.rating}/5 sao
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FaCalendarAlt className="mr-1" />
                  {formatDate(feedback.createdAt)}
                </div>
              </div>


              {feedback.comment && (
                <p className="text-gray-700 leading-relaxed">
                  {feedback.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default CommentSection;





