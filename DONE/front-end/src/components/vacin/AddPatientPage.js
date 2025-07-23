"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import VaccineAppointmentService from "../../service/VaccineAppointmentService"
import UserService from "../../service/userService"

const AddPatientPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const vaccineId = location.state?.vaccineId
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    weight: "",
    height: "",
    medicalConditions: "",
  })
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [focusedField, setFocusedField] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    setFormData({ fullName: "", dateOfBirth: "", gender: "", weight: "", height: "", medicalConditions: "" })
    setError({})
    setMessage("")
    if (!vaccineId) {
      console.warn("vaccineId is not provided in state, redirecting to default vaccine page")
      navigate("/vaccines/1")
    }
  }, [vaccineId, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error[name]) setError((prev) => ({ ...prev, [name]: "" }))
  }

  const validateNewPatient = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = "Họ và tên là bắt buộc"
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh là bắt buộc"
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      if (isNaN(birthDate.getTime()) || birthDate >= today) {
        newErrors.dateOfBirth = "Ngày sinh không hợp lệ hoặc phải trước ngày hiện tại"
      }
    }
    if (!formData.gender) newErrors.gender = "Giới tính là bắt buộc"
    if (formData.weight && isNaN(formData.weight)) {
      newErrors.weight = "Cân nặng phải là số"
    }
    if (formData.height && isNaN(formData.height)) {
      newErrors.height = "Chiều cao phải là số"
    }
    setError(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitted(true)

    if (!validateNewPatient() || !vaccineId) {
      if (!vaccineId) setError({ ...error, general: "Không thể xác định vaccineId." })
      return
    }

    setLoading(true)
    const maxRetries = 2
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const accountId = UserService.getAccountId()
        if (!accountId) {
          throw new Error("No accountId found. Please log in again")
        }

        const requestData = {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          weight: formData.weight ? Number.parseFloat(formData.weight) : null,
          height: formData.height ? Number.parseFloat(formData.height) : null,
          medicalConditions: formData.medicalConditions || null,
          accountId: Number.parseInt(accountId),
        }

        const response = await VaccineAppointmentService.addPatient(requestData)
        const newPatient = {
          id: response.id || response.data?.id,
          fullName: formData.fullName,
        }

        if (newPatient.id && newPatient.fullName) {
          setMessage("Đã thêm bé mới thành công!")
          setTimeout(() => {
            navigate(`/vaccines/${vaccineId}`, { state: { newPatient } })
          }, 2000)
          break
        } else {
          throw new Error("Invalid patient data returned from server")
        }
      } catch (error) {
        console.error("Error adding patient (Attempt " + (attempt + 1) + "):", error)
        if (attempt === maxRetries) {
          setError({
            ...error,
            general: "Không thể thêm bé mới sau " + maxRetries + " lần thử. Vui lòng đăng nhập lại.",
          })
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return ""
    const today = new Date()
    const birth = new Date(birthDate)
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths} tháng tuổi`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years} tuổi ${months} tháng` : `${years} tuổi`
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center"
        style={{ marginTop: "80px" }}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-pink-200 rounded-full animate-spin"></div>
            <div className="w-24 h-24 border-4 border-pink-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Đang thêm bé mới...
            </h3>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            <div className="flex items-center justify-center mt-4 space-x-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8 px-4"
      style={{ marginTop: "80px" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Animated Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg
                className="w-10 h-10 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-slide-up">
            Thêm Bé Mới
          </h1>
          <p className="text-gray-600 text-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Thêm thông tin bé để đặt lịch tiêm vaccine an toàn
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 animate-slide-down">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">Thành công!</h3>
                <p className="text-green-700">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error.general && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 animate-shake">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">Có lỗi xảy ra!</h3>
                <p className="text-red-700">{error.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Thông tin cơ bản</h3>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${focusedField === "fullName" ? "opacity-30" : ""}`}
                    ></div>
                    <div className="relative">
                      <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => setFocusedField("")}
                        placeholder="Nhập họ và tên của bé"
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                          error.fullName ? "border-red-300 focus:border-red-500" : "border-gray-200"
                        } ${isSubmitted && !formData.fullName ? "animate-shake border-red-300" : ""}`}
                        required
                      />
                    </div>
                  </div>
                  {error.fullName && (
                    <p className="text-red-500 text-sm flex items-center gap-1 animate-slide-down">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error.fullName}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${focusedField === "dateOfBirth" ? "opacity-30" : ""}`}
                    ></div>
                    <div className="relative">
                      <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("dateOfBirth")}
                        onBlur={() => setFocusedField("")}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                          error.dateOfBirth ? "border-red-300 focus:border-red-500" : "border-gray-200"
                        } ${isSubmitted && !formData.dateOfBirth ? "animate-shake border-red-300" : ""}`}
                        required
                      />
                    </div>
                  </div>
                  {formData.dateOfBirth && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-xl animate-fade-in">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Tuổi: {calculateAge(formData.dateOfBirth)}
                    </div>
                  )}
                  {error.dateOfBirth && (
                    <p className="text-red-500 text-sm flex items-center gap-1 animate-slide-down">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error.dateOfBirth}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${focusedField === "gender" ? "opacity-30" : ""}`}
                    ></div>
                    <div className="relative">
                      <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("gender")}
                        onBlur={() => setFocusedField("")}
                        className={`w-full pl-12 pr-10 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all duration-300 appearance-none ${
                          error.gender ? "border-red-300 focus:border-red-500" : "border-gray-200"
                        } ${isSubmitted && !formData.gender ? "animate-shake border-red-300" : ""}`}
                        required
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="Male">👦 Nam</option>
                        <option value="Female">👧 Nữ</option>
                      </select>
                      <svg
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {error.gender && (
                    <p className="text-red-500 text-sm flex items-center gap-1 animate-slide-down">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Physical Information Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Thông số cơ thể (tùy chọn)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weight */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Cân nặng (kg)</label>
                    <div className="relative group">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${focusedField === "weight" ? "opacity-30" : ""}`}
                      ></div>
                      <div className="relative">
                        <svg
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                          />
                        </svg>
                        <input
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("weight")}
                          onBlur={() => setFocusedField("")}
                          placeholder="Ví dụ: 15.5"
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                            error.weight ? "border-red-300 focus:border-red-500" : "border-gray-200"
                          }`}
                          step="0.1"
                          min="0"
                        />
                      </div>
                    </div>
                    {error.weight && (
                      <p className="text-red-500 text-sm flex items-center gap-1 animate-slide-down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {error.weight}
                      </p>
                    )}
                  </div>

                  {/* Height */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Chiều cao (cm)</label>
                    <div className="relative group">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${focusedField === "height" ? "opacity-30" : ""}`}
                      ></div>
                      <div className="relative">
                        <svg
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v22a1 1 0 01-1 1h-2a1 1 0 01-1-1V4m0 0H7m10 0v18H7V4"
                          />
                        </svg>
                        <input
                          type="number"
                          name="height"
                          value={formData.height}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("height")}
                          onBlur={() => setFocusedField("")}
                          placeholder="Ví dụ: 85.5"
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                            error.height ? "border-red-300 focus:border-red-500" : "border-gray-200"
                          }`}
                          step="0.1"
                          min="0"
                        />
                      </div>
                    </div>
                    {error.height && (
                      <p className="text-red-500 text-sm flex items-center gap-1 animate-slide-down">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {error.height}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Tình trạng y tế (tùy chọn)</h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Ghi chú về tình trạng y tế</label>
                  <div className="relative group">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${focusedField === "medicalConditions" ? "opacity-30" : ""}`}
                    ></div>
                    <div className="relative">
                      <svg
                        className="absolute left-4 top-4 text-gray-400 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <textarea
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("medicalConditions")}
                        onBlur={() => setFocusedField("")}
                        placeholder="Nhập thông tin về dị ứng, bệnh lý hoặc tình trạng y tế đặc biệt (nếu có)..."
                        rows={4}
                        className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/80 backdrop-blur-sm transition-all duration-300 resize-none border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl group"
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
                        Xác nhận thêm bé
                      </>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/vaccines/${vaccineId || "1"}`)}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                    Quay lại
                  </div>
                </button>
              </div>
            </form>
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-slide-down { animation: slide-down 0.4s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}

export default AddPatientPage
