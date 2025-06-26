import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaStar,
  FaGraduationCap,
  FaHospital,
  FaCalendarAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaAward,
  FaUserMd,
  FaHeart,
} from "react-icons/fa";
import DoctorService from "../../service/DoctorService";
 // Import DoctorService

function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingInfo, setBookingInfo] = useState({
    patientName: "",
    phone: "",
    email: "",
    notes: "",
  });

  // Lấy dữ liệu bác sĩ từ backend khi component được mount
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const response = await DoctorService.getDoctorById(id);
        setDoctor(response); // Lưu dữ liệu bác sĩ vào state
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  // Xử lý khi đang tải
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Đang tải...</h2>
        </div>
      </div>
    );
  }

  // Xử lý khi có lỗi hoặc không tìm thấy bác sĩ
  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            {error || "Không tìm thấy bác sĩ"}
          </h2>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Lấy danh sách ngày khả dụng (tạm thời giữ nguyên logic cũ, có thể cập nhật sau)
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  // Xử lý đặt lịch
  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert("Vui lòng chọn ngày và giờ khám!");
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingSubmit = () => {
    if (!bookingInfo.patientName || !bookingInfo.phone || !bookingInfo.email) {
      alert("Vui lòng điền đầy đủ thông tin bệnh nhân!");
      return;
    }
    const bookingData = {
      doctorName: doctor.fullName,
      specialty: doctor.specialtyName,
      date: selectedDate,
      time: selectedTime,
      patientName: bookingInfo.patientName,
      phone: bookingInfo.phone,
      email: bookingInfo.email,
      service: "Khám tổng quát", // Có thể lấy từ API Services
      fee: 300000, // Cần lấy từ bảng Services trong DB
    };
    navigate("/booking-confirmation", { state: { bookingInfo: bookingData } });
    setShowBookingForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Hiển thị sao đánh giá
  const renderStars = (rating) => {
    const stars = [];
    const validRating = isNaN(rating) || rating < 0 ? 0 : Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= validRating ? "text-yellow-400" : "text-gray-300"}
        />
      );
    }
    return stars;
  };

  // Tạm thời giả lập dữ liệu đánh giá và lịch làm việc (cần thay bằng API thực)
  const reviews = []; // Thay bằng API Feedback
  const workingHours = [
    { day: "Thứ 2 - Thứ 6", time: doctor.morning_hours || "08:00 - 17:00" },
    { day: "Thứ 7", time: doctor.morning_hours || "08:00 - 12:00" },
    { day: "Chủ nhật", time: "Nghỉ" },
  ];
  const availableSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]; // Thay bằng API DoctorAvailability

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
            <div className="flex flex-col md:flex-row items-center text-white">
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <img
                  src={doctor.imgs || "/images/default-doctor.jpg"}
                  alt={doctor.fullName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      doctor.fullName || "Unknown"
                    )}&size=128&background=60a5fa&color=ffffff`;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center">
                  <FaUserMd className="text-white text-sm" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {doctor.fullName}
                </h1>
                <p className="text-blue-100 text-lg mb-3">
                  {doctor.specialtyName}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">N/A</span>
                    <span className="text-blue-100 ml-1">(0 đánh giá)</span>
                  </div>
                  <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                    <FaGraduationCap className="mr-2" />
                    <span>{doctor.education || "Chưa có thông tin"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start">
                  <FaHospital className="mr-2" />
                  <span className="text-blue-100">{doctor.hospital || "Chưa có thông tin"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              <a
                href="#overview"
                className="py-4 px-1 border-b-2 border-blue-600 font-medium text-blue-600"
              >
                Tổng quan
              </a>
              <a
                href="#schedule"
                className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700"
              >
                Lịch khám
              </a>
              <a
                href="#reviews"
                className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700"
              >
                Đánh giá
              </a>
              <a
                href="#contact"
                className="py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700"
              >
                Liên hệ
              </a>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div id="overview" className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaUserMd className="text-blue-600 mr-3" />
                Giới thiệu
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {doctor.bio || "Chưa có thông tin giới thiệu."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaGraduationCap className="text-blue-600 mr-2" />
                    Học vấn
                  </h3>
                  <p className="text-gray-600">{doctor.education || "Chưa có thông tin"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaHospital className="text-blue-600 mr-2" />
                    Nơi công tác
                  </h3>
                  <p className="text-gray-600">{doctor.hospital || "Chưa có thông tin"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaHeart className="text-red-500 mr-3" />
                Chuyên môn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[doctor.specialtyName].map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaAward className="text-yellow-500 mr-3" />
                Thành tích & Chứng chỉ
              </h2>
              <div className="space-y-3">
                {/* Lấy từ bảng Certificates */}
                {doctor.certificates?.map((certificate, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    <FaAward className="text-yellow-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{certificate.certificate_name}</span>
                  </div>
                )) || (
                  <p className="text-gray-600">Chưa có thông tin chứng chỉ.</p>
                )}
              </div>
            </div>

            <div id="schedule" className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaClock className="text-green-600 mr-3" />
                Giờ làm việc
              </h2>
              <div className="space-y-3">
                {workingHours.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                  >
                    <span className="font-medium text-gray-700">
                      {schedule.day}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        schedule.time === "Nghỉ"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {schedule.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div id="reviews" className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaStar className="text-yellow-400 mr-3" />
                Đánh giá từ bệnh nhân
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold">
                              {review.patientName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {review.patientName}
                            </p>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                              <span className="ml-2 text-sm text-gray-600">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  Chưa có đánh giá nào cho bác sĩ này.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="text-blue-600 mr-3" />
                Đặt lịch khám
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ngày khám
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn ngày</option>
                    {getAvailableDates().map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn giờ khám
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`p-2 text-sm rounded-lg border transition duration-200 ${
                          selectedTime === slot
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:scale-105 shadow-lg"
                >
                  Đặt lịch ngay
                </button>
              </div>
            </div>

            <div id="contact" className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Thông tin liên hệ
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaPhone className="text-blue-600 mr-3" />
                  <span className="text-gray-700">{doctor.phoneNumber || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-blue-600 mr-3" />
                  <span className="text-gray-700 text-sm">
                    {doctor.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-600 mr-3 mt-1" />
                  <span className="text-gray-700">{doctor.locational || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">
                Xác nhận đặt lịch
              </h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p>
                  <strong>Bác sĩ:</strong> {doctor.fullName}
                </p>
                <p>
                  <strong>Ngày:</strong>{" "}
                  {new Date(selectedDate).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  <strong>Giờ:</strong> {selectedTime}
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  name="patientName"
                  value={bookingInfo.patientName}
                  onChange={handleInputChange}
                  placeholder="Họ và tên bệnh nhân"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  name="phone"
                  value={bookingInfo.phone}
                  onChange={handleInputChange}
                  placeholder="Số điện thoại"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  name="email"
                  value={bookingInfo.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  name="notes"
                  value={bookingInfo.notes}
                  onChange={handleInputChange}
                  placeholder="Ghi chú (triệu chứng, yêu cầu đặc biệt...)"
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleBookingSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDetail;