"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import VaccineAppointmentService from "../../service/VaccineAppointmentService"

const ConfirmationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [appointmentData, setAppointmentData] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState("")
  const [bankCode, setBankCode] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    if (!location.state?.appointmentData) {
      navigate("/vaccine-appointment")
      return
    }
    setAppointmentData(location.state.appointmentData)
  }, [navigate, location.state])

  const handleConfirm = async () => {
    if (!selectedMethod) {
      setMessage("Vui lòng chọn phương thức thanh toán.")
      return
    }

    setLoading(true)
    try {
      const vaccineAppointmentId = appointmentData.vaccineAppointmentId
      if (selectedMethod === "vnpay" && !bankCode) {
        setMessage("Vui lòng chọn ngân hàng khi thanh toán qua VNPay.")
        setLoading(false)
        return
      }

      let response
      if (selectedMethod === "vnpay") {
        response = await VaccineAppointmentService.createVNPayPayment(vaccineAppointmentId, {
          bankCode,
          method: "BankCard",
        })
        const paymentUrl = response.data.data.paymentUrl
        window.location.href = paymentUrl
      } else if (selectedMethod === "later") {
        await VaccineAppointmentService.createPayment(vaccineAppointmentId, { method: "Cash" })
        setIsConfirmed(true)
        setMessage("Xác nhận thành công! Chuyển hướng...")
        setTimeout(() => {
          navigate(`/payment/${vaccineAppointmentId}`, { state: { paymentMethod: "Cash" } })
        }, 2000)
      }
    } catch (error) {
      setMessage("Xác nhận thanh toán thất bại. Vui lòng thử lại.")
      console.error("Error in handleConfirm:", error.response ? error.response.data : error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate("/vaccines", { state: { vaccineId: appointmentData.vaccineId } })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const hour = date.getUTCHours().toString().padStart(2, "0")
    const minute = date.getUTCMinutes().toString().padStart(2, "0")
    const day = date.getUTCDate().toString().padStart(2, "0")
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
    const year = date.getUTCFullYear()
    return {
      time: `${hour}:${minute}`,
      date: `${day}/${month}/${year}`,
    }
  }

  const paymentMethods = [
    {
      id: "vnpay",
      name: "Thanh toán qua VNPay",
      description: "Thanh toán trực tuyến qua ngân hàng",
      icon: "💳",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "later",
      name: "Thanh toán sau",
      description: "Thanh toán tại cơ sở y tế",
      icon: "💰",
      color: "from-green-500 to-emerald-500",
    },
  ]

  const banks = [
    { code: "NCB", name: "Ngân hàng NCB", logo: "🏦" },
    { code: "AGRIBANK", name: "Ngân hàng Agribank", logo: "🌾" },
    { code: "SCB", name: "Ngân hàng SCB", logo: "🏛️" },
    { code: "VIETCOMBANK", name: "Vietcombank", logo: "💎" },
    { code: "TECHCOMBANK", name: "Techcombank", logo: "⚡" },
    { code: "BIDV", name: "BIDV", logo: "🔷" },
  ]

  if (!appointmentData) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center"
        style={{ marginTop: "80px" }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  const { time, date } = formatDateTime(appointmentData.appointmentDate)

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4"
      style={{ marginTop: "80px" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
              {isConfirmed ? (
                <svg
                  className="w-10 h-10 text-white animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
            {isConfirmed ? "Xác Nhận Thành Công!" : "Xác Nhận Lịch Hẹn"}
          </h1>
          <p className="text-gray-600 text-lg">
            {isConfirmed
              ? "Lịch hẹn của bạn đã được xác nhận"
              : "Vui lòng kiểm tra thông tin và chọn phương thức thanh toán"}
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div
            className={`mb-8 p-6 rounded-3xl border-l-4 animate-slide-down ${
              message.includes("thành công")
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 text-green-700"
                : "bg-gradient-to-r from-red-50 to-rose-50 border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${
                  message.includes("thành công")
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-red-500 to-rose-500"
                }`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {message.includes("thành công") ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {message.includes("thành công") ? "Thành công!" : "Có lỗi xảy ra!"}
                </h3>
                <p>{message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Chi Tiết Lịch Hẹn</h2>
              </div>

              <div className="space-y-6">
                {/* Appointment ID */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Mã lịch hẹn</p>
                      <p className="text-lg font-bold text-gray-800">#{appointmentData.vaccineAppointmentId}</p>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Đã đặt</div>
                </div>

                {/* Vaccine Info */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-800 mb-2">
                        {appointmentData.vaccineName || "Vaccine"}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-medium">Giá tiền:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {appointmentData.price ? `${appointmentData.price.toLocaleString()} VNĐ` : "Liên hệ"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">Ngày hẹn</p>
                        <p className="text-lg font-bold text-green-800">{date}</p>
                        <p className="text-sm text-green-600">{time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Địa điểm</p>
                        <p className="text-lg font-bold text-orange-800">{appointmentData.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {appointmentData.notes && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium mb-1">Ghi chú</p>
                        <p className="text-purple-800">{appointmentData.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 animate-slide-up sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Thanh Toán</h2>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Chọn phương thức thanh toán</p>
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedMethod === method.id
                        ? `bg-gradient-to-r ${method.color} text-white border-transparent shadow-lg`
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          selectedMethod === method.id ? "bg-white/20" : "bg-gray-100"
                        }`}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${selectedMethod === method.id ? "text-white" : "text-gray-800"}`}
                        >
                          {method.name}
                        </h3>
                        <p className={`text-sm ${selectedMethod === method.id ? "text-white/80" : "text-gray-500"}`}>
                          {method.description}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedMethod === method.id ? "border-white bg-white" : "border-gray-300"
                        }`}
                      >
                        {selectedMethod === method.id && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bank Selection for VNPay */}
              {selectedMethod === "vnpay" && (
                <div className="mb-6 animate-slide-down">
                  <p className="text-sm font-medium text-gray-700 mb-3">Chọn ngân hàng</p>
                  <div className="grid grid-cols-2 gap-2">
                    {banks.map((bank) => (
                      <div
                        key={bank.code}
                        onClick={() => setBankCode(bank.code)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          bankCode === bank.code
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent"
                            : "bg-white border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{bank.logo}</div>
                          <p
                            className={`text-xs font-medium ${bankCode === bank.code ? "text-white" : "text-gray-700"}`}
                          >
                            {bank.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading || !selectedMethod}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Xác Nhận Thanh Toán
                      </>
                    )}
                  </div>
                </button>

                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Quay Lại
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-slide-down { animation: slide-down 0.4s ease-out; }
      `}</style>
    </div>
  )
}

export default ConfirmationPage
