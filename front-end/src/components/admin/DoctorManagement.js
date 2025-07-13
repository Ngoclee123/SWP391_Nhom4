import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Edit, Eye, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import DoctorService from '../../service/DoctorService';

const DoctorManagement = React.memo(() => {
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    status: 'online',
    patients: 0,
    rating: 0,
    experience: 0,
    certificates: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [allCertificates, setAllCertificates] = useState([]);

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
        status: d.availabilityStatus || 'online',
        patients: d.patients || 0,
        rating: d.rating || 0,
        experience: d.experience || 0
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
      console.log('View doctor:', doctorId);
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
            patients: 0,
            rating: 0,
            experience: 0,
            certificates: (doctor.certificates || []).map(c => c.id),
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
  }, [fetchDoctors, fetchSpecialties, fetchCertificates]);

  const handleAddDoctor = useCallback(() => {
    setModalMode('create');
    setFormData({
      name: '',
      specialty: '',
      status: 'online',
      patients: 0,
      rating: 0,
      experience: 0,
      certificates: [],
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
      // Map certificates về dạng object
      const certObjs = (formData.certificates || []).filter(c => c && c.trim()).map(c => ({ certificateName: c }));
      if (modalMode === 'create') {
        const payload = {
          fullName: formData.name,
          specialty: { id: Number(formData.specialty) },
          certificates: certObjs,
        };
        await DoctorService.createDoctor(payload);
      } else if (modalMode === 'edit') {
        const payload = {
          fullName: formData.name,
          specialty: { id: Number(formData.specialty) },
          certificates: certObjs,
        };
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">
                  {doctor.name.split(' ').pop().charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                <p className="text-gray-600 mb-2">{doctor.specialty}</p>
                <StatusBadge status={doctor.status} type="doctor" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{doctor.patients}</p>
                <p className="text-xs text-gray-600 font-medium">Bệnh nhân</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{doctor.rating}</p>
                <p className="text-xs text-gray-600 font-medium">Đánh giá</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{doctor.experience}</p>
                <p className="text-xs text-gray-600 font-medium">Năm KN</p>
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
                    <option value="busy">Bận rộn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số bệnh nhân</label>
                  <input
                    type="number"
                    name="patients"
                    value={formData.patients}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Đánh giá</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Năm kinh nghiệm</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chứng chỉ</label>
                  {(formData.certificates || []).map((cert, idx) => (
                    <div key={idx} className="flex items-center mb-2">
                      <select
                        value={cert}
                        onChange={e => handleCertificateChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn chứng chỉ</option>
                        {allCertificates.map(c => (
                          <option key={c.id} value={c.id}>{c.certificateName}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => handleRemoveCertificate(idx)} className="ml-2 text-red-500 hover:text-red-700">X</button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddCertificate} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Thêm chứng chỉ</button>
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