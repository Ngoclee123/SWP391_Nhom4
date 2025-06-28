import React, { useMemo } from 'react';
import StatCard from './StatCard';
import StatusBadge from './StatusBadge';
import AccountStatsChart from './AccountStatsChart';
import { Stethoscope, Clock, Users, Calendar, MessageSquare } from 'lucide-react';

const MOCK_DATA = {
  stats: [
    { title: 'Tổng bệnh nhân', value: '1,234', icon: Users, color: 'bg-blue-500', change: '+12%', trend: 'up' },
    { title: 'Lịch hẹn hôm nay', value: '45', icon: Calendar, color: 'bg-green-500', change: '+8%', trend: 'up' },
    { title: 'Bác sĩ trực tuyến', value: '12', icon: Stethoscope, color: 'bg-purple-500', change: '+3%', trend: 'up' },
    { title: 'Tư vấn hoàn thành', value: '89', icon: MessageSquare, color: 'bg-orange-500', change: '+15%', trend: 'up' }
  ],
  appointments: [
    { id: 1, patient: 'Nguyễn Minh An', doctor: 'BS. Trần Hương', time: '09:00', status: 'confirmed', type: 'Khám tổng quát', date: '2024-01-15' },
    { id: 2, patient: 'Lê Thị Bình', doctor: 'BS. Nguyễn Đức', time: '10:30', status: 'waiting', type: 'Tư vấn dinh dưỡng', date: '2024-01-15' },
    { id: 3, patient: 'Phạm Văn Cường', doctor: 'BS. Mai Lan', time: '14:00', status: 'completed', type: 'Tiêm chủng', date: '2024-01-14' },
    { id: 4, patient: 'Hoàng Thị Dung', doctor: 'BS. Lê Minh', time: '15:30', status: 'cancelled', type: 'Khám chuyên khoa', date: '2024-01-14' }
  ],
  doctors: [
    { id: 1, name: 'BS. Trần Hương', specialty: 'Nhi khoa', status: 'online', patients: 15, rating: 4.8, experience: 8 },
    { id: 2, name: 'BS. Nguyễn Đức', specialty: 'Dinh dưỡng', status: 'offline', patients: 12, rating: 4.9, experience: 12 },
    { id: 3, name: 'BS. Mai Lan', specialty: 'Tiêm chủng', status: 'online', patients: 8, rating: 4.7, experience: 6 },
    { id: 4, name: 'BS. Lê Minh', specialty: 'Tim mạch', status: 'busy', patients: 20, rating: 4.6, experience: 15 }
  ]
};

const DashboardOverview = React.memo(() => {
  const recentAppointments = useMemo(() => MOCK_DATA.appointments.slice(0, 4), []);
  const onlineDoctors = useMemo(() => MOCK_DATA.doctors.filter(d => d.status === 'online'), []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {MOCK_DATA.stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 ">
        <AccountStatsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Lịch hẹn gần đây</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Xem tất cả
            </button>
          </div>
          
          <div className="space-y-4">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">{appointment.patient}</p>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span className="flex items-center">
                      <Stethoscope className="w-4 h-4 mr-1" />
                      {appointment.doctor}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {appointment.time}
                    </span>
                  </div>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Bác sĩ trực tuyến</h3>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
              {onlineDoctors.length} đang hoạt động
            </span>
          </div>
          
          <div className="space-y-4">
            {onlineDoctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {doctor.name.split(' ').pop().charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">{doctor.experience} năm kinh nghiệm</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{doctor.patients}</p>
                  <p className="text-sm text-gray-600">bệnh nhân</p>
                  <div className="flex items-center justify-end mt-1">
                    <span className="text-yellow-500 text-sm">⭐</span>
                    <span className="text-sm font-medium text-gray-700 ml-1">{doctor.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardOverview;