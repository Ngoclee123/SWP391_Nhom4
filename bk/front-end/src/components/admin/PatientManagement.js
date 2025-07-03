import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Download, Plus, Eye, Edit, Trash2, AlertCircle, X } from 'lucide-react';
import SearchAndFilter from './SearchAndFilter';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import useSearch from './useSearch';

import PatientService from '../../service/PatientService';

const PatientManagement = React.memo(() => {
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, clearFilters } = useSearch();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch patients from backend
  useEffect(() => {
    setLoading(true);
    // Nếu là trang admin thì lấy toàn bộ bệnh nhân
    PatientService.getAllPatients(true)
      .then((res) => {
        setPatients(res || []);
        setLoading(false);
      })
      .catch(() => {
        setPatients([]);
        setLoading(false);
      });
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    weight: '',
    height: '',
    medicalConditions: ''
  });

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = !searchTerm ||
        (patient.fullName && patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
      // Nếu có status thì filter, nếu không thì luôn true
      const matchesStatus = statusFilter === 'all' || (patient.status ? patient.status === statusFilter : true);
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, patients]);

  const handleAction = useCallback((action, patientId) => {
    if (action === 'view') {
      // Optionally implement view details popup
    } else if (action === 'edit') {
      const patient = patients.find(p => p.id === patientId);
      setSelectedPatient(patient);
      setFormData({
        fullName: patient.fullName || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || 'Male',
        weight: patient.weight || '',
        height: patient.height || '',
        medicalConditions: patient.medicalConditions || ''
      });
      setModalMode('edit');
      setIsModalOpen(true);
    } else if (action === 'delete') {
      PatientService.deletePatient(patientId)
        .then(() => {
          setPatients(patients.filter(p => p.id !== patientId));
        });
    }
  }, [patients]);

  const handleAddPatient = useCallback(() => {
    setModalMode('create');
    setFormData({
      fullName: '',
      dateOfBirth: '',
      gender: 'Male',
      weight: '',
      height: '',
      medicalConditions: ''
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      weight: formData.weight === '' ? null : parseFloat(formData.weight),
      height: formData.height === '' ? null : parseFloat(formData.height)
    };
    if (modalMode === 'create') {
      PatientService.addPatient(submitData)
        .then((res) => {
          setPatients([...patients, res.data]);
          setIsModalOpen(false);
        });
    } else if (modalMode === 'edit') {
      PatientService.updatePatient(selectedPatient.id, submitData)
        .then((res) => {
          setPatients(patients.map(p =>
            p.id === selectedPatient.id ? res.data : p
          ));
          setIsModalOpen(false);
        });
    }
  }, [formData, modalMode, patients, selectedPatient]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý bệnh nhân</h2>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi thông tin bệnh nhân</p>
          <div className="mt-2 text-blue-700 font-semibold">Tổng số bệnh nhân: {patients.length}</div>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={handleAddPatient}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bệnh nhân</span>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tuổi</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Giới tính</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lần khám cuối</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Liên hệ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredPatients.map((patient) => {
                // Tính tuổi từ ngày sinh
                let age = '';
                if (patient.dateOfBirth) {
                  const dob = new Date(patient.dateOfBirth);
                  const now = new Date();
                  age = now.getFullYear() - dob.getFullYear();
                  const m = now.getMonth() - dob.getMonth();
                  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
                }
                return (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-900">{patient.fullName}</div>
                      <div className="text-sm text-gray-500">ID: #{patient.id}</div>
                    </td>
                    <td className="px-6 py-5 text-gray-900 font-medium">{age}</td>
                    <td className="px-6 py-5 text-gray-900">{patient.gender}</td>
                    <td className="px-6 py-5 text-gray-900">{patient.dateOfBirth}</td>
                    <td className="px-6 py-5 text-gray-900">{patient.weight || ''}kg / {patient.height || ''}cm</td>
                    <td className="px-6 py-5 text-gray-900">{patient.medicalConditions || ''}</td>
                    <td className="px-6 py-5">
                      <ActionButton
                        icon={Eye}
                        onClick={() => handleAction('view', patient.id)}
                        color="blue"
                        tooltip="Xem chi tiết"
                      />
                      <ActionButton
                        icon={Edit}
                        onClick={() => handleAction('edit', patient.id)}
                        color="green"
                        tooltip="Chỉnh sửa"
                      />
                      <ActionButton
                        icon={Trash2}
                        onClick={() => handleAction('delete', patient.id)}
                        color="red"
                        tooltip="Xóa"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy bệnh nhân nào</p>
            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Thêm bệnh nhân' : 'Chỉnh sửa bệnh nhân'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ tên bệnh nhân</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cân nặng (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chiều cao (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tình trạng bệnh lý</label>
                  <input
                    type="text"
                    name="medicalConditions"
                    value={formData.medicalConditions}
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

export default PatientManagement;