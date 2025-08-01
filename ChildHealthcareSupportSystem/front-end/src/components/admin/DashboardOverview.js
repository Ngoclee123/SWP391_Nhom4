import React, { useMemo, useEffect, useState } from 'react';
import StatCard from './StatCard';
// import StatusBadge from './StatusBadge';
// import AccountStatsChart from './AccountStatsChart';
import { Stethoscope, Clock, Users, Calendar, MessageSquare } from 'lucide-react';
import StatsService from '../../service/StatsService';
import AppointmentService from '../../service/AppointmentService';
import DoctorService from '../../service/DoctorService';

const DashboardOverview = React.memo(({ setActiveTab }) => {
  const [dashboardStats, setDashboardStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [onlineDoctors, setOnlineDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDoctorPage, setCurrentDoctorPage] = useState(1);
  const doctorsPerPage = 4;


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy tổng quan dashboard
        const stats = await StatsService.getDashboardStats();
        setDashboardStats({
          totalPatients: stats.totalPatients ?? 0,
          todayAppointments: stats.todayAppointments ?? 0,
          onlineDoctors: stats.onlineDoctors ?? 0,
        });
        // Lấy lịch hẹn gần đây
        let appts = [];
        try {
          const apptRes = await AppointmentService.getRecentAppointments();
          appts = apptRes?.data || apptRes || [];
        } catch (err) {
          appts = [];
        }
        setRecentAppointments(Array.isArray(appts) ? appts.slice(0, 4) : []);
        // Lấy bác sĩ online
        let doctors = [];
        try {
          const docRes = await DoctorService.getOnlineDoctors();
          doctors = docRes?.data || docRes || [];
        } catch (err) {
          doctors = [];
        }
        setOnlineDoctors(Array.isArray(doctors) ? doctors : []);
      } catch (e) {
        setDashboardStats({ totalPatients: 0, todayAppointments: 0, onlineDoctors: 0 });
        setRecentAppointments([]);
        setOnlineDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Chuẩn bị dữ liệu cho StatCard
  const statCards = useMemo(() => [
    {
      title: 'Tổng bệnh nhân',
      value: dashboardStats.totalPatients || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '',
      trend: ''
    },
    {
      title: 'Lịch hẹn hôm nay',
      value: dashboardStats.todayAppointments || 0,
      icon: Calendar,
      color: 'bg-green-500',
      change: '',
      trend: ''
    },
    {
      title: 'Bác sĩ trực tuyến',
      value: dashboardStats.onlineDoctors || 0,
      icon: Stethoscope,
      color: 'bg-purple-500',
      change: '',
      trend: ''
    }
  ], [dashboardStats]);

  // Tính toán phân trang cho bác sĩ
  const indexOfLastDoctor = currentDoctorPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = Array.isArray(onlineDoctors) ? onlineDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor) : [];
  const totalDoctorPages = Math.ceil((Array.isArray(onlineDoctors) ? onlineDoctors.length : 0) / doctorsPerPage);

  // Thêm mapping trạng thái tiếng Việt và màu
  const STATUS_LABELS = {
    'Pending': 'Chờ xác nhận',
    'Confirmed': 'Đã xác nhận',
    'Completed': 'Đã hoàn thành',
    'Cancelled': 'Đã hủy'
  };
  const STATUS_COLORS = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Confirmed': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700'
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 ">
        <AccountStatsChart />
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Lịch hẹn gần đây</h3>
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={() => setActiveTab('appointments')}
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {recentAppointments.length === 0 ? (
              <div className="text-gray-500 text-center py-8">Không có lịch hẹn gần đây</div>
            ) : recentAppointments.map((appointment) => (
              <div key={appointment.appointmentId || appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">{appointment.patientName || appointment.patient || 'Không rõ'}</p>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span className="flex items-center"><Stethoscope className="w-4 h-4 mr-1" />{appointment.doctorName || appointment.doctor || 'Không rõ'}</span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {appointment.appointmentDate
                        ? new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')
                        : ''}
                      {appointment.appointmentDate
                        ? ' ' + new Date(appointment.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[appointment.status] || 'bg-gray-100 text-gray-700'}`}>{STATUS_LABELS[appointment.status] || appointment.status || 'Không xác định'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Bác sĩ trực tuyến</h3>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">{dashboardStats.onlineDoctors || 0} đang hoạt động</span>
          </div>
          <div className="space-y-4">
            {currentDoctors.length === 0 ? (
              <div className="text-gray-500 text-center py-8">Không có bác sĩ online</div>
            ) : currentDoctors.map((doctor) => (
              <div key={doctor.id || doctor.doctorId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{doctor.fullName ? doctor.fullName.split(' ').pop().charAt(0) : '?'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doctor.fullName || ''}</p>
                    <p className="text-sm text-gray-600">{doctor.specialtyName || (doctor.specialty ? (doctor.specialty.name || doctor.specialty) : '')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Thanh phân trang luôn ở dưới cùng card */}
          <div className="flex justify-center items-center space-x-2 mt-auto pt-6">
            <button
              onClick={() => setCurrentDoctorPage(prev => Math.max(prev - 1, 1))}
              disabled={currentDoctorPage === 1 || totalDoctorPages <= 1}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentDoctorPage === 1 || totalDoctorPages <= 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              Trước
            </button>
            {totalDoctorPages > 1 ? (
              Array.from({ length: totalDoctorPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentDoctorPage(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentDoctorPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))
            ) : (
              <span className="px-3 py-1 text-sm text-gray-500">Trang 1</span>
            )}
            <button
              onClick={() => setCurrentDoctorPage(prev => Math.min(prev + 1, totalDoctorPages))}
              disabled={currentDoctorPage === totalDoctorPages || totalDoctorPages <= 1}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentDoctorPage === totalDoctorPages || totalDoctorPages <= 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardOverview;