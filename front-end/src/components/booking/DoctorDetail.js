import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DoctorService from "../../service/DoctorService";
import AppointmentService from "../../service/AppointmentService";
import userService from "../../service/userService"; // chữ thường
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for DatePicker
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
  FaSun,
  FaMoon,
  FaCloud,
  FaCloudSun,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloud } from "@fortawesome/free-solid-svg-icons";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import { faCloudSun } from "@fortawesome/free-solid-svg-icons";
import BookingModal from "./BookingModal";

function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State để lưu dữ liệu bác sĩ, trạng thái loading và lỗi
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho việc đặt lịch
  const [selectedDate, setSelectedDate] = useState(new Date()); // Mặc định là ngày hôm nay
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // Lưu slot được chọn (ví dụ: {startTime: "09:00", endTime: "10:00"})

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingError, setBookingError] = useState("");

  // Gọi API khi component được tải hoặc id thay đổi
  useEffect(() => {
    if (id) {
      const fetchDoctorDetail = async () => {
        setLoading(true);
        try {
          const response = await DoctorService.getDoctorById(id);
          setDoctor(response);
        } catch (err) {
          setError("Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctorDetail();
    }
  }, [id]);

  // Lấy các slot có sẵn khi ngày được chọn thay đổi
  useEffect(() => {
    if (id && selectedDate) {
      const fetchAvailableSlots = async () => {
        setSlotsLoading(true);
        setAvailableSlots([]); // Xóa slot cũ
        try {
          const dateString = selectedDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD
          const slots = await DoctorService.getAvailableSlots(id, dateString);

          // Sắp xếp các slot nhận được từ API để đảm bảo thứ tự
          const sortedSlots = slots.sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          );

          setAvailableSlots(sortedSlots);
        } catch (err) {
          console.error("Error fetching available slots:", err);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchAvailableSlots();
    }
  }, [id, selectedDate]);

  // Xử lý trạng thái Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Đang tải thông tin bác sĩ...</p>
      </div>
    );
  }

  // Xử lý trạng thái Lỗi
  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            {error || "Không tìm thấy bác sĩ"}
          </h2>
          <button
            onClick={() => navigate("/team")} // Điều hướng về trang team
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Quay về danh sách bác sĩ
          </button>
        </div>
      </div>
    );
  }

  // Mở modal khi một slot được chọn
  const handleSlotSelection = (slot) => {
    if (!userService.isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (slot.status === "Available") {
      setSelectedSlot(slot);
      setShowBookingModal(true);
      setBookingError(""); // Reset lỗi
    }
  };

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

  const groupSlotsBySession = (slots) => {
    const morning = [];
    const afternoon = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0], 10);
      if (hour < 12) {
        morning.push(slot);
      } else {
        afternoon.push(slot);
      }
    });
    return { morning, afternoon };
  };
  const { morning: morningSlots, afternoon: afternoonSlots } =
    groupSlotsBySession(availableSlots);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
            <div className="flex flex-col md:flex-row items-center text-white">
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <img
                  src={doctor.imgs}
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
                    <span className="font-semibold">
                      {doctor.rating || "N/A"}
                    </span>
                    <span className="text-blue-100 ml-1">
                      ({doctor.reviews?.length || 0} đánh giá)
                    </span>
                  </div>
                  <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                    <FaGraduationCap className="mr-2" />
                    <span>{doctor.education}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start">
                  <FaHospital className="mr-2" />
                  <span className="text-blue-100">{doctor.hospital}</span>
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
              <p className="text-gray-600 leading-relaxed mb-6">{doctor.bio}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaGraduationCap className="text-blue-600 mr-2" />
                    Học vấn
                  </h3>
                  <p className="text-gray-600">
                    {doctor.education || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaHospital className="text-blue-600 mr-2" />
                    Bệnh viện công tác
                  </h3>
                  <p className="text-gray-600">
                    {doctor.hospital || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaHeart className="text-red-500 mr-3" />
                Chuyên môn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctor.specialtyName && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">
                      {doctor.specialtyName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaAward className="text-yellow-500 mr-3" />
                Thành tích & Chứng chỉ
              </h2>
              <div className="space-y-3">
                {doctor.certificates && doctor.certificates.length > 0 ? (
                  doctor.certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                    >
                      <FaAward className="text-yellow-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Chưa có thông tin chứng chỉ.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaClock className="text-green-500 mr-3" />
                Giờ làm việc
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                  <div className="flex items-center">
                    <FaSun className="text-yellow-500 mr-2" />
                    <span className="font-semibold text-gray-800">
                      Ca sáng: 08:00 - 12:00
                    </span>
                  </div>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full text-green-800 bg-green-200">
                    Làm việc
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                  <div className="flex items-center">
                    <FaCloudSun className="text-blue-500 mr-2" />
                    <span className="font-semibold text-gray-800">
                      Ca chiều: 13:00 - 17:00
                    </span>
                  </div>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full text-green-800 bg-green-200">
                    Làm việc
                  </span>
                </div>
              </div>
            </div>
            <div id="reviews" className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaStar className="text-yellow-400 mr-3" />
                Đánh giá từ bệnh nhân
              </h2>
              {doctor.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {doctor.reviews.map((review, index) => {
                    if (
                      !review ||
                      !review.patientName ||
                      !review.rating ||
                      !review.comment ||
                      !review.date
                    ) {
                      return null;
                    }
                    return (
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
                            {review.date &&
                            !isNaN(new Date(review.date).getTime())
                              ? new Date(review.date).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "Ngày không xác định"}
                          </p>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    );
                  })}
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
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()} // Không cho chọn ngày trong quá khứ
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="Chọn ngày khám"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn giờ khám
                  </label>
                  {slotsLoading ? (
                    <p className="text-gray-500">Đang tải các khung giờ...</p>
                  ) : (
                    <>
                      {/* Morning Slots */}
                      {morningSlots.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-600 mb-2 flex items-center">
                            <FaSun className="text-yellow-500 mr-2" />
                            Buổi sáng
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {morningSlots.map((slot, index) => (
                              <button
                                key={`morning-${index}`}
                                onClick={() => handleSlotSelection(slot)}
                                disabled={slot.status !== "Available"}
                                className={`p-2 rounded-md text-sm transition ${
                                  slot.status === "Available"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-600 hover:text-white"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                {slot.startTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Afternoon Slots */}
                      {afternoonSlots.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-600 mb-2 flex items-center">
                            <FaCloudSun className="text-blue-500 mr-2" />
                            Buổi chiều
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {afternoonSlots.map((slot, index) => (
                              <button
                                key={`afternoon-${index}`}
                                onClick={() => handleSlotSelection(slot)}
                                disabled={slot.status !== "Available"}
                                className={`p-2 rounded-md text-sm transition ${
                                  slot.status === "Available"
                                    ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                {slot.startTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {availableSlots.length === 0 && !slotsLoading && (
                        <p className="text-gray-500 text-center py-4">
                          Không có lịch làm việc cho ngày này.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div id="contact" className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Thông tin liên hệ
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaPhone className="text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    {doctor.phoneNumber || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-blue-600 mr-3" />
                  <span className="text-gray-700 text-sm">
                    {doctor.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-600 mr-3 mt-1" />
                  <span className="text-gray-700">
                    {doctor.address || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Booking Modal: chỉ render BookingModal, không render modal xác nhận cũ */}
      {showBookingModal && selectedSlot && (
        <BookingModal
          doctorId={id}
          selectedDate={selectedDate.toISOString().split("T")[0]}
          selectedTime={selectedSlot.startTime}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}

export default DoctorDetail;
