import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentService from "../../service/AppointmentService";
import UserService from "../../service/userService";

console.log(
  "UserService instance in BookingModal:",
  UserService,
  new Date().toISOString()
);

const BookingModal = ({ doctorId, selectedDate, selectedTime, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doctorId: doctorId,
    appointmentDate: selectedDate || "",
    timeSlot: selectedTime || "",
    patientId: "",
    symptoms: "",
    notes: "",
    paymentMethod: "later",
    bankCode: "",
  });
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!UserService.isLoggedIn()) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [doctorData, patientsRes] = await Promise.all([
          AppointmentService.getDoctor(doctorId),
          UserService.getPatients(),
        ]);
        setDoctor(doctorData);

        let patientsData = Array.isArray(patientsRes)
          ? patientsRes
          : patientsRes.data || [];
        setPatients(patientsData);

        console.log("patientsRes:", patientsRes);
        console.log("patientsData:", patientsData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      setError("Vui lòng chọn bệnh nhân..............");
      return;
    }
    if (!formData.appointmentDate || !formData.timeSlot) {
      setError("Vui lòng chọn ngày và giờ khám.");
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      const response = await AppointmentService.createAppointment(formData);
      setMessage("Đặt lịch thành công!");
      setError("");

      if (formData.paymentMethod === "vnpay") {
        navigate(`/payment/${response.appointmentId}`);
      } else {
        setTimeout(() => onClose(), 2000);
      }

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      setError("Đặt lịch thất bại. Vui lòng thử lại.");
      setMessage("");
      console.error("Error creating appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("Patients in render:", patients);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Đặt lịch khám</h2>
        {doctor && (
          <div className="mb-4">
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-gray-600">{doctor.specialty}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Chọn bệnh nhân</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.patientId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, patientId: e.target.value }))
              }
              required
            >
              <option value="">Chọn bệnh nhân</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName} -{" "}
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Ngày khám</label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              value={new Date(formData.appointmentDate).toLocaleDateString(
                "vi-VN"
              )}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Giờ khám</label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              value={formData.timeSlot}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Triệu chứng</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.symptoms}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, symptoms: e.target.value }))
              }
              placeholder="Mô tả triệu chứng của bạn"
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Ghi chú</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Ghi chú thêm (nếu có)"
              rows="2"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Phương thức thanh toán</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              required
            >
              <option value="later">Thanh toán sau</option>
              <option value="vnpay">Thanh toán VNPay</option>
            </select>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-500 mb-4">{message}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đặt lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
