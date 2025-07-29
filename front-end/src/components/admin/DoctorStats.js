import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUserMd, FaCalendarAlt, FaChartLine, FaDownload } from 'react-icons/fa';
import StatsService from '../../service/StatsService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const DoctorStats = () => {
  const [stats, setStats] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchStats();
  }, [selectedYear, selectedMonth]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching stats for:', selectedYear, selectedMonth);
      
      const [doctorStatsData, dashboardStatsData] = await Promise.all([
        StatsService.getDoctorStats(selectedYear, selectedMonth),
        StatsService.getDashboardStats(selectedYear, selectedMonth)
      ]);
      
      console.log('Doctor stats data:', doctorStatsData);
      console.log('Dashboard stats data:', dashboardStatsData);
      
      // Đảm bảo dữ liệu là array và có dữ liệu
      let processedStats = [];
      if (Array.isArray(doctorStatsData) && doctorStatsData.length > 0) {
        processedStats = doctorStatsData;
      } else if (dashboardStatsData && dashboardStatsData.topDoctors && Array.isArray(dashboardStatsData.topDoctors)) {
        processedStats = dashboardStatsData.topDoctors;
      }
      
      setStats(processedStats);
      setDashboardStats(dashboardStatsData || {});
      
      console.log('Processed stats:', processedStats);
      console.log('Processed dashboard stats:', dashboardStatsData);
      
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
      console.error('Error fetching stats:', err);
      setStats([]);
      setDashboardStats({});
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!Array.isArray(stats) || stats.length === 0) return;
    const hasVaccination = stats.some(stat => stat.vaccinationCount && stat.vaccinationCount > 0);
    let wsData;
    if (hasVaccination) {
      wsData = [
        ['Bác sĩ', 'Chuyên khoa', 'Khám bệnh', 'Tiêm chủng', 'Tổng lượt khám'],
        ...stats.map(stat => [
          stat.doctorName,
          stat.specialtyName,
          stat.appointmentCount ?? 0,
          stat.vaccinationCount ?? 0,
          stat.totalExaminations ?? 0
        ])
      ];
    } else {
      wsData = [
        ['Bác sĩ', 'Chuyên khoa', 'Khám trong tháng', 'Tổng lượt khám trong năm'],
        ...stats.map(stat => [
          stat.doctorName,
          stat.specialtyName,
          stat.appointmentCount ?? 0,
          stat.totalExaminations ?? 0
        ])
      ];
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // Auto fit columns width
    const colWidths = wsData[0].map((_, colIdx) => {
      const maxLen = wsData.reduce((max, row) => {
        const val = row[colIdx] ? row[colIdx].toString() : '';
        return Math.max(max, val.length);
      }, 0);
      return { wch: maxLen + 2 };
    });
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Thống kê bác sĩ');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `thong-ke-bac-si-${selectedMonth}-${selectedYear}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">Lỗi</div>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchStats}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaChartLine className="mr-3 text-blue-600" />
            Thống kê lượt khám bác sĩ
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi số lượt khám của từng bác sĩ theo tháng
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
            disabled={stats.length === 0}
          >
            <FaDownload className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={fetchStats}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cập nhật
          </button>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng lượt khám</p>
              <p className="text-3xl font-bold">{dashboardStats.totalExaminations || 0}</p>
            </div>
            <FaChartLine className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Lượt khám bệnh</p>
              <p className="text-3xl font-bold">{dashboardStats.totalAppointments || 0}</p>
            </div>
            <FaCalendarAlt className="w-12 h-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Bác sĩ hoạt động</p>
              <p className="text-3xl font-bold">{dashboardStats.activeDoctors || 0}</p>
            </div>
            <FaUserMd className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {(!Array.isArray(stats) || stats.length === 0) ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FaChartLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có dữ liệu</h3>
          <p className="text-gray-600">
            Không có dữ liệu thống kê cho tháng {selectedMonth}/{selectedYear}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Stats length: {Array.isArray(stats) ? stats.length : 'Not array'}</p>
            <p>Stats type: {typeof stats}</p>
            <p>Stats content: {JSON.stringify(stats)}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Biểu đồ cột */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Biểu đồ thống kê lượt khám</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="doctorName" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'appointmentCount' ? 'Khám bệnh' : name === 'vaccinationCount' ? 'Tiêm chủng' : 'Tổng']}
                  labelFormatter={(label) => `Bác sĩ: ${label}`}
                />
                <Legend />
                <Bar dataKey="appointmentCount" fill="#8884d8" name="Khám bệnh" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bảng top bác sĩ */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Top bác sĩ nhiều lượt khám nhất</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {(Array.isArray(stats) ? stats.slice(0, 3) : []).map((stat, index) => (
                <div key={stat.doctorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-yellow-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{stat.doctorName}</p>
                      <p className="text-sm text-gray-600">{stat.specialtyName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{stat.totalExaminations}</p>
                    <p className="text-xs text-gray-500">
                      {stat.appointmentCount} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bảng chi tiết */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Chi tiết thống kê</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bác sĩ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chuyên khoa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lượt khám trong tháng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng lượt khám trong năm
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(Array.isArray(stats) ? stats : []).map((stat, index) => (
                    <tr key={stat.doctorId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <FaUserMd className="text-blue-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{stat.doctorName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.specialtyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {stat.appointmentCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {stat.totalExaminations}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorStats;