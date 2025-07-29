"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import VaccineService from "../../service/VaccineService"
import { FaArrowLeft, FaCalendarPlus } from "react-icons/fa"

const VaccineDetail = () => {
  const { vaccineId } = useParams()
  const navigate = useNavigate()
  const [vaccine, setVaccine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await VaccineService.getVaccineById(vaccineId)
        setVaccine(res)
      } catch (err) {
        setError("Không thể tải thông tin vaccine.")
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [vaccineId])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl font-semibold text-blue-600">Đang tải...</div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )

  if (!vaccine) return null

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 flex flex-col items-center"
      style={{ marginTop: 80 }}
    >
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header with back button */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <button
            className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-blue-100 font-semibold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-200"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            Quay lại
          </button>
        </div>

        {/* Main content */}
        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={vaccine.image || "/placeholder.svg?height=300&width=300&query=vaccine"}
                alt={vaccine.name}
                className="w-80 h-80 object-cover rounded-2xl shadow-xl border-4 border-white"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {vaccine.name}
                </h1>
                <div className="text-lg text-gray-700 leading-relaxed mb-6">{vaccine.description}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                    Độ tuổi khuyến nghị
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">{vaccine.recommendedAge}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                  <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">Giá vaccine</h3>
                  <p className="text-2xl font-bold text-green-700">{vaccine.price?.toLocaleString()} VNĐ</p>
                </div>
              </div>

              <button
                className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => navigate(`/vaccines/${vaccine.id}`)}
              >
                <FaCalendarPlus className="text-xl" />
                Đặt vaccine này
              </button>
            </div>
          </div>

          {/* Certificate section */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Chứng chỉ liên quan
            </h2>
            {vaccine.certificate ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">{vaccine.certificate}</div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Không có chứng chỉ liên quan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VaccineDetail
