import React, { useEffect, useState } from 'react';
import FeedbackService from '../../service/FeedbackService';

const Feedback = ({ doctorId }) => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (doctorId) {
      FeedbackService.getFeedbacksForDoctor(doctorId)
        .then(res => {
          setFeedbacks(Array.isArray(res) ? res : []); // Đảm bảo luôn là mảng
        })
        .catch(err => {
          setFeedbacks([]);
        });
    }
  }, [doctorId]);

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Phản hồi / Đánh giá</h2>
      {feedbacks.length === 0 && <div>Chưa có phản hồi nào.</div>}
      {feedbacks.map(fb => (
        <div key={fb.feedbackId} style={{
          background: "#f8f9fa",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}>
          <b>{fb.parentName}</b>
          <div style={{ color: "#fbbf24", fontSize: "18px" }}>
            {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
          </div>
          <div style={{ margin: "8px 0" }}>{fb.comment}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feedback;