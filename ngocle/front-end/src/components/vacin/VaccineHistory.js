"use client"

import { useEffect, useState } from "react"
import VaccineAppointmentService from "../../service/VaccineAppointmentService"
import { format, parseISO } from "date-fns"

const PAGE_SIZE = 5

const VaccineHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const response = await VaccineAppointmentService.getHistory(currentPage, PAGE_SIZE)
        if (response.data && Array.isArray(response.data.content)) {
          setHistory(response.data.content)
          setTotalPages(response.data.totalPages || 1)
        } else if (Array.isArray(response.data)) {
          setHistory(response.data)
          setTotalPages(1)
        } else {
          setHistory([])
          setTotalPages(1)
        }
        setLoading(false)
      } catch (err) {
        setError("Không thể tải lịch sử vaccine. Vui lòng thử lại.")
        setLoading(false)
      }
    }
    fetchHistory()
  }, [currentPage])

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
  }

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      if (currentPage < 4) {
        pages.push(0, 1, 2, 3, 4, -1, totalPages - 1)
      } else if (currentPage > totalPages - 5) {
        pages.push(0, -1, totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1)
      } else {
        pages.push(0, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages - 1)
      }
    }
    return pages
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "complete":
      case "hoàn thành":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
      case "chờ xử lý":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
      case "đã hủy":
        return "bg-red-100 text-red-800 border-red-200"
      case "confirmed":
      case "đã xác nhận":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "complete":
      case "hoàn thành":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "pending":
      case "chờ xử lý":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case "cancelled":
      case "đã hủy":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case "confirmed":
      case "đã xác nhận":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  const formatDate = (dateString) => {
    // parseISO sẽ parse đúng local time nếu dateString là yyyy-MM-ddTHH:mm:ss
    const date = parseISO(dateString)
    return {
      time: format(date, "HH:mm"),
      date: format(date, "dd/MM/yyyy"),
    }
  }

  const getFilterCount = (filterType) => {
    if (filterType === "all") return history.length
    if (filterType === "completed") {
      return history.filter(
        (item) =>
          item.status?.toLowerCase() === "completed" ||
          item.status?.toLowerCase() === "complete" ||
          item.status?.toLowerCase() === "hoàn thành",
      ).length
    }
    if (filterType === "pending") {
      return history.filter(
        (item) => item.status?.toLowerCase() === "pending" || item.status?.toLowerCase() === "chờ xử lý",
      ).length
    }
    return 0
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.vaccineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesFilter = true
    if (filter === "completed") {
      matchesFilter =
        item.status?.toLowerCase() === "completed" ||
        item.status?.toLowerCase() === "complete" ||
        item.status?.toLowerCase() === "hoàn thành"
    } else if (filter === "pending") {
      matchesFilter = item.status?.toLowerCase() === "pending" || item.status?.toLowerCase() === "chờ xử lý"
    }

    return matchesSearch && matchesFilter
  })

  const handleCancelRequest = async (id) => {
    try {
      await VaccineAppointmentService.requestCancelVaccineAppointment(id)
      // Sau khi gửi yêu cầu hủy, reload lại lịch sử
      const response = await VaccineAppointmentService.getHistory(currentPage, PAGE_SIZE)
      setHistory(response.data && Array.isArray(response.data.content) ? response.data.content : [])
    } catch (e) {
      alert("Gửi yêu cầu hủy thất bại!")
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center"
        style={{ marginTop: "80px" }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Đang tải lịch sử...</p>
        </div>
      </div>
    )
  }

  if (!history.length) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4"
        style={{ marginTop: "80px" }}
      >
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-4">Chưa có lịch sử đặt vaccine</h3>
          <p className="text-gray-500">Bạn chưa có lịch hẹn tiêm vaccine nào.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4"
      style={{ marginTop: "80px" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Lịch Sử Đặt Vaccine
          </h1>
          <p className="text-gray-600">Theo dõi lịch sử các lần đặt vaccine của bạn</p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === "all"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả ({getFilterCount("all")})
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === "completed"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Hoàn thành ({getFilterCount("completed")})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === "pending"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Chờ xử lý ({getFilterCount("pending")})
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm vaccine hoặc địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* History Cards */}
        <div className="space-y-6">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => {
              const { time, date } = formatDate(item.appointmentDate)
              return (
                <div
                  key={item.vaccineAppointmentId}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Vaccine Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        {item.vaccineImage ? (
                          <img
                            src={item.vaccineImage || "/placeholder.svg?height=128&width=128"}
                            alt="Vaccine"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">{item.vaccineName}</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Ngày hẹn</p>
                                <p className="font-semibold text-gray-900">{date}</p>
                                <p className="text-sm text-blue-600 font-medium">{time}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Địa điểm</p>
                                <p className="font-semibold text-gray-900">{item.location}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-medium ${getStatusColor(
                              item.status,
                            )}`}
                          >
                            {getStatusIcon(item.status)}
                            {item.status}
                            {(item.status === "Pending" || item.status === "Confirmed") && (
                              <button
                                className="ml-2 px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                                onClick={() => handleCancelRequest(item.vaccineAppointmentId || item.id)}
                              >
                                Yêu cầu hủy
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-500">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
                currentPage === 0
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              Trước
            </button>
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((page, idx) =>
                page === -1 ? (
                  <span key={idx} className="px-2 py-1 text-gray-400">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                    }`}
                  >
                    {page + 1}
                  </button>
                )
              )}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
                currentPage >= totalPages - 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VaccineHistory
