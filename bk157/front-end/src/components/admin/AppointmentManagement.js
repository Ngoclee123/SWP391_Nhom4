import React, { useState, useEffect } from 'react';
import AppointmentService from '../../service/AppointmentService';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    status: '',
    notes: ''
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await AppointmentService.getAllAppointments();
      setAppointments(Array.isArray(response) ? response : []);
      setError(null);
    } catch (err) {
      setAppointments([]); // Đảm bảo luôn là mảng
      setError('Không thể tải danh sách appointments');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = (appointment) => {
    // Đảm bảo appointmentTime luôn là HH:mm
    let timeValue = '';
    if (appointment.appointmentTime) {
      // Nếu đã đúng định dạng HH:mm thì giữ nguyên, nếu có giây thì cắt bỏ
      const parts = appointment.appointmentTime.split(':');
      if (parts.length >= 2) {
        timeValue = parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
      }
    }
    setSelectedAppointment(appointment);
    setEditForm({
      appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : '',
      appointmentTime: timeValue,
      status: appointment.status || '',
      notes: appointment.notes || ''
    });
    setShowModal(true);
  };

  const handleDeleteAppointment = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await AppointmentService.deleteAppointment(appointmentToDelete.appointmentId);
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
      loadAppointments();
    } catch (err) {
      setError('Không thể xóa appointment');
      console.error('Error deleting appointment:', err);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await AppointmentService.updateAppointmentStatus(appointmentId, newStatus);
      loadAppointments();
    } catch (err) {
      setError('Không thể cập nhật status');
      console.error('Error updating status:', err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updatedData = {
        ...editForm,
        appointmentDate: editForm.appointmentDate + 'T00:00:00'
      };
      
      await AppointmentService.updateAppointment(selectedAppointment.appointmentId, updatedData);
      setShowModal(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (err) {
      setError('Không thể cập nhật appointment');
      console.error('Error updating appointment:', err);
    }
  };

  // Sửa lại filter: nếu searchTerm rỗng thì không lọc theo search, nếu statusFilter là 'all' thì không lọc theo status
  const filteredAppointments = appointments.filter(appointment => {
    // Tìm kiếm theo tên bệnh nhân, tên bác sĩ, hoặc ID
    const matchesSearch = !searchTerm ||
      (appointment.patientName && appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.appointmentId && appointment.appointmentId.toString().includes(searchTerm));
    // Lọc status
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  console.log('appointments:', appointments);
  console.log('filteredAppointments:', filteredAppointments);

  const getStatusBadge = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Appointments</h1>
        <p className="text-gray-600">Quản lý tất cả appointments trong hệ thống</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ hoặc ID..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bệnh nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày hẹn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giờ hẹn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{appointment.appointmentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.patientName || appointment.patient || appointment.patientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.doctorName || appointment.doctor || appointment.doctorId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.appointmentTime ? appointment.appointmentTime.substring(0,8) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(appointment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy appointments nào
        </div>
      )}

      {/* View/Edit Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chỉnh sửa Appointment
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900">{selectedAppointment.appointmentId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bệnh nhân</label>
                  <p className="text-sm text-gray-900">{selectedAppointment.patientId || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bác sĩ</label>
                  <p className="text-sm text-gray-900">{selectedAppointment.doctorId || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày hẹn</label>
                  <input
                    type="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editForm.appointmentDate}
                    onChange={(e) => setEditForm({...editForm, appointmentDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giờ hẹn</label>
                  <input
                    type="time"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editForm.appointmentTime}
                    onChange={(e) => setEditForm({...editForm, appointmentTime: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                  <textarea
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Đóng
                </button>
                {editForm.appointmentDate && (
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Lưu
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && appointmentToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-sm text-gray-500 mb-4">
                Bạn có chắc chắn muốn xóa appointment #{appointmentToDelete.appointmentId}?
                Hành động này không thể hoàn tác.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;