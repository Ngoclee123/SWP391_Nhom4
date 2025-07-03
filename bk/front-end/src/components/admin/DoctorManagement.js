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
    hospital: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [allCertificates, setAllCertificates] = useState([]);
  const navigate = useNavigate();

  // Fetch doctors from API
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await DoctorService.searchDoctors({});
      const apiDoctors = Array.isArray(res.content) ? res.content : (Array.isArray(res) ? res : []);
      setDoctors(apiDoctors.map(d => {
        // Log giá trị status thực tế để debug
        console.log('Doctor status from API:', d.status);
        return {
          id: d.id,
          imgs: d.imgs || '',
          name: d.fullName || d.name || '',
          specialty: d.specialtyName || d.specialty || '',
          phoneNumber: d.phoneNumber || '',
        dateOfBirth: d.dateOfBirth || '',
          locational: d.locational || '',
          education: d.education || d.degree || '',
          hospital: d.hospital || d.hospitalName || '',
          status: d.status || 'offline', // lấy đúng status từ BE, không ép về lowerCase nữa
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
      DoctorService.getDoctorEntityById(doctorId)
        .then(res => {
          const doctor = res;
          setSelectedDoctor(doctor);
          setFormData({
            name: doctor.fullName || '',
            specialty: doctor.specialty?.id || '',
            status: 'online',
            imgs: doctor.imgs || '',
            bio: doctor.bio || '',
            dateOfBirth: doctor.dateOfBirth || '',
            locational: doctor.locational || '',
            education: doctor.education || '',
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
    // Validate các trường bắt buộc
    if (!formData.name) {
      setError('Tên bác sĩ không được để trống!');
      return;
    }
    if (!formData.specialty) {
      setError('Bạn phải chọn chuyên khoa!');
      return;
    }
    if (!formData.imgs) {
      setError('Bạn phải upload ảnh đại diện!');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        fullName: formData.name,
        specialty: { id: Number(formData.specialty) },
        imgs: formData.imgs,
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth,
        locational: formData.locational,
        education: formData.education,
        hospital: formData.hospital,
        phoneNumber: formData.phoneNumber,
        status: formData.status,
      };
      let res;
      if (modalMode === 'create') {
        res = await DoctorService.createDoctor(payload);
        setSuccess('Thêm bác sĩ thành công!');
      } else if (modalMode === 'edit') {
        res = await DoctorService.updateDoctor(selectedDoctor.id, payload);
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
  }, [formData, modalMode, selectedDoctor, fetchDoctors]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Thêm hàm upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    try {
      const url = await DoctorService.uploadAvatar(formDataUpload);
      // Log giá trị url để debug
      console.log('Upload avatar response:', url);
      // Đảm bảo imgs là string, không phải mảng, không phải undefined
      let imgUrl = url;
      if (Array.isArray(url)) {
        imgUrl = url[0];
      } else if (typeof url === 'object' && url !== null && url.url) {
        imgUrl = url.url;
      }
      setFormData(prev => ({ ...prev, imgs: imgUrl }));
    } catch (err) {
      setError('Upload ảnh thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý bác sĩ</h2>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý đội ngũ bác sĩ</p>
        </div>
        <button
          onClick={handleAddDoctor}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bác sĩ</span>
        </button>
      </div>

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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trình độ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bệnh viện</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{doctor.id}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {doctor.imgs ? (
                    <img src={doctor.imgs.startsWith('http') ? doctor.imgs : `http://localhost:8080${doctor.imgs}`} alt={doctor.name} className="w-12 h-12 object-cover rounded-lg" onError={e => {e.target.onerror=null; e.target.src='/logo192.png'}} />
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
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{doctor.education}</td>
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
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
                  <label className="block text-sm font-medium text-gray-700">Ảnh đại diện (upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg"
                    required={modalMode === 'create'}
                  />
                  {formData.imgs && (
                    <img
                      src={formData.imgs.startsWith('http') ? formData.imgs : (formData.imgs.startsWith('/avatars/') ? `http://localhost:8080${formData.imgs}` : formData.imgs)}
                      alt="avatar"
                      className="mt-2 w-24 h-24 object-cover rounded-lg"
                      onError={e => {e.target.onerror=null; e.target.src='/logo192.png'}}
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

export default DoctorManagement;