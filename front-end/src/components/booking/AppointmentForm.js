import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppointmentService from "../../service/AppointmentService";
import UserService from "../../service/userService";

function AppointmentForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor } = location.state || {};

  const [appointmentData, setAppointmentData] = useState({
    patientId: null,
    doctorId: doctor?.id || "",
    specialtyId: doctor?.specialty?.id || "",
    appointmentDate: "",
    duration: 60,
    notes: "",
    consultationType: "InPerson",
    priority: "Normal",
    status: "Pending",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Kiểm tra đăng nhập và lấy thông tin bệnh nhân
    const accountId = UserService.getAccountId();
    if (!accountId) {
      setMessage("Vui lòng đăng nhập để đặt lịch khám");
      setTimeout(() => {
        navigate("/login", { state: { from: location } });
      }, 2000);
      return;
    }

    // Cập nhật patientId từ accountId
    setAppointmentData((prev) => ({
      ...prev,
      patientId: parseInt(accountId),
      doctorId: doctor?.id,
      specialtyId: doctor?.specialty?.id,
    }));
  }, [doctor, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Kiểm tra dữ liệu trước khi gửi
      if (
        !appointmentData.patientId ||
        !appointmentData.doctorId ||
        !appointmentData.specialtyId
      ) {
        throw new Error("Thiếu thông tin cần thiết để đặt lịch");
      }

      console.log("Sending appointment data:", appointmentData);
      const response = await AppointmentService.createAppointment(
        appointmentData
      );

      if (response) {
        setMessage("Đặt lịch thành công! Đang chuyển đến trang thanh toán...");
        // Chuyển đến trang thanh toán sau 2 giây
        setTimeout(() => {
          navigate("/payment", {
            state: {
              appointmentId: response.id,
              amount: 500000, // Phí mặc định
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      setMessage(
        error.message || "Đã có lỗi xảy ra khi đặt lịch. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-600">
          Không tìm thấy thông tin bác sĩ. Vui lòng thử lại.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Đặt lịch khám
        </h2>
        {message && (
          <div
            className={`mb-4 p-4 rounded ${
              message.includes("thành công")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Bác sĩ
            </label>
            <input
              type="text"
              value={doctor?.fullName || "Chưa chọn bác sĩ"}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Chuyên khoa
            </label>
            <input
              type="text"
              value={doctor?.specialty?.name || "Chưa có thông tin"}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Ngày giờ khám
            </label>
            <input
              type="datetime-local"
              name="appointmentDate"
              value={appointmentData.appointmentDate}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={appointmentData.notes}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Nhập triệu chứng hoặc ghi chú thêm (nếu có)"
            />
          </div>
          <button
            type="submit"
            className={`w-full p-3 rounded-lg text-white font-medium transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang xử lý...
              </div>
            ) : (
              "Đặt lịch khám"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;
