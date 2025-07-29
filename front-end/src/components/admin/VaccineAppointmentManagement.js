"use client"

import { useEffect, useState } from "react"
import axios from "../../api/axiosClient"
import "./pagination.css"
import PatientService from "../../service/PatientService"
import VaccineService from '../../service/VaccineService'
import VaccineAppointmentService from '../../service/VaccineAppointmentService'

function VaccineAppointmentManagement() {
  const [appointments, setAppointments] = useState([])
  const [statusEdit, setStatusEdit] = useState({})
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [patientNames, setPatientNames] = useState({})
  const [vaccineNames, setVaccineNames] = useState({})

  const STATUS_OPTIONS = [
    { value: "Pending", label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
    { value: "Confirmed", label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
    { value: "Completed", label: "Hoàn thành", color: "bg-green-100 text-green-800" },
    { value: "Cancelled", label: "Đã hủy", color: "bg-red-100 text-red-800" },
    { value: "CancelRequested", label: "Yêu cầu hủy", color: "bg-orange-100 text-orange-800" },
  ]

  useEffect(() => {
    fetchAppointments()
  }, [page])

  useEffect(() => {
    // Lấy tên bệnh nhân cho các lịch đặt thiếu tên
    const missingPatients = appointments.filter(app => !app.patientName && app.patientId && !patientNames[app.patientId]);
    missingPatients.forEach(app => {
      PatientService.getPatientId(app.patientId).then(data => {
        setPatientNames(prev => ({ ...prev, [app.patientId]: data.fullName }));
      });
    });
    // Lấy tên vaccine cho các lịch đặt thiếu tên
    const missingVaccines = appointments.filter(app => {
      const id = app.vaccineId || app.vaccine?.id;
      return (!app.vaccine?.name && id && !vaccineNames[id]);
    });
    missingVaccines.forEach(app => {
      const id = app.vaccineId || app.vaccine?.id;
      if (id) {
        VaccineService.getVaccineById(id).then(data => {
          setVaccineNames(prev => ({ ...prev, [id]: data.name }));
        });
      }
    });
  }, [appointments])

  const fetchAppointments = () => {
    axios
      .get(`/api/vaccine-appointments/admin?page=${page}&size=${size}`)
      .then((res) => {
        setAppointments(Array.isArray(res.data.content) ? res.data.content : [])
        setTotalPages(res.data.totalPages || 1)
      })
      .catch(() => {
        setAppointments([])
        setTotalPages(1)
      })
  }

  const handleStatusChange = (id, value) => {
    setStatusEdit({ ...statusEdit, [id]: value })
  }

  const handleStatusUpdate = (id) => {
    const newStatus = statusEdit[id] || ""
    VaccineAppointmentService.adminUpdateStatusFlow(id, newStatus)
      .then(fetchAppointments)
      .catch(console.error)
  }

  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa lịch đặt này?")) {
      axios.delete(`/api/vaccine-appointments/admin/${id}`).then(fetchAppointments).catch(console.error)
    }
  }

  const getStatusBadge = (status) => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === status)
    return statusOption ? statusOption : STATUS_OPTIONS[0]
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định"
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                />
              </svg>
              Quản lý Lịch Đặt Vaccine
            </h2>
            <div className="text-sm text-gray-500 bg-green-50 px-4 py-2 rounded-full">
              Tổng: {appointments.length} lịch đặt
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bệnh nhân hoặc vaccine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">STT</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Bệnh nhân</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Vaccine</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ngày hẹn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Địa điểm</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(appointments) &&
                  appointments
                    .filter(
                      (app) =>
                        (app.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
                        (app.vaccine?.name || vaccineNames[app.vaccineId] || vaccineNames[app.vaccine?.id] || "").toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((app, idx) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{page * size + idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mr-3">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {app.patientName || patientNames[app.patientId] || "Chưa xác định"}
                              </div>
                              <div className="text-xs text-gray-500">ID: {app.patientId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <svg
                                className="w-5 h-5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {app.vaccine?.name || vaccineNames[app.vaccineId] || vaccineNames[app.vaccine?.id] || "Chưa xác định"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{formatDate(app.appointmentDate)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-gray-400 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="truncate max-w-xs">{app.location || "Chưa xác định"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                getStatusBadge(app.status).color
                              }`}
                            >
                              {getStatusBadge(app.status).label}
                            </span>
                            <div className="flex items-center gap-2">
                              <select
                                value={statusEdit[app.id] ?? app.status}
                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                              >
                                {STATUS_OPTIONS.filter(opt => {
                                  if (app.status === "Pending") return ["Pending", "Confirmed", "Cancelled"].includes(opt.value)
                                  if (app.status === "Confirmed") return ["Confirmed", "Completed", "CancelRequested"].includes(opt.value)
                                  if (app.status === "CancelRequested") return ["CancelRequested", "Cancelled"].includes(opt.value)
                                  return [app.status].includes(opt.value)
                                }).map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleStatusUpdate(app.id)}
                                className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-green-600 transition-colors duration-200"
                              >
                                Cập nhật
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {Array.isArray(appointments) &&
            appointments.filter(
              (app) =>
                (app.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
                (app.vaccine?.name || vaccineNames[app.vaccineId] || vaccineNames[app.vaccine?.id] || "").toLowerCase().includes(search.toLowerCase()),
            ).length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                  />
                </svg>
                <p className="text-gray-500 text-lg">Không tìm thấy lịch đặt nào</p>
                <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm</p>
              </div>
            )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={page === i ? "active" : ""} onClick={() => setPage(i)}>
              {i + 1}
            </button>
          ))}
          <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default VaccineAppointmentManagement
