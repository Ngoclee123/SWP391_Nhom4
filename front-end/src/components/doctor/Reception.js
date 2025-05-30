import { useState } from "react";
import { CheckCircle, XCircle, Eye } from "lucide-react"; // Icon từ lucide.dev

function Reception() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0123456789",
      date: "2023-05-28",
      time: "09:00",
      status: "pending",
      doctor: "Dr. John",
    },
    {
      id: 2,
      name: "Trần Thị B",
      phone: "0987654321",
      date: "2023-05-29",
      time: "10:30",
      status: "confirmed",
      doctor: "Dr. Alice",
    },
    {
      id: 3,
      name: "Lê Văn C",
      phone: "0345678912",
      date: "2023-05-30",
      time: "14:00",
      status: "cancelled",
      doctor: "Dr. John",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDoctorSchedule, setShowDoctorSchedule] = useState(false);
  const [selectedDoctorSchedule, setSelectedDoctorSchedule] = useState(null);

  const doctorSchedules = [
    {
      doctor: "Dr. John",
      schedule: [
        { date: "2023-06-01", availableSlots: ["09:00", "10:00", "11:00"] },
        { date: "2023-06-02", availableSlots: ["14:00", "15:00"] },
      ],
    },
    {
      doctor: "Dr. Alice",
      schedule: [{ date: "2023-06-03", availableSlots: ["08:30", "09:30"] }],
    },
  ];

  const handleConfirm = (id) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: "confirmed" } : appt
      )
    );
  };

  const handleCancel = (id) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: "cancelled" } : appt
      )
    );
  };

  const handleViewSchedule = (doctor) => {
    const found = doctorSchedules.find((d) => d.doctor === doctor);
    setSelectedDoctorSchedule(found);
    setShowDoctorSchedule(true);
  };

  const formatDate = (dateStr) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("vi-VN", options);
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch =
      appt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || appt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "pending":
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Quản lý lịch hẹn</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc số điện thoại"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 rounded-md shadow-sm w-full md:w-1/2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-full md:w-1/4"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {filteredAppointments.length === 0 ? (
        <p className="text-gray-500 italic">Không có lịch hẹn phù hợp.</p>
      ) : (
        <table className="w-full border shadow-sm rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-100 text-blue-800">
              <th className="p-3 border">Họ tên</th>
              <th className="p-3 border">SĐT</th>
              <th className="p-3 border">Ngày</th>
              <th className="p-3 border">Giờ</th>
              <th className="p-3 border">Bác sĩ</th>
              <th className="p-3 border">Trạng thái</th>
              <th className="p-3 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appt, idx) => (
              <tr key={appt.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border p-3">{appt.name}</td>
                <td className="border p-3">{appt.phone}</td>
                <td className="border p-3">{formatDate(appt.date)}</td>
                <td className="border p-3">{appt.time}</td>
                <td className="border p-3">{appt.doctor}</td>
                <td className="border p-3">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                      appt.status
                    )}`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td className="border p-3 space-x-2 flex flex-wrap">
                  {appt.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleConfirm(appt.id)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow-sm text-sm"
                      >
                        <CheckCircle size={16} />
                        Xác nhận
                      </button>
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm text-sm"
                      >
                        <XCircle size={16} />
                        Hủy
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleViewSchedule(appt.doctor)}
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow-sm text-sm"
                  >
                    <Eye size={16} />
                    Lịch trống
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal xem lịch trống bác sĩ */}
      {showDoctorSchedule && selectedDoctorSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl p-6 rounded-lg shadow-xl relative">
            <button
              onClick={() => {
                setShowDoctorSchedule(false);
                setSelectedDoctorSchedule(null);
              }}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4 text-blue-700">
              Lịch trống: {selectedDoctorSchedule.doctor}
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {selectedDoctorSchedule.schedule.map((entry, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 shadow-sm bg-gray-50"
                >
                  <div className="font-medium mb-2 text-blue-600">
                    {formatDate(entry.date)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.availableSlots.map((slot, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {selectedDoctorSchedule.schedule.length === 0 && (
                <p className="text-gray-500 italic">
                  Không có lịch trống nào được tìm thấy.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reception;
