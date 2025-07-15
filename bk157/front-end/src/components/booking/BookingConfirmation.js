import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaStethoscope,
  FaMoneyBillWave,
  FaCreditCard,
  FaUniversity,
  FaCheckCircle,
  FaArrowLeft,
  FaHospital,
} from "react-icons/fa";

function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");

  const bookingInfo = state?.bookingInfo || {};

  if (!bookingInfo.doctorName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Không tìm thấy thông tin đặt lịch
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

  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("completed");
      alert("Thanh toán thành công! Đặt lịch của bạn đã được xác nhận.");
    }, 2000);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-blue-600 hover:text-blue-800"
            >
              <FaArrowLeft className="text-2xl" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Xác nhận đặt lịch & Thanh toán
            </h1>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4 flex items-center">
              <FaStethoscope className="mr-3" />
              Thông tin đặt lịch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">
                  <strong>Bác sĩ:</strong> {bookingInfo.doctorName}
                </p>
                <p className="text-gray-600">
                  <strong>Chuyên khoa:</strong> {bookingInfo.specialty}
                </p>
                <p className="text-gray-600">
                  <strong>Dịch vụ:</strong> {bookingInfo.service}
                </p>
                <p className="text-gray-600">
                  <strong>Phí khám:</strong>{" "}
                  {bookingInfo.fee.toLocaleString("vi-VN")} VND
                </p>
              </div>
              <div>
                <p className="text-gray-600 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                  <strong>Ngày:</strong>{" "}
                  {new Date(bookingInfo.date).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-600 flex items-center">
                  <FaClock className="mr-2 text-blue-600" />
                  <strong>Giờ:</strong> {bookingInfo.time}
                </p>
                <p className="text-gray-600 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  <strong>Bệnh nhân:</strong> {bookingInfo.patientName}
                </p>
                <p className="text-gray-600">
                  <strong>Số điện thoại:</strong> {bookingInfo.phone}
                </p>
                <p className="text-gray-600">
                  <strong>Email:</strong> {bookingInfo.email}
                </p>
              </div>
            </div>
          </div>

          {paymentStatus === "completed" ? (
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-green-600 mb-4">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-6">
                Đặt lịch của bạn đã được xác nhận. Bạn sẽ nhận được email xác
                nhận và thông tin chi tiết qua {bookingInfo.email}.
              </p>
              <button
                onClick={handleBackToHome}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Quay về trang chủ
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaMoneyBillWave className="mr-3 text-blue-600" />
                Chọn phương thức thanh toán
              </h2>
              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <FaUniversity className="text-blue-600 mr-2" />
                  <span className="text-gray-700">Chuyển khoản ngân hàng</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <FaCreditCard className="text-blue-600 mr-2" />
                  <span className="text-gray-700">
                    Ví điện tử (Momo, ZaloPay)
                  </span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="hospital"
                    checked={paymentMethod === "hospital"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <FaHospital className="text-blue-600 mr-2" />
                  <span className="text-gray-700">
                    Thanh toán tại bệnh viện
                  </span>
                </label>
              </div>
              <button
                onClick={handlePayment}
                disabled={paymentStatus === "processing"}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition duration-300 ${
                  paymentStatus === "processing"
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 shadow-lg"
                }`}
              >
                {paymentStatus === "processing"
                  ? "Đang xử lý..."
                  : "Thanh toán ngay"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
