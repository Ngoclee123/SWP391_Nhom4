// import { useState } from 'react';
// import { Calendar, Users, Stethoscope, MessageSquare, Settings, Bell, Search, Plus, Edit, Trash2, Eye, FileText, BarChart3, Clock, UserCheck, AlertCircle } from 'lucide-react';

// export default function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [notifications, setNotifications] = useState(3);

//   // Sample data
//   const stats = [
//     { title: 'Tổng bệnh nhân', value: '1,234', icon: Users, color: 'bg-blue-500', change: '+12%' },
//     { title: 'Lịch hẹn hôm nay', value: '45', icon: Calendar, color: 'bg-green-500', change: '+8%' },
//     { title: 'Bác sĩ trực tuyến', value: '12', icon: Stethoscope, color: 'bg-purple-500', change: '+3%' },
//     { title: 'Tư vấn hoàn thành', value: '89', icon: MessageSquare, color: 'bg-orange-500', change: '+15%' }
//   ];

//   const appointments = [
//     { id: 1, patient: 'Nguyễn Minh An', doctor: 'BS. Trần Hương', time: '09:00', status: 'confirmed', type: 'Khám tổng quát' },
//     { id: 2, patient: 'Lê Thị Bình', doctor: 'BS. Nguyễn Đức', time: '10:30', status: 'waiting', type: 'Tư vấn dinh dưỡng' },
//     { id: 3, patient: 'Phạm Văn Cường', doctor: 'BS. Mai Lan', time: '14:00', status: 'completed', type: 'Tiêm chủng' },
//     { id: 4, patient: 'Hoàng Thị Dung', doctor: 'BS. Lê Minh', time: '15:30', status: 'cancelled', type: 'Khám chuyên khoa' }
//   ];

//   const doctors = [
//     { id: 1, name: 'BS. Trần Hương', specialty: 'Nhi khoa', status: 'online', patients: 15, rating: 4.8 },
//     { id: 2, name: 'BS. Nguyễn Đức', specialty: 'Dinh dưỡng', status: 'offline', patients: 12, rating: 4.9 },
//     { id: 3, name: 'BS. Mai Lan', specialty: 'Tiêm chủng', status: 'online', patients: 8, rating: 4.7 },
//     { id: 4, name: 'BS. Lê Minh', specialty: 'Tim mạch', status: 'busy', patients: 20, rating: 4.6 }
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'confirmed': return 'bg-green-100 text-green-800';
//       case 'waiting': return 'bg-yellow-100 text-yellow-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       case 'cancelled': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getDoctorStatusColor = (status) => {
//     switch (status) {
//       case 'online': return 'bg-green-100 text-green-800';
//       case 'offline': return 'bg-gray-100 text-gray-800';
//       case 'busy': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const sidebarItems = [
//     { id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
//     { id: 'appointments', label: 'Lịch hẹn', icon: Calendar },
//     { id: 'doctors', label: 'Bác sĩ', icon: Stethoscope },
//     { id: 'patients', label: 'Bệnh nhân', icon: Users },
//     { id: 'consultations', label: 'Tư vấn', icon: MessageSquare },
//     { id: 'reports', label: 'Báo cáo', icon: FileText },
//     { id: 'settings', label: 'Cài đặt', icon: Settings }
//   ];

//   const renderDashboard = () => (
//     <div className="space-y-6">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
//                 <p className="text-sm text-green-600 mt-1">{stat.change} so với tháng trước</p>
//               </div>
//               <div className={`${stat.color} p-3 rounded-lg`}>
//                 <stat.icon className="w-6 h-6 text-white" />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Recent Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch hẹn gần đây</h3>
//           <div className="space-y-4">
//             {appointments.slice(0, 4).map((appointment) => (
//               <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div>
//                   <p className="font-medium text-gray-900">{appointment.patient}</p>
//                   <p className="text-sm text-gray-600">{appointment.doctor} - {appointment.time}</p>
//                 </div>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
//                   {appointment.status === 'confirmed' ? 'Đã xác nhận' :
//                    appointment.status === 'waiting' ? 'Chờ xác nhận' :
//                    appointment.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Bác sĩ trực tuyến</h3>
//           <div className="space-y-4">
//             {doctors.filter(d => d.status === 'online').map((doctor) => (
//               <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
//                     <span className="text-white font-medium">
//                       {doctor.name.split(' ').pop().charAt(0)}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">{doctor.name}</p>
//                     <p className="text-sm text-gray-600">{doctor.specialty}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-medium text-gray-900">{doctor.patients} bệnh nhân</p>
//                   <p className="text-sm text-gray-600">⭐ {doctor.rating}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderAppointments = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h2>
//         <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
//           <Plus className="w-4 h-4" />
//           <span>Thêm lịch hẹn</span>
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center space-x-4">
//             <div className="relative flex-1">
//               <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm bệnh nhân, bác sĩ..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
//               <option>Tất cả trạng thái</option>
//               <option>Đã xác nhận</option>
//               <option>Chờ xác nhận</option>
//               <option>Hoàn thành</option>
//               <option>Đã hủy</option>
//             </select>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bác sĩ</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại khám</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {appointments.map((appointment) => (
//                 <tr key={appointment.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="font-medium text-gray-900">{appointment.patient}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {appointment.doctor}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {appointment.time}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {appointment.type}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
//                       {appointment.status === 'confirmed' ? 'Đã xác nhận' :
//                        appointment.status === 'waiting' ? 'Chờ xác nhận' :
//                        appointment.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex items-center space-x-2">
//                       <button className="text-blue-600 hover:text-blue-900">
//                         <Eye className="w-4 h-4" />
//                       </button>
//                       <button className="text-green-600 hover:text-green-900">
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button className="text-red-600 hover:text-red-900">
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );

