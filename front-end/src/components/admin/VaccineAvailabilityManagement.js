import React, { useEffect, useState } from "react";
import axios from "../../api/axiosClient";

function VaccineAvailabilityManagement() {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    vaccineId: "",
    location: "",
    date: "",
    time: "",
    capacity: ""
  });

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/vaccine-availability");
      setAvailabilities(res.data.content || []);
    } catch (e) {
      setError("Không thể tải dữ liệu lịch vaccine.");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm({ vaccineId: "", location: "", date: "", time: "", capacity: "" });
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    let date = "";
    let time = "";
    if (item.availableDate) {
      const d = new Date(item.availableDate);
      date = d.toISOString().slice(0, 10); // YYYY-MM-DD
      // Lấy giờ local, định dạng HH:mm cho input type="time"
      time = d.toTimeString().slice(0,5); // "HH:mm"
    }
    setForm({
      vaccineId: item.vaccineId !== undefined && item.vaccineId !== null ? String(item.vaccineId) : "",
      location: item.location || "",
      date,
      time,
      capacity: item.capacity !== undefined && item.capacity !== null ? String(item.capacity) : ""
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch này?")) return;
    try {
      await axios.delete(`/api/vaccine-availability/${id}`);
      fetchAvailabilities();
    } catch (e) {
      alert("Xóa thất bại!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ghép ngày và giờ thành ISO string local time (yyyy-MM-ddTHH:mm:ss), KHÔNG có offset
    const { date, time, vaccineId, location, capacity } = form;
    let availableDate = null;
    if (date && time) {
      availableDate = `${date}T${time}:00`;
    }
    const payload = {
      vaccineId: vaccineId ? Number(vaccineId) : undefined,
      location,
      availableDate,
      capacity: capacity ? Number(capacity) : undefined
    };
    try {
      if (editItem) {
        await axios.put(`/api/vaccine-availability/${editItem.id}`, payload);
      } else {
        await axios.post("/api/vaccine-availability", payload);
      } 
      setShowForm(false);
      fetchAvailabilities();
    } catch (e) {
      alert("Lưu thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Quản lý lịch vaccine theo địa điểm  
            </h2>
            <button onClick={handleAdd} className="bg-white/20 hover:bg-white/40 text-white font-semibold px-6 py-2 rounded-xl transition-all">+ Thêm lịch mới</button>
          </div>
          <div className="p-8 relative">
            {loading ? (
              <div className="text-center text-lg text-gray-600 py-10">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-10">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow">
                  <thead>
                    <tr className="bg-blue-100 text-blue-800">
                      <th className="py-2 px-4">Vaccine ID</th>
                      <th className="py-2 px-4">Địa điểm</th>
                      <th className="py-2 px-4">Ngày</th>
                      <th className="py-2 px-4">Giờ</th>
                      <th className="py-2 px-4">Sức chứa</th>
                      <th className="py-2 px-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availabilities.map((item) => {
                      // Hiển thị ngày/giờ local trong bảng
                      let dateStr = "";
                      let timeStr = "";
                      if (item.availableDate) {
                        const d = new Date(item.availableDate);
                        dateStr = d.toLocaleDateString('vi-VN');
                        timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                      }
                      return (
                        <tr key={item.id} className="border-b hover:bg-blue-50">
                          <td className="py-2 px-4 text-center">{item.vaccineId}</td>
                          <td className="py-2 px-4 text-center">{item.location}</td>
                          <td className="py-2 px-4 text-center">{dateStr}</td>
                          <td className="py-2 px-4 text-center">{timeStr}</td>
                          <td className="py-2 px-4 text-center">{item.capacity}</td>
                          <td className="py-2 px-4 text-center">
                            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline mr-2">Sửa</button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Xóa</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Form thêm/sửa dạng inline card */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 w-full max-w-2xl mx-auto">
                <h3 className="text-xl font-bold mb-4">{editItem ? "Sửa lịch vaccine" : "Thêm lịch vaccine"}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-medium mb-1">Vaccine ID</label>
                    <input type="text" name="vaccineId" value={form.vaccineId} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Địa điểm</label>
                    <input type="text" name="location" value={form.location} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Ngày</label>
                    <input type="date" name="date" value={form.date} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Giờ</label>
                    <input type="time" name="time" value={form.time} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Sức chứa</label>
                    <input type="number" name="capacity" value={form.capacity} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required min={1} />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VaccineAvailabilityManagement; 