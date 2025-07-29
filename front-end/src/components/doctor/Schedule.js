"use client"

import { useEffect, useState } from "react"
import DoctorDashboardService from "../../service/DoctorDashboardService"
import { FaCalendarAlt, FaClock, FaEdit, FaPlus } from "react-icons/fa"

function Schedule({ doctorId }) {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ startTime: "", endTime: "", status: "Available" })
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [slotMinutes, setSlotMinutes] = useState(60);

  useEffect(() => {
    if (!doctorId) return
    setLoading(true)
    DoctorDashboardService.getScheduleByDoctorId(doctorId)
      .then((data) => {
        setSchedule(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setSchedule([])
        setLoading(false)
      })
  }, [doctorId])

  const fetchSchedules = async () => {
    setLoading(true)
    const data = await DoctorDashboardService.getScheduleByDoctorId(doctorId)
    setSchedule(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editId) {
      await DoctorDashboardService.updateSchedule(editId, form)
    } else {
      await DoctorDashboardService.addSchedule(doctorId, {
        ...form,
        slotMinutes
      })
    }
    setForm({ startTime: "", endTime: "", status: "Available" })
    setSlotMinutes(60);
    setEditId(null)
    setShowForm(false)
    fetchSchedules()
  }

  const handleEdit = (item) => {
    setForm({
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
    })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleAdd = () => {
    setForm({ startTime: "", endTime: "", status: "Available" })
    setEditId(null)
    setShowForm(true)
  }

  // Thêm hàm xóa lịch làm việc
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa lịch làm việc này?')) {
      await DoctorDashboardService.deleteSchedule(id);
      fetchSchedules();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-600 font-semibold text-lg">Đang tải lịch làm việc...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center mb-8">
        <FaCalendarAlt className="mr-3 text-blue-600" />
        Lịch làm việc của bạn (ID: {doctorId})
        <button
          className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          onClick={handleAdd}
        >
          <FaPlus className="text-sm" />
          Thêm mới
        </button>
      </h3>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Thời gian bắt đầu</label>
              <input
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                type="datetime-local"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Thời gian kết thúc</label>
              <input
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                type="datetime-local"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Trạng thái</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Thời lượng mỗi slot</label>
              <select
                name="slotMinutes"
                value={slotMinutes}
                onChange={e => setSlotMinutes(Number(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {editId ? "Cập nhật" : "Thêm mới"}
            </button>
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {schedule.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FaClock className="text-3xl text-blue-500" />
            </div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">Chưa có lịch làm việc</h4>
            <p className="text-gray-500">Hãy thêm lịch làm việc đầu tiên của bạn</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {schedule.map((item) => {
            const start = new Date(item.startTime)
            const end = new Date(item.endTime)
            return (
              <li
                key={item.id}
                className="flex items-center justify-between bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/30 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-white/50 hover:border-blue-200 transition-all duration-300 group"
              >
                <div className="flex-1">
                  <div className="font-bold text-xl text-gray-800 mb-2">
                    {start.toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center text-gray-600 text-lg">
                    <FaClock className="mr-2 text-blue-500" />
                    <span className="font-medium">
                      {start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} -{" "}
                      {end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                      item.status === "Available"
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                        : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {item.status === "Available" ? "Sẵn sàng" : item.status}
                  </span>
                  <button
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 group-hover:bg-blue-100"
                    onClick={() => handleEdit(item)}
                  >
                    <FaEdit />
                    Sửa
                  </button>
                  <button
                    className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-200 group-hover:bg-red-100"
                    onClick={() => handleDelete(item.id)}
                  >
                    🗑️
                    Xóa
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Schedule
