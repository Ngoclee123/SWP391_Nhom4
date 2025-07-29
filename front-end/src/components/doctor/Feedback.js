"use client"

import { useEffect, useState } from "react"
import FeedbackService from "../../service/FeedbackService"

const Feedback = ({ doctorId }) => {
  const [feedbacks, setFeedbacks] = useState([])

  useEffect(() => {
    if (doctorId) {
      FeedbackService.getFeedbacksForDoctor(doctorId)
        .then((res) => {
          setFeedbacks(Array.isArray(res) ? res : []) // Đảm bảo luôn là mảng
        })
        .catch((err) => {
          setFeedbacks([])
        })
    }
  }, [doctorId])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Phản hồi / Đánh giá
      </h2>

      {feedbacks.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-600">Chưa có phản hồi nào.</p>
          <p className="text-sm text-gray-500 mt-2">Hãy trở thành người đầu tiên để lại đánh giá</p>
        </div>
      )}

      {feedbacks.map((fb) => (
        <div
          key={fb.feedbackId}
          className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {fb.parentName
                .split(" ")
                .map((word) => word.charAt(0))
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <b className="text-lg font-semibold text-gray-900">người dùng</b>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    fb.rating >= 4
                      ? "bg-green-100 text-green-800"
                      : fb.rating >= 3
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {fb.rating}/5 sao
                </span>
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= fb.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600">{fb.rating}/5</span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{fb.comment}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Feedback
