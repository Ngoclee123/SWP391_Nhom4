<<<<<<< HEAD
"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import DoctorService from "../../service/DoctorService"

function DoctorSearch() {
  const navigate = useNavigate()
  const doctorService = DoctorService

  const [searchCriteria, setSearchCriteria] = useState({
    specialtyId: "",
    fullName: "",
    availabilityStatus: "",
    location: "",
    availabilityTime: "", // Default to empty, user selects via datetime-local
  })

  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const searchRef = useRef(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const specialtiesResponse = await doctorService.getAllSpecialties()
        console.log("Fetched specialties:", specialtiesResponse)
        setSpecialties(Array.isArray(specialtiesResponse) ? specialtiesResponse : [])
      } catch (error) {
        console.error("Error fetching initial data:", error)
        setMessage("Không thể tải dữ liệu ban đầu")
        setSpecialties([])
      }
    }

    fetchInitialData()

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const availabilityTimeUTC = searchCriteria.availabilityTime
        ? new Date(new Date(searchCriteria.availabilityTime).getTime() + 7 * 60 * 60 * 1000).toISOString()
        : ""

      console.log("Sent availabilityTimeUTC:", availabilityTimeUTC) // Debug log

      const response = await doctorService.searchDoctors({
        ...searchCriteria,
        availabilityTime: availabilityTimeUTC,
        page,
        size: 10,
      })

      if (!response.content || response.content.length === 0) {
        setDoctors([])
        setMessage("Không tìm thấy bác sĩ nào")
        setTotalPages(0)
        return
      }

      setDoctors(response.content)
      setTotalPages(response.totalPages)
      setMessage("Tìm kiếm thành công")
    } catch (error) {
      console.error("Error searching doctors:", error)
      if (error.message.includes("Unauthorized")) {
        setMessage("Vui lòng đăng nhập để tìm kiếm bác sĩ")
      } else if (error.message.includes("Invalid")) {
        setMessage("Dữ liệu tìm kiếm không hợp lệ")
      } else {
        setMessage("Không thể tìm kiếm bác sĩ")
      }
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSearchCriteria({ ...searchCriteria, [name]: value })
  }

  const handleBookNow = (doctor) => {
    navigate("/book-appointment", { state: { doctor } })
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
      handleSearch({ preventDefault: () => {} })
    }
  }

  const isFormValid =
    searchCriteria.specialtyId ||
    searchCriteria.fullName ||
    searchCriteria.availabilityStatus ||
    searchCriteria.location ||
    searchCriteria.availabilityTime

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      {/* Banner */}
      <div
        className="w-full h-60 md:h-96 bg-blue-150 flex items-center justify-center overflow-hidden"
        style={{ marginTop: "120px" }}
      >
        <img
          src="https://pclinic.ohayo.io.vn/_next/static/media/BookingByDoctorBanner.44b2fe83.svg"
          alt="Gia đình và trẻ em"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-4xl mx-auto px-4 mt-6">
        <div ref={searchRef} className="relative">
          <div
            className="flex items-center border border-gray-300 rounded-lg p-2 bg-white shadow-sm cursor-pointer"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          >
            <input
              type="text"
              name="fullName"
              value={searchCriteria.fullName}
              onChange={handleInputChange}
              placeholder="Tìm kiếm bác sĩ..."
              className="flex-1 outline-none text-gray-700 px-3 py-2"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="ml-2 text-gray-500 hover:text-blue-500 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1114.65 6.65 7.5 7.5 0 1116.65 16.65z"
                />
              </svg>
            </button>
          </div>

          {/* Expanded Search Form */}
          {isSearchExpanded && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chuyên khoa</label>
                  <select
                    name="specialtyId"
                    value={searchCriteria.specialtyId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn chuyên khoa</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
                  <input
                    type="text"
                    name="location"
                    value={searchCriteria.location}
                    onChange={handleInputChange}
                    placeholder="Nhập địa điểm (ví dụ: Hà Nội)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian khả dụng</label>
                  <input
                    type="datetime-local"
                    name="availabilityTime"
                    value={searchCriteria.availabilityTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <select
                    name="availabilityStatus"
                    value={searchCriteria.availabilityStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="Available">Rảnh</option>
                    <option value="Booked">Đã đặt</option>
                    <option value="Unavailable">Không rảnh</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 rounded-lg font-semibold text-white transition duration-300 ${
                    isFormValid ? "bg-blue-700 hover:bg-blue-800" : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid}
                >
                  Tìm kiếm
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Search Results - IMPROVED DESIGN */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-10">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600 text-lg">Đang tìm kiếm...</p>
          </div>
        )}

        {message && !loading && (
          <div
            className={`text-center mb-8 p-4 rounded-lg font-medium ${
              message.includes("thành công")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {doctors.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-800">Kết quả tìm kiếm bác sĩ</h3>
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
                Tìm thấy {doctors.length} bác sĩ
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  <div className="flex">
                    {/* Doctor Image Section */}
                    <div className="relative w-40 h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0">
                      <img
                        src={doctor.imgs || "/images/default-doctor.jpg"}
                        alt={doctor.fullName}
                        className="w-28 h-28 object-cover rounded-full absolute top-6 left-6 border-4 border-white shadow-lg"
                      />
                      <div className="absolute bottom-4 left-6 right-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-center">
                          <div className="text-xs text-gray-600">Chuyên khoa</div>
                          <div className="text-sm font-semibold text-blue-600">{doctor.specialtyName || "N/A"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Info Section */}
                    <div className="flex-1 p-6">
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {doctor.fullName}
                        </h4>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 ml-1">4.8</span>
                            <span className="text-xs text-gray-500 ml-1">(156 đánh giá)</span>
                          </div>
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                          <span className="text-sm text-gray-600">15+ năm kinh nghiệm</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                        {doctor.bio ? doctor.bio.slice(0, 120) + (doctor.bio.length > 120 ? "..." : "") : "N/A"}
                      </p>

                      <div className="space-y-2 mb-4">
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
                          <span className="truncate">{doctor.locational || "N/A"}</span>
                        </div>
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
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span>{doctor.phoneNumber || "N/A"}</span>
                        </div>
                      </div>

                      {/* Certificates */}
                      {doctor.certificates && doctor.certificates.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {doctor.certificates.slice(0, 2).map((cert, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
                              >
                                {cert}
                              </span>
                            ))}
                            {doctor.certificates.length > 2 && (
                              <span className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-200">
                                +{doctor.certificates.length - 2} khác
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Section */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">500.000 VNĐ</span>
                          <span className="text-sm text-gray-500">/lần khám</span>
                        </div>
                        <button
                          onClick={() => navigate(`/doctor/${doctor.id}`)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          Xem chi tiết & Đặt lịch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls - IMPROVED */}
            <div className="flex justify-center items-center mt-12 gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-200 rounded-lg">
                {`Trang ${page + 1} của ${totalPages}`}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorSearch
=======
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentService from "../../service/AppointmentService";

const DoctorSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await AppointmentService.getSpecialties();
        setSpecialties(response.data);
      } catch (err) {
        console.error("Error fetching specialties:", err);
        setError("Không thể tải danh sách chuyên khoa");
      }
    };

    fetchSpecialties();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await AppointmentService.searchDoctors({
        name: searchTerm,
        specialty: specialty,
      });
      setDoctors(response.data);
    } catch (err) {
      console.error("Error searching doctors:", err);
      setError("Không thể tìm kiếm bác sĩ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tìm kiếm bác sĩ
        </h1>
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tên bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded-lg min-w-[200px]"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="p-2 border rounded-lg min-w-[200px]"
          >
            <option value="">Tất cả chuyên khoa</option>
            {specialties.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleDoctorClick(doctor.id)}
          >
            <img
              src={doctor.image || "/images/doctor-placeholder.jpg"}
              alt={doctor.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {doctor.name}
              </h2>
              <p className="text-blue-600 mb-2">{doctor.specialty}</p>
              <p className="text-gray-600 text-sm mb-4">{doctor.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-4">⭐ {doctor.rating || "N/A"}</span>
                <span>👥 {doctor.patientCount || 0} bệnh nhân</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && !loading && !error && (
        <div className="text-center text-gray-500 py-8">
          Không tìm thấy bác sĩ nào phù hợp với tiêu chí tìm kiếm
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
>>>>>>> ngocle_new
