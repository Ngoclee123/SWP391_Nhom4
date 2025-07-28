import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Edit, Eye, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import DoctorService from '../../service/DoctorService';
import { useNavigate } from 'react-router-dom';

const DoctorManagement = React.memo(() => {
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    status: 'online',
    imgs: '',
    bio: '',
    dateOfBirth: '',
    locational: '',
    education: '',
    certificates: [''],
    hospital: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [allCertificates, setAllCertificates] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 7;
  const [uploading, setUploading] = useState(false); // Thêm state để track upload

  // Fetch doctors from API
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await DoctorService.getAllDoctors();
      console.log('Full response from getAllDoctors:', res);
      const apiDoctors = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      console.log('Processed apiDoctors:', apiDoctors);
      setDoctors(apiDoctors.map(d => {
        // Log giá trị thực tế để debug
        console.log('Doctor data from API:', d);
        console.log('Doctor status from API:', d.status);
        console.log('Doctor dateOfBirth from API:', d.dateOfBirth);
        console.log('Doctor hospital from API:', d.hospital);
        
        return {
          id: d.id,
          imgs: d.imgs || '',
          name: d.fullName || d.name || '',
          specialty: d.specialtyName || d.specialty || '',
          phoneNumber: d.phoneNumber || '',
          dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth).toLocaleDateString('vi-VN') : '',
          locational: d.locational || '',
          education: d.education || d.degree || '',
          hospital: d.hospital || d.hospitalName || '',
          status: d.status || 'offline',
        };
      }));
    } catch (err) {
      setError('Không thể tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specialties from API
  const fetchSpecialties = useCallback(async () => {
    try {
      const res = await DoctorService.getAllSpecialties();
      setSpecialties(Array.isArray(res) ? res : []);
    } catch (err) {
      setSpecialties([]);
    }
  }, []);

  // Fetch all certificates from API
  const fetchCertificates = useCallback(async () => {
    if (DoctorService.getAllCertificates) {
      try {
        const res = await DoctorService.getAllCertificates();
        setAllCertificates(Array.isArray(res) ? res : []);
      } catch (err) {
        setAllCertificates([]);
      }
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
    fetchCertificates();
  }, [fetchDoctors, fetchSpecialties, fetchCertificates]);

  const handleDoctorAction = useCallback((action, doctorId) => {
    if (action === 'view') {
      navigate(`/admin/doctors/${doctorId}`);
    } else if (action === 'edit') {
      setLoading(true);
      Promise.all([
        DoctorService.getDoctorEntityById(doctorId),
        DoctorService.getAdminCertificatesByDoctorId(doctorId)
      ])
      .then(([res, certificates]) => {
        const doctor = res.data;
        setSelectedDoctor(doctor);
        setFormData({
          id: doctor.id, // Lưu id vào formData để submit không bị undefined
          name: doctor.fullName || '',
          specialty: doctor.specialtyId || '',
          status: doctor.status || 'online',
          imgs: doctor.imgs || '',
          bio: doctor.bio || '',
          dateOfBirth: doctor.dateOfBirth || '',
          locational: doctor.locational || '',
          education: doctor.education || '',
          certificates: Array.isArray(certificates) ? certificates : [],
          hospital: doctor.hospital || '',
          phoneNumber: doctor.phoneNumber || '',
        });
        fetchSpecialties();
        fetchCertificates();
        setModalMode('edit');
        setIsModalOpen(true);
      })
      .finally(() => setLoading(false));
    } else if (action === 'delete') {
      if (window.confirm('Bạn có chắc muốn xóa bác sĩ này?')) {
        setLoading(true);
        setError('');
        DoctorService.deleteDoctor(doctorId)
          .then(() => fetchDoctors())
          .catch(() => setError('Xóa bác sĩ thất bại'))
          .finally(() => setLoading(false));
      }
    }
  }, [fetchDoctors, fetchSpecialties, fetchCertificates, navigate]);

  const handleAddDoctor = useCallback(() => {
    setModalMode('create');
    setFormData({
      name: '',
      specialty: '',
      status: 'online',
      imgs: '',
      bio: '',
      dateOfBirth: '',
      locational: '',
      education: '',
      certificates: [''],
      hospital: '',
      phoneNumber: '',
    });
    fetchSpecialties();
    fetchCertificates();
    setIsModalOpen(true);
  }, [fetchSpecialties, fetchCertificates]);

  const handleCertificateChange = (index, value) => {
    setFormData(prev => {
      const newCerts = [...(prev.certificates || [])];
      newCerts[index] = value;
      return { ...prev, certificates: newCerts };
    });
  };

  const handleAddCertificate = () => {
    setFormData(prev => ({ ...prev, certificates: [...(prev.certificates || []), ''] }));
  };

  const handleRemoveCertificate = (index) => {
    setFormData(prev => {
      const newCerts = [...(prev.certificates || [])];
      newCerts.splice(index, 1);
      return { ...prev, certificates: newCerts };
    });
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Không cho phép submit khi đang upload
    if (uploading) {
      setError('Vui lòng đợi upload ảnh hoàn tất!');
      return;
    }
    
    // Validate các trường bắt buộc
    if (!formData.name) {
      setError('Tên bác sĩ không được để trống!');
      return;
    }
    if (!formData.specialty) {
      setError('Bạn phải chọn chuyên khoa!');
      return;
    }
    // Chỉ validate ảnh khi tạo mới, không validate khi edit
    if (modalMode === 'create' && !formData.imgs) {
      setError('Bạn phải upload ảnh đại diện!');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        id: formData.id, // luôn gửi id khi update
        fullName: formData.name,
        specialtyId: Number(formData.specialty),
        imgs: typeof formData.imgs === 'string' ? formData.imgs : (formData.imgs && formData.imgs.data ? formData.imgs.data : ''),
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth,
        locational: formData.locational,
        education: formData.education,
        certificates: formData.certificates.filter(c => c && c.trim() !== ''),
        hospital: formData.hospital,
        phoneNumber: formData.phoneNumber,
        status: formData.status,
        // Xóa accountId để backend tự xử lý
      };
      let res;
      if (modalMode === 'create') {
        res = await DoctorService.createDoctor(payload);
        setSuccess('Thêm bác sĩ thành công!');
      } else if (modalMode === 'edit') {
        if (!formData.id || isNaN(Number(formData.id))) {
          setError('Không xác định được ID bác sĩ để cập nhật!');
          setLoading(false);
          return;
        }
        res = await DoctorService.updateDoctor(formData.id, payload);
        setSuccess('Cập nhật bác sĩ thành công!');
      }
      console.log('Doctor API response:', res);
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      console.error('Doctor API error:', err);
      setError(err?.response?.data?.message || err?.message || 'Lưu bác sĩ thất bại');
    } finally {
      setLoading(false);
    }
  }, [formData, modalMode, selectedDoctor, fetchDoctors, uploading]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Thêm hàm upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Clear error trước khi upload
    setError('');
    setUploading(true);
    
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    try {
      const response = await DoctorService.uploadAvatar(formDataUpload);
      console.log('Upload response:', response);
      
      // Xử lý response một cách an toàn
      let url = response;
      if (response && typeof response === 'object') {
        if (response.data && typeof response.data === 'string') {
          url = response.data;
        } else if (response.url && typeof response.url === 'string') {
          url = response.url;
        } else if (Array.isArray(response) && typeof response[0] === 'string') {
          url = response[0];
        } else {
          // Nếu không parse được, thử lấy response trực tiếp
          url = response.toString();
        }
      }
      
      if (url && typeof url === 'string') {
        setFormData(prev => ({ ...prev, imgs: url }));
        console.log('Avatar URL set:', url);
      } else {
        throw new Error('Invalid response format from upload API');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload ảnh thất bại: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setUploading(false);
    }
  };

  // Thêm filter search và status cho danh sách bác sĩ
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchTerm ||
      (doctor.name && doctor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.id && doctor.id.toString().includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Phân trang sau khi lọc
  const paginatedDoctors = React.useMemo(() => {
    const startIdx = (currentPage - 1) * doctorsPerPage;
    return filteredDoctors.slice(startIdx, startIdx + doctorsPerPage);
  }, [filteredDoctors, currentPage]);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  // Khi search/filter đổi thì về trang 1
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  return (
    <div className="p-6">
      {/* Nút Thêm bác sĩ - bên phải */}
      {/* <div className="flex justify-end mb-4">
        <button
          onClick={handleAddDoctor}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Thêm bác sĩ
        </button>
      </div> */}
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, chuyên khoa hoặc ID..."
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
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>
      {/* Table hiển thị danh sách bác sĩ dùng filteredDoctors thay vì doctors */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ảnh</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Họ tên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chuyên khoa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SĐT</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày sinh</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Địa chỉ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bệnh viện</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedDoctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{doctor.id}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {doctor.imgs && typeof doctor.imgs === 'string' ? (
                    <img
                      src={
                        doctor.imgs.startsWith('http')
                          ? doctor.imgs
                          : doctor.imgs.startsWith('/avatars/')
                            ? `http://localhost:8080${doctor.imgs}`
                            : doctor.imgs
                      }
                      alt={doctor.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={e => { e.target.onerror = null; e.target.src = '/logo192.png'; }}
                    />
                  ) : (
                    <span className="inline-block w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold">
                      {doctor.name.split(' ').pop().charAt(0)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{doctor.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.specialty}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.phoneNumber}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.dateOfBirth}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.locational}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.hospital}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${doctor.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {doctor.status === 'online' ? 'Trực tuyến' : 'Ngoại tuyến'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <ActionButton
                      icon={Edit}
                      onClick={() => handleDoctorAction('edit', doctor.id)}
                      color="green"
                      tooltip="Chỉnh sửa"
                    />
                    <ActionButton
                      icon={X}
                      onClick={() => handleDoctorAction('delete', doctor.id)}
                      color="red"
                      tooltip="Xóa"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Thêm bác sĩ' : 'Chỉnh sửa bác sĩ'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">{error}</div>
              )}
            {/* Popup thành công ngoài modal */}
            {success && !isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                <div className="bg-white p-6 rounded shadow text-center">
                  <div className="mb-4 text-green-700 font-bold">{success}</div>
                  <button onClick={() => setSuccess('')} className="px-4 py-2 bg-blue-600 text-white rounded">OK</button>
                </div>
              </div>
            )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên bác sĩ</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chuyên khoa</label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn chuyên khoa</option>
                    {specialties.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="online">Trực tuyến</option>
                    <option value="offline">Ngoại tuyến</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ảnh đại diện {uploading && <span className="text-blue-500">(Đang upload...)</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg"
                    required={modalMode === 'create'}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="mt-2 text-blue-500 text-sm">Đang upload ảnh...</div>
                  )}
                  {formData.imgs && typeof formData.imgs === 'string' && (
                    <img
                      src={
                        formData.imgs.startsWith('http')
                          ? formData.imgs
                          : formData.imgs.startsWith('/avatars/')
                            ? `http://localhost:8080${formData.imgs}`
                            : formData.imgs
                      }
                      alt="avatar"
                      className="mt-2 w-24 h-24 object-cover rounded-lg"
                      onError={e => { e.target.onerror = null; e.target.src = '/logo192.png'; }}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiểu sử</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                  <input
                    type="text"
                    name="locational"
                    value={formData.locational}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Học vấn</label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chứng chỉ (Certificates)</label>
                  {formData.certificates && formData.certificates.map((cert, idx) => (
                    <div key={idx} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={cert}
                        onChange={e => handleCertificateChange(idx, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Chứng chỉ #${idx + 1}`}
                      />
                      <button type="button" onClick={() => handleRemoveCertificate(idx)} className="text-red-500 hover:text-red-700"><X size={18} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddCertificate} className="mt-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">+ Thêm chứng chỉ</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bệnh viện</label>
                  <input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
                  disabled={loading || uploading}
                  className={`px-4 py-2 rounded-lg ${
                    loading || uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {loading ? 'Đang xử lý...' : uploading ? 'Đang upload...' : (modalMode === 'create' ? 'Thêm' : 'Cập nhật')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default DoctorManagement;