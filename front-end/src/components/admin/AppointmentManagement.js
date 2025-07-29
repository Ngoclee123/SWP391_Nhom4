<<<<<<< HEAD
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
=======
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
>>>>>>> ngocle_new
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
<<<<<<< HEAD
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
=======

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy lịch hẹn nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
>>>>>>> ngocle_new
          </div>
        )}
      </div>

<<<<<<< HEAD

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
=======
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
>>>>>>> ngocle_new
                >
                  Hủy
                </button>
                <button
<<<<<<< HEAD
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
=======
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'create' ? 'Thêm' : 'Cập nhật'}
                </button>
              </div>
            </form>
>>>>>>> ngocle_new
          </div>
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
};


export default AppointmentManagement;


=======
});

export default AppointmentManagement;
>>>>>>> ngocle_new
