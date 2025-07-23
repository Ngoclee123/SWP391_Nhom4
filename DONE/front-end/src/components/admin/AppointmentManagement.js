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
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotError, setSlotError] = useState('');
  // Thêm biến cờ để phân biệt lần đầu mở modal sửa và đổi ngày
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const [oldTimeValue, setOldTimeValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 7;


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
      // Map lại key cho đúng với frontend
      const mapped = (Array.isArray(response.data || response) ? (response.data || response) : []).map(item => ({
        appointmentId: item.id,
        patientId: item.patientId,
        doctorId: item.doctorId,
        appointmentDate: item.appointmentDate,
        status: item.status,
        notes: item.notes,
        patientName: item.patientName,
        doctorName: item.doctorName,
        // Không map appointmentTime ở đây nữa
      }));
      setAppointments(mapped);
      setError(null);
    } catch (err) {
      setAppointments([]); // Đảm bảo luôn là mảng
      setError('Không thể tải danh sách appointments');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleEditAppointment = async (appointment) => {
    let timeValue = '';
    if (appointment.appointmentDate) {
      const dateObj = new Date(appointment.appointmentDate);
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      timeValue = `${hours}:${minutes}`;
    }
    setSelectedAppointment(appointment);
    setEditForm({
      appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : '',
      appointmentTime: '', // Để rỗng, sẽ set lại sau khi slot trả về
      status: appointment.status || '',
      notes: appointment.notes || ''
    });
    setOldTimeValue(timeValue); // Lưu lại giờ cũ
    setShowModal(true);
    // Lấy slot hợp lệ của bác sĩ theo ngày
    if (appointment.doctorId && appointment.appointmentDate) {
      try {
        const res = await AppointmentService.getAvailableSlotsForDoctor(
          appointment.doctorId,
          appointment.appointmentDate.split('T')[0]
        );
        const slots = res.data || res;
        setAvailableSlots(slots);
        setSlotError('');
      } catch (err) {
        setAvailableSlots([]);
        setSlotError('Không thể tải slot hợp lệ của bác sĩ');
      }
    } else {
      setAvailableSlots([]);
      setSlotError('Không xác định được bác sĩ hoặc ngày');
    }
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
      let appointmentTimeToSave = editForm.appointmentTime;
      // Nếu không chọn giờ mới, lấy lại giờ cũ
      if (!appointmentTimeToSave) {
        appointmentTimeToSave = oldTimeValue;
      }
      const updatedData = {
        ...editForm,
        appointmentDate: editForm.appointmentDate + 'T00:00:00',
        appointmentTime: appointmentTimeToSave
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
    // Lọc status (so sánh viết hoa)
    const matchesStatus = statusFilter === 'all' || (appointment.status && appointment.status.toUpperCase() === statusFilter.toUpperCase());
    return matchesSearch && matchesStatus;
  });
  console.log('appointments:', appointments);
  console.log('filteredAppointments:', filteredAppointments);

  // Phân trang sau khi lọc
  const paginatedAppointments = React.useMemo(() => {
    const startIdx = (currentPage - 1) * appointmentsPerPage;
    return filteredAppointments.slice(startIdx, startIdx + appointmentsPerPage);
  }, [filteredAppointments, currentPage]);
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  // Khi search/filter đổi thì về trang 1
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);


  // 1. Đổi các status tiếng Anh sang tiếng Việt
  const STATUS_LABELS = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'COMPLETED': 'Đã hoàn thành',
    'CANCELLED': 'Đã hủy'
  };

  // 2. Sửa getStatusBadge
  const getStatusBadge = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {STATUS_LABELS[status] || status}
      </span>
    );
  };


  // useEffect: Khi slot hoặc oldTimeValue thay đổi, set lại giờ cũ nếu có trong slot
  React.useEffect(() => {
    if (showModal && availableSlots.length > 0 && oldTimeValue) {
      const foundSlot = availableSlots.find(slot => {
        const slotTime = slot.startTime.padStart(5, '0');
        const oldTime = oldTimeValue.padStart(5, '0');
        return slotTime === oldTime;
      });
      if (foundSlot && editForm.appointmentTime !== foundSlot.startTime) {
        setEditForm(prev => ({ ...prev, appointmentTime: foundSlot.startTime }));
      }
      // Nếu không có slot trùng và appointmentTime không rỗng, set về rỗng
      if (!foundSlot && editForm.appointmentTime !== '') {
        setEditForm(prev => ({ ...prev, appointmentTime: '' }));
      }
    }
  }, [showModal, availableSlots, oldTimeValue]);


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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Lịch hẹn</h1>
        <p className="text-gray-600">Quản lý tất cả lịch hẹn trong hệ thống</p>
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
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
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
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAppointments.map((appointment) => (
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
                    {appointment.appointmentDate
                      ? new Date(appointment.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge((appointment.status || '').toUpperCase())}
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
        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </div>


      {filteredAppointments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy lịch hẹn nào
        </div>
      )}


      {/* View/Edit Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
            style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Chỉnh sửa Lịch hẹn
              </h3>
             
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900">{selectedAppointment.appointmentId}</p>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bệnh nhân</label>
                  <p className="text-sm text-gray-900">{selectedAppointment.patientName || 'N/A'}</p>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bác sĩ</label>
                  <p className="text-sm text-gray-900">{selectedAppointment.doctorName || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày hẹn</label>
                  <input
                    type="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editForm.appointmentDate}
                    onChange={async (e) => {
                      const newDate = e.target.value;
                      setEditForm({ ...editForm, appointmentDate: newDate });
                      // Không reset oldTimeValue về rỗng khi đổi ngày
                      if (selectedAppointment && selectedAppointment.doctorId) {
                        try {
                          const res = await AppointmentService.getAvailableSlotsForDoctor(selectedAppointment.doctorId, newDate);
                          const slots = res.data || res;
                          setAvailableSlots(slots);
                          setSlotError(slots.length === 0 ? 'Bác sĩ không có lịch làm việc ngày này' : '');
                          if (slots.length > 0) {
                            setEditForm(prev => ({ ...prev, appointmentTime: slots[0].startTime }));
                          } else {
                            setEditForm(prev => ({ ...prev, appointmentTime: '' }));
                          }
                        } catch (err) {
                          setAvailableSlots([]);
                          setSlotError('Không thể tải slot hợp lệ của bác sĩ');
                          setEditForm(prev => ({ ...prev, appointmentTime: '' }));
                        }
                      } else {
                        setAvailableSlots([]);
                        setSlotError('Không xác định được bác sĩ');
                        setEditForm(prev => ({ ...prev, appointmentTime: '' }));
                      }
                    }}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giờ hẹn</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editForm.appointmentTime}
                    onChange={e => setEditForm({ ...editForm, appointmentTime: e.target.value })}
                    disabled={availableSlots.length === 0 && !oldTimeValue}
                  >
                    <option value="">Chọn giờ hợp lệ</option>
                    {/* Nếu giờ cũ không nằm trong availableSlots, thêm option cho giờ cũ */}
                    {oldTimeValue && !availableSlots.some(slot => slot.startTime === oldTimeValue) && (
                      <option value={oldTimeValue}>{oldTimeValue} (Giờ hiện tại)</option>
                    )}
                    {availableSlots.filter(slot => slot.status === 'Available').map(slot => (
                      <option key={slot.startTime} value={slot.startTime}>{slot.startTime} - {slot.endTime}</option>
                    ))}
                  </select>
                  {slotError && <div className="text-red-500 text-xs mt-1">{slotError}</div>}
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
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
                Bạn có chắc chắn muốn xóa lịch hẹn #{appointmentToDelete.appointmentId}?
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



