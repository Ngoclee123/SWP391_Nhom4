"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

const PaymentPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const result = params.get("result")
  const vaccineAppointmentId = params.get("vaccineAppointmentId")
  const [showConfetti, setShowConfetti] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    if (result === "success") {
      setShowConfetti(true)
      setTimeout(() => setAnimationComplete(true), 1000)
    } else {
      setTimeout(() => setAnimationComplete(true), 500)
    }
  }, [result])

  const handleBack = () => {
    navigate("/home")
  }

  const isSuccess = result === "success"

  return (
    <div
      className={`min-h-screen py-8 px-4 transition-all duration-1000 ${
        isSuccess
          ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
          : "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50"
      }`}
      style={{ marginTop: "80px" }}
    >
      {/* Confetti Animation for Success */}
      {showConfetti && isSuccess && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className={`w-2 h-2 ${
                  ["bg-yellow-400", "bg-green-400", "bg-blue-400", "bg-pink-400", "bg-purple-400"][
                    Math.floor(Math.random() * 5)
                  ]
                } transform rotate-45`}
              ></div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Main Result Card */}
        <div className="relative">
          <div
            className={`absolute inset-0 rounded-3xl blur-xl opacity-30 ${
              isSuccess ? "bg-gradient-to-r from-green-500 to-teal-600" : "bg-gradient-to-r from-red-500 to-pink-600"
            }`}
          ></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 animate-slide-up">
            {/* Status Icon */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div
                  className={`absolute inset-0 rounded-full blur-lg opacity-50 animate-pulse ${
                    isSuccess ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <div
                  className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-2xl ${
                    isSuccess
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-red-500 to-rose-500"
                  } ${animationComplete ? "animate-bounce" : "animate-scale-in"}`}
                >
                  {isSuccess ? (
                    <svg
                      className="w-12 h-12 md:w-16 md:h-16 text-white animate-check-draw"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                        className="animate-check-path"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-12 h-12 md:w-16 md:h-16 text-white animate-x-draw"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Status Title */}
            <div className="text-center mb-6">
              <h1
                className={`text-4xl md:text-5xl font-bold mb-4 animate-fade-in ${
                  isSuccess
                    ? "bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent"
                }`}
                style={{ animationDelay: "0.3s" }}
              >
                {isSuccess ? "Thanh Toán Thành Công!" : "Thanh Toán Thất Bại"}
              </h1>
              <p
                className={`text-lg md:text-xl animate-fade-in ${isSuccess ? "text-green-700" : "text-red-700"}`}
                style={{ animationDelay: "0.5s" }}
              >
                {isSuccess
                  ? "🎉 Chúc mừng! Thanh toán của bạn đã được xử lý thành công."
                  : "😔 Rất tiếc! Có lỗi xảy ra trong quá trình thanh toán."}
              </p>
            </div>

            {/* Status Details */}
            <div
              className={`p-6 rounded-2xl mb-8 animate-slide-up ${
                isSuccess
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                  : "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200"
              }`}
              style={{ animationDelay: "0.7s" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSuccess
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-red-500 to-rose-500"
                  }`}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isSuccess ? "text-green-800" : "text-red-800"}`}>
                    Trạng thái thanh toán
                  </h3>
                  <p className={`${isSuccess ? "text-green-700" : "text-red-700"}`}>
                    {isSuccess ? "Đã thanh toán thành công" : "Thanh toán không thành công"}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment ID */}
            {vaccineAppointmentId && (
              <div
                className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 mb-8 animate-slide-up"
                style={{ animationDelay: "0.9s" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">Mã lịch hẹn</h3>
                    <p className="text-2xl font-bold text-blue-900">#{vaccineAppointmentId}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Actions */}
            {isSuccess && (
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-in"
                style={{ animationDelay: "1.1s" }}
              >
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800">Lịch hẹn đã được xác nhận</h4>
                      <p className="text-sm text-purple-600">Bạn sẽ nhận được thông báo nhắc nhở</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-800">Hóa đơn đã được gửi</h4>
                      <p className="text-sm text-orange-600">Kiểm tra email để xem chi tiết</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Failure Actions */}
            {!isSuccess && (
              <div
                className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 mb-8 animate-slide-up"
                style={{ animationDelay: "1.1s" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Có thể thử lại</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Kiểm tra thông tin thẻ ngân hàng</li>
                      <li>• Đảm bảo tài khoản có đủ số dư</li>
                      <li>• Thử lại sau vài phút</li>
                      <li>• Liên hệ ngân hàng nếu vấn đề tiếp tục</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "1.3s" }}>
              <button
                onClick={handleBack}
                className={`flex-1 relative overflow-hidden text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl group ${
                  isSuccess
                    ? "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Về Trang Chủ
                </div>
              </button>

              {!isSuccess && (
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Thử Lại
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Success Elements */}
        {isSuccess && (
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "1.5s" }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Hệ thống đã ghi nhận thanh toán</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scale-in {
          0% { transform: scale(0) rotate(180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes check-path {
          0% { stroke-dasharray: 0 100; }
          100% { stroke-dasharray: 100 0; }
        }
        .animate-confetti { animation: confetti linear infinite; }
        .animate-scale-in { animation: scale-in 0.8s ease-out; }
        .animate-fade-in { animation: fade-in 0.6s ease-out both; }
        .animate-slide-up { animation: slide-up 0.8s ease-out both; }
        .animate-check-path { 
          stroke-dasharray: 100; 
          animation: check-path 1s ease-in-out 0.5s both; 
        }
      `}</style>
    </div>
  )
}

export default PaymentPage
