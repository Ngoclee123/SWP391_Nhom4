import React, { useState, useCallback } from 'react';
import { Plus, Edit, Eye, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';

const MOCK_DATA = {
  doctors: [
    { id: 1, name: 'BS. Trần Hương', specialty: 'Nhi khoa', status: 'online', patients: 15, rating: 4.8, experience: 8 },
    { id: 2, name: 'BS. Nguyễn Đức', specialty: 'Dinh dưỡng', status: 'offline', patients: 12, rating: 4.9, experience: 12 },
    { id: 3, name: 'BS. Mai Lan', specialty: 'Tiêm chủng', status: 'online', patients: 8, rating: 4.7, experience: 6 },
    { id: 4, name: 'BS. Lê Minh', specialty: 'Tim mạch', status: 'busy', patients: 20, rating: 4.6, experience: 15 }
  ]
};

const DoctorManagement = React.memo(() => {
  const [doctors, setDoctors] = useState(MOCK_DATA.doctors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    status: 'online',
    patients: 0,
    rating: 0,
    experience: 0
  });

  const handleDoctorAction = useCallback((action, doctorId) => {
    if (action === 'view') {
      console.log('View doctor:', doctorId);
    } else if (action === 'edit') {
      const doctor = doctors.find(d => d.id === doctorId);
      setSelectedDoctor(doctor);
      setFormData({ ...doctor });
      setModalMode('edit');
      setIsModalOpen(true);
    } else if (action === 'delete') {
      setDoctors(doctors.filter(d => d.id !== doctorId));
    }
  }, [doctors]);

  const handleAddDoctor = useCallback(() => {
    setModalMode('create');
    setFormData({
      name: '',
      specialty: '',
      status: 'online',
      patients: 0,
      rating: 0,
      experience: 0
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newDoctor = {
        ...formData,
        id: doctors.length + 1,
        patients: Number(formData.patients),
        rating: Number(formData.rating),
        experience: Number(formData.experience)
      };
      setDoctors([...doctors, newDoctor]);
    } else if (modalMode === 'edit') {
      setDoctors(doctors.map(d =>
        d.id === selectedDoctor.id ? { ...formData, id: d.id, patients: Number(formData.patients), rating: Number(formData.rating), experience: Number(formData.experience) } : d
      ));
    }
    setIsModalOpen(false);
  }, [formData, modalMode, doctors, selectedDoctor]);

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
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
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