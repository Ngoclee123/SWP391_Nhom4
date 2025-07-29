<<<<<<< HEAD
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import UserService from "../../service/userService"
import VaccineAppointmentService from "../../service/VaccineAppointmentService"
import { FaEye, FaCalendarPlus } from 'react-icons/fa';

const PAGE_SIZE = 6

// Hàm tính số tháng tuổi từ ngày sinh
function getAgeInMonths(dateOfBirth) {
  if (!dateOfBirth) return 0
  const dob = new Date(dateOfBirth)
  const now = new Date()
  return (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
}

// Hàm parse độ tuổi khuyến nghị
function parseRecommendedAge(recommendedAge) {
  if (!recommendedAge) return { min: 0, max: 1000 }
  const match = recommendedAge.match(/(\d+)[^\d]+(\d+)/)
  if (!match) return { min: 0, max: 1000 }
  const min = Number.parseInt(match[1], 10)
  const max = Number.parseInt(match[2], 10)
  if (recommendedAge.includes("tháng")) {
    return { min, max }
  } else if (recommendedAge.includes("tuổi")) {
    return { min: min * 12, max: max * 12 }
  }
  return { min: 0, max: 1000 }
}

const VaccinesList = () => {
  const navigate = useNavigate()
  const [vaccines, setVaccines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchName, setSearchName] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    if (!UserService.isLoggedIn()) {
      navigate("/login")
      return
    }
    const fetchVaccines = async () => {
      try {
        setLoading(true)
        const response = await VaccineAppointmentService.getAllVaccines(currentPage, PAGE_SIZE)
        if (response.data && Array.isArray(response.data.content)) {
          setVaccines(response.data.content)
          setTotalPages(response.data.totalPages || 1)
        } else if (Array.isArray(response.data)) {
          setVaccines(response.data)
          setTotalPages(1)
        } else {
          setVaccines([])
          setTotalPages(1)
        }
        setLoading(false)
      } catch (err) {
        setError("Không thể tải danh sách vaccine. Vui lòng thử lại.")
        setLoading(false)
      }
    }
    fetchVaccines()
  }, [navigate, currentPage])

  // Lấy danh sách bé
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await VaccineAppointmentService.getPatients()
        const data = Array.isArray(res) ? res : res.data || []
        setPatients(data)
      } catch (err) {
        // Không cần báo lỗi ở đây
      }
    }
    fetchPatients()
  }, [])

  // Khi chọn bé, lưu lại object bé
  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatient(null)
      return
    }
    const found = patients.find((p) => String(p.id || p.patient_id) === String(selectedPatientId))
    setSelectedPatient(found || null)
  }, [selectedPatientId, patients])

  const handleVaccineClick = (vaccineId) => {
    navigate(`/vaccines/${vaccineId}`)
  }

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

  // Gợi ý vaccine phù hợp
  let suggestedVaccines = []
  let ageInMonths = 0
  const dob = selectedPatient?.dateOfBirth || selectedPatient?.date_of_birth
  if (selectedPatient && dob) {
    ageInMonths = getAgeInMonths(dob)
    suggestedVaccines = vaccines.filter((vaccine) => {
      const { min, max } = parseRecommendedAge(vaccine.recommendedAge)
      return ageInMonths >= min && ageInMonths <= max
    })
  }

  // Filtered vaccine list
  const filteredVaccines = vaccines.filter((vaccine) => {
    const matchName = vaccine.name.toLowerCase().includes(searchName.toLowerCase())
    const price = vaccine.price || 0
    const matchMin = minPrice === "" || price >= Number(minPrice)
    const matchMax = maxPrice === "" || price <= Number(maxPrice)
    return matchName && matchMin && matchMax
  })

  // Thêm hàm handleDetailClick
  const handleDetailClick = (e, vaccineId) => {
    e.stopPropagation();
    navigate(`/vaccine-detail/${vaccineId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Đang tải danh sách vaccine...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4"
      style={{ marginTop: "80px" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Danh Sách Vaccine
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Chọn vaccine phù hợp để bảo vệ sức khỏe cho bé yêu của bạn
          </p>
        </div>

        {/* Patient Selection Card */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              Chọn bé để nhận gợi ý vaccine phù hợp
            </h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">-- Chọn bé --</option>
                {patients.map((p) => (
                  <option key={p.id || p.patient_id} value={String(p.id || p.patient_id)}>
                    {p.fullName || p.full_name} {p.dateOfBirth && `(Sinh: ${p.dateOfBirth})`}
                  </option>
                ))}
              </select>
            </div>
            {selectedPatient && selectedPatient.dateOfBirth && (
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Tuổi: {ageInMonths} tháng
              </div>
            )}
          </div>
        </div>

        {/* Vaccine Suggestions */}
        {selectedPatient && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-green-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                Gợi ý vaccine phù hợp cho {selectedPatient.fullName || selectedPatient.full_name}
              </h3>
            </div>
            {suggestedVaccines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedVaccines.map((vaccine) => (
                  <div
                    key={vaccine.id}
                    className="bg-white/80 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
                    onClick={() => handleVaccineClick(vaccine.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-green-800 text-sm">{vaccine.name}</h4>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        Phù hợp
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">{vaccine.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Độ tuổi: {vaccine.recommendedAge}</span>
                      <span className="font-semibold text-green-700">{vaccine.price?.toLocaleString()} VNĐ</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-300"
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
                <p>Không có vaccine phù hợp với độ tuổi của bé hiện tại.</p>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                />
              </svg>
              Tìm kiếm và lọc vaccine
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm theo tên</label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
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
                  placeholder="Nhập tên vaccine..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá (VNĐ)</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    min="0"
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="md:col-span-2">
              <button
                onClick={() => {
                  setSearchName("")
                  setMinPrice("")
                  setMaxPrice("")
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Filter Summary */}
          {(searchName || minPrice || maxPrice) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                <span>Đang lọc:</span>
                {searchName && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Tên: "{searchName}"</span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                    Giá: {minPrice || "0"} - {maxPrice || "∞"} VNĐ
                  </span>
                )}
                <span className="ml-auto font-medium">Tìm thấy {filteredVaccines.length} kết quả</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center text-red-700">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Vaccine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredVaccines.length > 0
            ? filteredVaccines.map((vaccine) => (
                <div
                  key={vaccine.id}
                  className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-white/20 relative"
                  onClick={() => handleVaccineClick(vaccine.id)}
                >
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img
                      src={vaccine.image || "/placeholder.svg?height=200&width=400"}
                      alt={vaccine.name}
                      className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Icon hover */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                      <button
                        className="bg-white/90 hover:bg-blue-100 text-blue-600 rounded-full p-2 shadow-md border border-blue-100"
                        title="Xem chi tiết"
                        onClick={(e) => handleDetailClick(e, vaccine.id)}
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        className="bg-white/90 hover:bg-green-100 text-green-600 rounded-full p-2 shadow-md border border-green-100"
                        title="Đặt vaccine"
                        onClick={(e) => { e.stopPropagation(); handleVaccineClick(vaccine.id); }}
                      >
                        <FaCalendarPlus size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                      {vaccine.name}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{vaccine.description}</p>
                    <div className="border-t border-gray-200 my-3"></div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Độ tuổi khuyến nghị:</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {vaccine.recommendedAge}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Giá:</span>
                        <span className="text-lg font-bold text-green-600">{vaccine.price?.toLocaleString()} VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : !error && (
                <div className="col-span-full text-center py-16">
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
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy vaccine nào</h3>
                  <p className="text-gray-500">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              )}
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Trang {currentPage + 1} / {totalPages}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-1 px-4 py-2 rounded-xl border transition-all duration-200 ${
                    currentPage === 0
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Trước
                </button>

                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, idx) =>
                    page === -1 ? (
                      <span key={idx} className="px-2 py-1 text-gray-400">
                        ...
                      </span>
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
                    ),
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-xl border transition-all duration-200 ${
                    currentPage >= totalPages - 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  Sau
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="text-sm text-gray-600">Tổng {vaccines.length} vaccine</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VaccinesList
=======
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../service/userService';
import VaccineAppointmentService from '../../service/VaccineAppointmentService';

const VaccinesList = () => {
    const navigate = useNavigate();
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!UserService.isLoggedIn()) {
            navigate('/login');
            return;
        }

        const fetchVaccines = async () => {
            try {
                setLoading(true);
                const response = await VaccineAppointmentService.getAllVaccines();
                console.log('Fetched vaccines:', response);
                if (Array.isArray(response)) {
                    setVaccines(response);
                } else {
                    setVaccines(response.data || []);
                }
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách vaccine. Vui lòng thử lại.');
                console.error('Error fetching vaccines:', err);
                setLoading(false);
            }
        };
        fetchVaccines();
    }, [navigate]);

    const handleVaccineClick = (vaccineId) => {
        navigate(`/vaccines/${vaccineId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4" style={{ marginTop: '80px' }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Danh Sách Vaccine
                    </h2>
                    <p className="mt-3 text-gray-600 text-lg">Chọn vaccine để đặt lịch tiêm cho bé</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 border-l-4 border-red-400 text-red-700">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vaccines.length > 0 ? (
                        vaccines.map((vaccine) => (
                            <div
                                key={vaccine.id}
                                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                onClick={() => handleVaccineClick(vaccine.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === 'Space') {
                                        handleVaccineClick(vaccine.id);
                                    }
                                }}
                            >
                                <div className="relative group mb-4">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                    <img
                                        src={vaccine.image || '/images/vaccines/default.jpg'}
                                        alt={vaccine.name}
                                        className="relative h-48 w-full object-cover rounded-2xl shadow-md"
                                    />
                                </div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                    {vaccine.name}
                                </h3>
                                <p className="text-gray-600 mb-2">{vaccine.description}</p>
                                <p className="text-sm text-gray-500">Độ tuổi khuyến nghị: {vaccine.recommendedAge}</p>
                            </div>
                        ))
                    ) : (
                        !error && <p className="text-center text-gray-500">Không có vaccine nào để hiển thị.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VaccinesList;
>>>>>>> ngocle_new
