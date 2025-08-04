import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DoctorDetailService from "../../service/DoctorDetailService";
import userService from "../../service/userService";
import feedbackService from "../../service/FeedbackService";


import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  FaCloudSun,
} from "react-icons/fa";
import BookingModal from "./BookingModal";
import CommentSection from "./CommentSection";


function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();


  console.log("🏥 DoctorDetail component loaded");
  console.log("📋 URL param id:", id);
  console.log("📋 Type of id:", typeof id);


  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Thêm state cho feedback data và calculated rating
  const [feedbacks, setFeedbacks] = useState([]);
  const [calculatedRating, setCalculatedRating] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);


  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);


  const [showBookingModal, setShowBookingModal] = useState(false);


  const [parentId, setParentId] = useState(null);


  useEffect(() => {
    if (id) {
      const fetchDoctorDetail = async () => {
        setLoading(true);
        try {
          const response = await DoctorDetailService.getDoctorById(id);
          console.log("DoctorDetail fetched doctor:", response);
          console.log("Doctor image path:", response?.imgs);
          setDoctor(response);
        } catch (err) {
          setError("Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.");
          console.error("Error fetching doctor:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctorDetail();
    }
  }, [id]);


  useEffect(() => {
    if (id && selectedDate) {
      const fetchAvailableSlots = async () => {
        setSlotsLoading(true);
        setAvailableSlots([]);
        try {
          // Format date in local timezone to avoid timezone conversion issues
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          const slots = await DoctorDetailService.getAvailableSlots(
            id,
            dateString
          );
          const sortedSlots = Array.isArray(slots)
            ? slots.sort((a, b) => a.startTime.localeCompare(b.startTime))
            : [];
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

  // Thêm useEffect để fetch feedback data và tính toán rating
  useEffect(() => {
    if (id) {
      const fetchFeedbackData = async () => {
        try {
          console.log("Fetching feedback data for doctor ID:", id);
          const feedbackData = await feedbackService.getFeedbacksForDoctor(id);
          console.log("Feedback data received:", feedbackData);
          
          setFeedbacks(feedbackData);
          
          // Tính toán average rating và feedback count
          if (feedbackData && feedbackData.length > 0) {
            const totalRating = feedbackData.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
            const averageRating = totalRating / feedbackData.length;
            const count = feedbackData.length;
            
            console.log("Calculated rating:", averageRating, "Count:", count);
            setCalculatedRating(averageRating);
            setFeedbackCount(count);
          } else {
            setCalculatedRating(0);
            setFeedbackCount(0);
          }
        } catch (err) {
          console.error("Error fetching feedback data:", err);
          setCalculatedRating(0);
          setFeedbackCount(0);
        }
      };
      
      fetchFeedbackData();
    }
  }, [id]);


  useEffect(() => {
    console.log("Current token:", userService.getToken());
    console.log("Is logged in:", userService.isLoggedIn());


    const fetchPatientInfo = async () => {
      try {
        const response = await userService.getPatients();
        const patients = response?.data ?? [];


        if (patients.length > 0) {
          const patient = patients[0];
          console.log("Full patient object:", patient);
          console.log("patient.parent:", patient.parent);
          console.log("patient.parent?.id:", patient.parent?.id);


          // Lấy parent_id từ patient object
          const parentIdFromPatient = patient.parent?.id;


          if (parentIdFromPatient) {
            console.log(
              "✅ Using parent_id from patient:",
              parentIdFromPatient
            );
            setParentId(parentIdFromPatient);
          } else {
            console.warn("❌ No parent_id found in patient object");
            // Thử lấy parent_id từ account_id
            const userInfo = userService.getUserInfo();
            if (userInfo?.accountId) {
              console.log(
                "🔄 Trying to get parent_id from account_id:",
                userInfo.accountId
              );


              // Thử method tạm thời trước
              const parentIdFromTemp = userService.getParentIdFromAccountIdTemp(
                userInfo.accountId
              );
              if (parentIdFromTemp) {
                console.log(
                  "✅ Got parent_id from temp mapping:",
                  parentIdFromTemp
                );
                setParentId(parentIdFromTemp);
              } else {
                // Nếu không có trong mapping, thử API
                try {
                  const parentIdFromApi =
                    await userService.getParentIdFromAccountId(
                      userInfo.accountId
                    );
                  if (parentIdFromApi) {
                    console.log("✅ Got parent_id from API:", parentIdFromApi);
                    setParentId(parentIdFromApi);
                  } else {
                    console.warn(
                      "❌ Could not get parent_id from API, using accountId as fallback"
                    );
                    // Fallback: sử dụng accountId làm parentId
                    setParentId(userInfo.accountId);
                  }
                } catch (error) {
                  console.error("❌ Error getting parent_id from API:", error);
                  setParentId(null);
                }
              }
            } else {
              console.warn("❌ No account_id found in userInfo");
              setParentId(null);
            }
          }
        } else {
          console.warn("No patients found.");
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };


    fetchPatientInfo();
  }, []);


  // Bỏ qua logic fetch completed appointment - không cần nữa


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Đang tải thông tin bác sĩ...</p>
      </div>
    );
  }

  // Debug logging
  if (doctor) {
    console.log("Doctor data in render:", {
      id: doctor.id,
      fullName: doctor.fullName,
      imgs: doctor.imgs,
      specialtyName: doctor.specialtyName
    });
  }


  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            {error || "Không tìm thấy bác sĩ"}
          </h2>
          <button
            onClick={() => navigate("/team")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Quay về danh sách bác sĩ
          </button>
        </div>
      </div>
    );
  }


  const handleSlotSelection = (slot) => {
    if (!userService.isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (slot.status === "Available") {
      setSelectedSlot(slot);
      setShowBookingModal(true);
    }
  };

  const handleBookingSuccess = () => {
    // Refresh available slots after successful booking
    if (id && selectedDate) {
      const fetchAvailableSlots = async () => {
        setSlotsLoading(true);
        setAvailableSlots([]);
        try {
          // Format date in local timezone to avoid timezone conversion issues
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          const slots = await DoctorDetailService.getAvailableSlots(
            id,
            dateString
          );
          const sortedSlots = Array.isArray(slots)
            ? slots.sort((a, b) => a.startTime.localeCompare(b.startTime))
            : [];
          setAvailableSlots(sortedSlots);
        } catch (err) {
          console.error("Error fetching available slots:", err);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchAvailableSlots();
    }
    setShowBookingModal(false);
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
                  src={
                    doctor.imgs 
                      ? doctor.imgs.startsWith('http') 
                        ? doctor.imgs 
                        : `/${doctor.imgs.replace(/\\/g, '/')}`
                      : "/images/default-doctor.jpg"
                  }
                  alt={doctor.fullName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    console.log("Image failed to load:", doctor.imgs);
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
                      {calculatedRating > 0 ? calculatedRating.toFixed(1) : "N/A"}
                    </span>
                    <span className="text-blue-100 ml-1">
                      ({feedbackCount} đánh giá)
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
            <CommentSection doctorId={id} parentId={parentId} />
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
                    minDate={new Date()}
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
                    {doctor.locational || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showBookingModal && selectedSlot && (
        <BookingModal
          doctorId={id}
          selectedDate={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
          selectedTime={selectedSlot.startTime}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}


export default DoctorDetail;