//   const renderDoctors = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Quản lý bác sĩ</h2>
//         <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
//           <Plus className="w-4 h-4" />
//           <span>Thêm bác sĩ</span>
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {doctors.map((doctor) => (
//           <div key={doctor.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <div className="flex items-center space-x-4 mb-4">
//               <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
//                 <span className="text-white text-xl font-medium">
//                   {doctor.name.split(' ').pop().charAt(0)}
//                 </span>
//               </div>
//               <div className="flex-1">
//                 <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
//                 <p className="text-sm text-gray-600">{doctor.specialty}</p>
//                 <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getDoctorStatusColor(doctor.status)}`}>
//                   {doctor.status === 'online' ? 'Trực tuyến' :
//                    doctor.status === 'offline' ? 'Ngoại tuyến' : 'Bận rộn'}
//                 </span>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-2 gap-4 mb-4">
//               <div className="text-center">
//                 <p className="text-2xl font-bold text-gray-900">{doctor.patients}</p>
//                 <p className="text-sm text-gray-600">Bệnh nhân</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-2xl font-bold text-gray-900">{doctor.rating}</p>
//                 <p className="text-sm text-gray-600">Đánh giá</p>
//               </div>
//             </div>

//             <div className="flex items-center space-x-2">
//               <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 text-sm font-medium">
//                 Xem chi tiết
//               </button>
//               <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
//                 <Edit className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard': return renderDashboard();
//       case 'appointments': return renderAppointments();
//       case 'doctors': return renderDoctors();
//       case 'patients': return <div className="text-center py-12 text-gray-500">Chức năng quản lý bệnh nhân đang được phát triển</div>;
//       case 'consultations': return <div className="text-center py-12 text-gray-500">Chức năng quản lý tư vấn đang được phát triển</div>;
//       case 'reports': return <div className="text-center py-12 text-gray-500">Chức năng báo cáo đang được phát triển</div>;
//       case 'settings': return <div className="text-center py-12 text-gray-500">Chức năng cài đặt đang được phát triển</div>;
//       default: return renderDashboard();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-white shadow-sm">
//         <div className="p-6">
//           <div className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <Stethoscope className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h1 className="text-lg font-bold text-gray-900">KidsHealth</h1>
//               <p className="text-xs text-gray-500">Admin Panel</p>
//             </div>
//           </div>
//         </div>

//         <nav className="px-6 pb-6">
//           <ul className="space-y-2">
//             {sidebarItems.map((item) => (
//               <li key={item.id}>
//                 <button
//                   onClick={() => setActiveTab(item.id)}
//                   className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
//                     activeTab === item.id
//                       ? 'bg-blue-100 text-blue-700'
//                       : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
//                   }`}
//                 >
//                   <item.icon className="w-5 h-5" />
//                   <span className="font-medium">{item.label}</span>
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <header className="bg-white shadow-sm px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">
//                 {sidebarItems.find(item => item.id === activeTab)?.label || 'Tổng quan'}
//               </h2>
//               <p className="text-sm text-gray-600">Chào mừng bạn quay trở lại!</p>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <button className="p-2 text-gray-400 hover:text-gray-600">
//                   <Bell className="w-6 h-6" />
//                   {notifications > 0 && (
//                     <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                       {notifications}
//                     </span>
//                   )}
//                 </button>
//               </div>
              
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
//                   <span className="text-sm font-medium text-white">A</span>
//                 </div>
//                 <div className="text-sm">
//                   <p className="font-medium text-gray-900">Admin</p>
//                   <p className="text-gray-500">Quản trị viên</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 p-6">
//           {renderContent()}
//         </main>
//       </div>
//     </div>
//   );
// }