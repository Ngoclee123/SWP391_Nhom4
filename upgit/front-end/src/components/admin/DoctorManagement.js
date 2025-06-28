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
      setDoctors(apiDoctors.map(d => ({
        id: d.id,
        name: d.fullName || d.name || '',
        specialty: d.specialtyName || d.specialty || '',
        imgs: d.imgs || '',
      })));
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
    setLoading(true);
    setError('');
    try {
      if (!formData.imgs) {
        setError('Bạn phải upload ảnh đại diện!');
        setLoading(false);
        return;
      }
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
      if (modalMode === 'create') {
        await DoctorService.createDoctor(payload);
      } else if (modalMode === 'edit') {
        await DoctorService.updateDoctor(selectedDoctor.id, payload);
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      setError('Lưu bác sĩ thất bại');
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
      setFormData(prev => ({ ...prev, imgs: Array.isArray(url) ? url[0] : url }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {doctor.imgs ? (
                  <img src={doctor.imgs} alt={doctor.name} className="w-16 h-16 object-cover rounded-xl" />
                ) : (
                  <span className="text-white text-xl font-bold">
                    {doctor.name.split(' ').pop().charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                <p className="text-gray-600 mb-2">{doctor.specialty}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleDoctorAction('view', doctor.id)}
                className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 text-sm font-semibold transition-colors"
              >
                Xem chi tiết
              </button>
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
          </div>
        ))}
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
                    <img src={formData.imgs} alt="avatar" className="mt-2 w-24 h-24 object-cover rounded-lg" />
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