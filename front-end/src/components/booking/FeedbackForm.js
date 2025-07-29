import React, { useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";

const FeedbackForm = ({ doctorId, parentId, appointmentId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!rating) {
      setError("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (!comment.trim()) {
      setError("Vui lòng nhập nhận xét!");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/feedback/doctor", {
        doctorId,
        parentId,
        appointmentId,
        rating,
        comment,
      });
      setSuccess("Gửi đánh giá thành công!");
      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gửi đánh giá thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow-md mt-4"
    >
      <div className="mb-2 font-semibold">Đánh giá của bạn:</div>
      <div className="flex items-center mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <FaStar
              className={
                (hover || rating) >= star
                  ? "text-yellow-400 text-2xl"
                  : "text-gray-300 text-2xl"
              }
            />
          </button>
        ))}
      </div>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={3}
        placeholder="Nhận xét của bạn về bác sĩ..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
};

export default FeedbackForm;