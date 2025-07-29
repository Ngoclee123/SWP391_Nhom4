import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import VaccineAppointmentService from "../../service/VaccineAppointmentService"
import UserService from "../../service/userService"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { addDays, isAfter, isBefore, isSameDay, parseISO, startOfDay, format, parse } from "date-fns"

const VaccineAppointment = () => {
  const navigate = useNavigate()
  const { vaccineId } = useParams()
  const location = useLocation()
  const [patients, setPatients] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [availableLocations, setAvailableLocations] = useState([])
  const [availableTimes, setAvailableTimes] = useState([])
  const [formData, setFormData] = useState({
    vaccineId: vaccineId || "",
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
    location: "",
    notes: "",
    newPatient: { fullName: "", dateOfBirth: "", gender: "" },
  })
  const [message, setMessage] = useState("")
  const [vaccine, setVaccine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  // Thêm state cho ngày đã chọn dạng Date object
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    if (!UserService.isLoggedIn()) {
      navigate("/login")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const vaccineData = await VaccineAppointmentService.getVaccine(vaccineId)
        console.log("Vaccine data received:", vaccineData)
        setVaccine(vaccineData.data || vaccineData || {})

        const patientsRes = await VaccineAppointmentService.getPatients()
        const patientsData = Array.isArray(patientsRes) ? patientsRes : patientsRes.data || []
        setPatients(
          patientsData.map((patient) => ({
            id: patient.id || patient.patient_id,
            fullName: patient.fullName || patient.full_name,
          })),
        )

        const availabilityRes = await VaccineAppointmentService.getVaccineAvailability(vaccineId)
        const availabilityData = availabilityRes.data?.data || availabilityRes.data || []
        if (Array.isArray(availabilityData)) {
          // Giữ nguyên cả ngày + giờ
          setAvailableDates([...new Set(availabilityData.map((item) => item.available_date))])
          setAvailableLocations([...new Set(availabilityData.map((item) => item.location))])
        }
      } catch (err) {
        console.error("Fetch error:", err.response ? err.response.status : err.message)
        setError("Không thể tải dữ liệu. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    if (location.state?.newPatient) {
      setPatients((prev) => [...prev, location.state.newPatient])
      setFormData((prev) => ({ ...prev, patientId: location.state.newPatient.id }))
      setMessage("Đã thêm bé mới thành công!")
    }
  }, [navigate, vaccineId, location.state])

  // Khi chọn ngày, lọc các slot có ngày trùng với ngày đã chọn
  useEffect(() => {
    if (!selectedDate || !availableDates.length) {
      setAvailableTimes([])
      return
    }
    // Lấy ngày đã chọn ở dạng yyyy-MM-dd
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
    // Lọc các slot có ngày trùng với ngày đã chọn, lấy phần giờ
    const times = availableDates
      .filter(dateStr => dateStr.startsWith(selectedDateStr))
      .map(dateStr => {
        // Tách phần giờ
        const timePart = dateStr.split("T")[1]?.slice(0, 5) // "07:00"
        if (timePart) {
          const [hour, minute] = timePart.split(":")
          const dateObj = new Date()
          dateObj.setHours(Number(hour), Number(minute), 0, 0)
          return format(dateObj, "hh:mm a")
        }
        return null
      })
      .filter(Boolean)
    setAvailableTimes([...new Set(times)])
  }, [selectedDate, availableDates])

  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    setFormData((prev) => ({ ...prev, appointmentDate: selectedDate, appointmentTime: "" }))
    const availabilityRes = VaccineAppointmentService.getVaccineAvailability(vaccineId)
    availabilityRes
      .then((response) => {
        const availabilityData = response.data?.data || response.data || []
        const times = availabilityData
          .filter((item) => item.available_date.startsWith(selectedDate))
          .map((item) => {
            const dateObj = new Date(item.available_date)
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toTimeString().slice(0, 5)
            }
            return ""
          })
        setAvailableTimes([...new Set(times)])
      })
      .catch((err) => {
        console.error("Error fetching availability times:", err)
      })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Khi submit, cần chuyển lại về HH:mm (24h) để ghép ISO string gửi backend
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (
        isSubmitting ||
        !formData.patientId ||
        !formData.appointmentDate ||
        !formData.appointmentTime ||
        !formData.location
      ) {
        setError("Vui lòng chọn bé, ngày hẹn, khung giờ và địa điểm.")
        setMessage("")
        return
      }
      try {
        setLoading(true)
        setIsSubmitting(true)
        const token = UserService.getToken()
        // Chuyển AM/PM về 24h
        const [time, ampm] = formData.appointmentTime.split(" ")
        let [hour, minute] = time.split(":")
        hour = parseInt(hour, 10)
        if (ampm === "PM" && hour < 12) hour += 12
        if (ampm === "AM" && hour === 12) hour = 0
        const hourStr = hour.toString().padStart(2, "0")
        // Gửi local time, không offset, không Z
        let appointmentDate = `${formData.appointmentDate}T${hourStr}:${minute}`
        if (appointmentDate.length === 16) appointmentDate += ':00'
        const appointmentData = {
          vaccineId: formData.vaccineId,
          patientId: formData.patientId,
          appointmentDate, // <-- gửi local time đủ giây
          location: formData.location,
          notes: formData.notes,
        }
        const response = await VaccineAppointmentService.createVaccineAppointment(appointmentData)
        setMessage(response.data.message)
        setError("")
        if (response.data.message.includes("thành công")) {
          navigate("/confirmation", {
            state: {
              appointmentData: {
                vaccineAppointmentId: response.data.vaccineAppointmentId,
                vaccineName: vaccine?.name,
                price: vaccine?.price,
                appointmentDate: `${formData.appointmentDate} ${formData.appointmentTime}`,
                location: formData.location,
                notes: formData.notes,
              },
            },
          })
        }
      } catch (error) {
        setError("Đặt lịch thất bại. Vui lòng thử lại.")
        setMessage("")
      } finally {
        setLoading(false)
        setIsSubmitting(false)
      }
    },
    [isSubmitting, formData, navigate, vaccine],
  )

  const isFormDisabled = loading || isSubmitting

  const steps = [
    { number: 1, title: "Thông tin vaccine", icon: "💉" },
    { number: 2, title: "Chọn bé", icon: "👶" },
    { number: 3, title: "Chọn lịch hẹn", icon: "📅" },
    { number: 4, title: "Xác nhận", icon: "✅" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang tải thông tin...</h3>
            <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    )
  }

  // Chuyển availableDates sang dạng Date object để so sánh dễ hơn
  const availableDateObjects = availableDates.map(dateStr => startOfDay(new Date(dateStr)))

  // Hàm kiểm tra ngày có trong availableDates không
  const isAvailableDay = (date) => {
    return availableDateObjects.some(availableDate => isSameDay(date, availableDate))
  }

  // Hàm custom style cho ngày có thể đặt
  const highlightWithRanges = [
    {
      "react-datepicker__day--highlighted-custom": availableDateObjects
    }
  ]

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4"
      style={{ marginTop: "80px" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Đặt Lịch Tiêm Vaccine
          </h1>
          <p className="text-gray-600">Đặt lịch tiêm vaccine an toàn và tiện lợi cho bé yêu</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step.number
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <span className="text-xs mt-2 text-gray-600 text-center max-w-20">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 transition-all duration-300 ${
                      currentStep > step.number ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border-l-4 ${
              message.includes("thành công")
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-red-50 border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border-l-4 border-red-400 text-red-700">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vaccine Information Card */}
          <div className="lg:col-span-1">
            {vaccine && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{vaccine.name || "Vaccine"}</h3>
                  <p className="text-gray-600 text-sm mb-4">{vaccine.description || "Mô tả vaccine"}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Giá tiền:</span>
                    <span className="text-xl font-bold text-green-600">
                      {vaccine.price ? `${vaccine.price.toLocaleString()} VNĐ` : "Liên hệ"}
                    </span>
                  </div>

                  {vaccine.recommendedAge && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Độ tuổi:</span>
                      <span className="text-blue-700 font-semibold">{vaccine.recommendedAge}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Chọn bé cần tiêm</h3>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Danh sách bé</label>
                    <select
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                      disabled={isFormDisabled}
                      required
                    >
                      <option value="">-- Chọn bé --</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.fullName}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => navigate("/add-patient", { state: { vaccineId } })}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                      disabled={isFormDisabled}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Thêm bé mới
                    </button>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Chọn ngày và giờ</h3>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Chọn ngày tiêm</label>
                    <ReactDatePicker
                      selected={selectedDate}
                      onChange={date => {
                        setSelectedDate(date)
                        setFormData(prev => ({ ...prev, appointmentDate: date ? format(date, "yyyy-MM-dd") : "" }))
                      }}
                      minDate={new Date()}
                      filterDate={date => isAvailableDay(date) && !isBefore(date, startOfDay(new Date()))}
                      highlightDates={highlightWithRanges}
                      placeholderText="Chọn ngày tiêm"
                      dateFormat="yyyy-MM-dd"
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                      dayClassName={date =>
                        isAvailableDay(date)
                          ? "react-datepicker__day--highlighted-custom bg-green-400 text-white rounded-full" : undefined
                      }
                    />
                    </div>

                    {formData.appointmentDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Khung giờ</label>
                        <select
                          name="appointmentTime"
                          value={formData.appointmentTime}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                          disabled={isFormDisabled}
                          required
                        >
                          <option value="">-- Chọn giờ --</option>
                          {availableTimes.map((time, index) => (
                            <option key={index} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                </div>

                {/* Location Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Chọn địa điểm</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cơ sở y tế</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                      disabled={isFormDisabled}
                      required
                    >
                      <option value="">-- Chọn địa điểm --</option>
                      {availableLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Ghi chú thêm</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Nhập ghi chú về tình trạng sức khỏe hoặc yêu cầu đặc biệt..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 resize-none"
                      disabled={isFormDisabled}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isFormDisabled}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xử lý...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Đặt lịch tiêm
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/vaccines")}
                    disabled={isFormDisabled}
                    className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              {/* Warning Messages */}
              {patients.length === 0 && !error && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                  <div className="flex items-center text-yellow-700">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Không có thông tin bé. Vui lòng thêm bé vào hệ thống.
                  </div>
                </div>
              )}

              {!availableDates.length && !error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="flex items-center text-red-700">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Không có lịch hẹn khả dụng cho vaccine này.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VaccineAppointment
