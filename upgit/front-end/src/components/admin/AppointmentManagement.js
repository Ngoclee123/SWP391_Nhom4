import React, { useState, useMemo, useCallback } from 'react';
import { Download, Plus, Eye, Edit, Trash2, AlertCircle, X } from 'lucide-react';
import SearchAndFilter from './SearchAndFilter';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import useSearch from './useSearch';

const MOCK_DATA = {
  appointments: [
    { id: 1, patient: 'Nguyễn Minh An', doctor: 'BS. Trần Hương', time: '09:00', status: 'confirmed', type: 'Khám tổng quát', date: '2024-01-15' },
    { id: 2, patient: 'Lê Thị Bình', doctor: 'BS. Nguyễn Đức', time: '10:30', status: 'waiting', type: 'Tư vấn dinh dưỡng', date: '2024-01-15' },
    { id: 3, patient: 'Phạm Văn Cường', doctor: 'BS. Mai Lan', time: '14:00', status: 'completed', type: 'Tiêm chủng', date: '2024-01-14' },
    { id: 4, patient: 'Hoàng Thị Dung', doctor: 'BS. Lê Minh', time: '15:30', status: 'cancelled', type: 'Khám chuyên khoa', date: '2024-01-14' }
  ]
};

const AppointmentManagement = React.memo(() => {
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, clearFilters } = useSearch();
  const [appointments, setAppointments] = useState(MOCK_DATA.appointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    time: '',
    date: '',
    type: '',
    status: 'waiting'
  });

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = !searchTerm ||
        appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, appointments]);

  const handleAction = useCallback((action, appointmentId) => {
    if (action === 'view') {
      console.log('View appointment:', appointmentId);
    } else if (action === 'edit') {
      const appointment = appointments.find(a => a.id === appointmentId);
      setSelectedAppointment(appointment);
      setFormData({ ...appointment });
      setModalMode('edit');
      setIsModalOpen(true);
    } else if (action === 'delete') {
      setAppointments(appointments.filter(a => a.id !== appointmentId));
    }
  }, [appointments]);

  const handleAddAppointment = useCallback(() => {
    setModalMode('create');
    setFormData({
      patient: '',
      doctor: '',
      time: '',
      date: '',
      type: '',
      status: 'waiting'
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newAppointment = {
        ...formData,
        id: appointments.length + 1
      };
      setAppointments([...appointments, newAppointment]);
    } else if (modalMode === 'edit') {
      setAppointments(appointments.map(a =>
        a.id === selectedAppointment.id ? { ...formData, id: a.id } : a
      ));
    }
    setIsModalOpen(false);
  }, [formData, modalMode, appointments, selectedAppointment]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý lịch hẹn</h2>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi tất cả lịch hẹn khám bệnh</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={handleAddAppointment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm lịch hẹn</span>
          </button>
        </div>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClear={clearFilters}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bệnh nhân</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bác sĩ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loại khám</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-gray-900">{appointment.patient}</div>
                    <div className="text-sm text-gray-500">ID: #{appointment.id}</div>
                  </td>
                  <td className="px-6 py-5 text-gray-900 font-medium">{appointment.doctor}</td>
                  <td className="px-6 py-5">
                    <div className="text-gray-900 font-medium">{appointment.time}</div>
                    <div className="text-sm text-gray-500">{appointment.date}</div>
                  </td>
                  <td className="px-6 py-5 text-gray-900">{appointment.type}</td>
                  <td className="px-6 py-5">
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-1">
                      <ActionButton
                        icon={Eye}
                        onClick={() => handleAction('view', appointment.id)}
                        color="blue"
                        tooltip="Xem chi tiết"
                      />
                      <ActionButton
                        icon={Edit}
                        onClick={() => handleAction('edit', appointment.id)}
                        color="green"
                        tooltip="Chỉnh sửa"
                      />
                      <ActionButton
                        icon={Trash2}
                        onClick={() => handleAction('delete', appointment.id)}
                        color="red"
                        tooltip="Xóa"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy lịch hẹn nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Thêm lịch hẹn' : 'Chỉnh sửa lịch hẹn'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bệnh nhân</label>
                  <input
                    type="text"
                    name="patient"
                    value={formData.patient}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bác sĩ</label>
                  <input
                    type="text"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại khám</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="waiting">Chờ xác nhận</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'create' ? 'Thêm' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default AppointmentManagement;