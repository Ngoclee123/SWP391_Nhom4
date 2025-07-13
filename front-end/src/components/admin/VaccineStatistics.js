"use client"

import { useEffect, useState } from "react"
import axios from "../../api/axiosClient"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

function VaccineStatistics() {
  const [stats, setStats] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line
  }, [month, year])

  const fetchStats = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`/api/vaccine-appointments/statistics?month=${month}&year=${year}`)
      setStats(res.data)
    } catch (e) {
      setError("Không thể tải thống kê. Vui lòng thử lại.")
    }
    setLoading(false)
  }

  const typeLabels = stats ? Object.keys(stats.vaccineTypeCount || {}) : []
  const typeData = stats ? Object.values(stats.vaccineTypeCount || {}) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              Thống kê Vaccine tháng {month}/{year}
            </h2>

            {/* Date Selectors */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <label className="text-white/90 font-medium">Tháng:</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 w-20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-white/90 font-medium">Năm:</label>
                <input
                  type="number"
                  min={2020}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 w-24 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-gray-600 text-lg">Đang tải thống kê...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-red-700 text-lg font-medium">{error}</span>
                </div>
              </div>
            ) : stats ? (
              <>
                {/* Revenue Card */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium uppercase tracking-wide">Tổng doanh thu</p>
                        <p className="text-white text-3xl font-bold">{stats.totalRevenue.toLocaleString()} VNĐ</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Bar Chart */}
                  <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-6 shadow-lg border border-blue-100/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Số lượng từng loại vaccine</h3>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm w-full h-[340px]">
                      <Bar
                        data={{
                          labels: typeLabels,
                          datasets: [
                            {
                              label: "Số lượng đặt",
                              data: typeData,
                              backgroundColor: "rgba(59, 130, 246, 0.8)",
                              borderColor: "rgba(59, 130, 246, 1)",
                              borderWidth: 2,
                              borderRadius: 0,
                              borderSkipped: false,
                              barThickness: 24,
                              maxBarThickness: 32,
                            },
                          ],
                        }}
                        options={{
                          indexAxis: 'y',
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            title: { display: false },
                          },
                          scales: {
                            x: {
                              beginAtZero: true,
                              grid: {
                                color: "rgba(0, 0, 0, 0.05)",
                              },
                              ticks: {
                                color: "#6B7280",
                              },
                            },
                            y: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: "#6B7280",
                              },
                            },
                          },
                        }}
                        height={340}
                      />
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-6 shadow-lg border border-purple-100/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Tỉ lệ loại vaccine</h3>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <Pie
                        data={{
                          labels: typeLabels,
                          datasets: [
                            {
                              label: "Tỉ lệ",
                              data: typeData,
                              backgroundColor: [
                                "rgba(59, 130, 246, 0.8)",
                                "rgba(251, 191, 36, 0.8)",
                                "rgba(52, 211, 153, 0.8)",
                                "rgba(248, 113, 113, 0.8)",
                                "rgba(167, 139, 250, 0.8)",
                                "rgba(244, 114, 182, 0.8)",
                                "rgba(250, 204, 21, 0.8)",
                              ],
                              borderColor: [
                                "rgba(59, 130, 246, 1)",
                                "rgba(251, 191, 36, 1)",
                                "rgba(52, 211, 153, 1)",
                                "rgba(248, 113, 113, 1)",
                                "rgba(167, 139, 250, 1)",
                                "rgba(244, 114, 182, 1)",
                                "rgba(250, 204, 21, 1)",
                              ],
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                padding: 20,
                                usePointStyle: true,
                                color: "#6B7280",
                              },
                            },
                            title: { display: false },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VaccineStatistics
