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
    PatientService.getAllPatients(true)
      .then((res) => {
        // Map lại đúng các trường từ DTO trả về
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        setPatients(data.map(p => ({
          id: p.id,
          fullName: p.fullName,
          dateOfBirth: p.dateOfBirth,
          gender: p.gender,
          weight: p.weight,
          height: p.height,
          status: p.status
        })));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error);
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
    status: 'Chờ xác nhận'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 7;

  // Thay đổi filter: dùng filter giới tính thay vì trạng thái
  const [genderFilter, setGenderFilter] = useState('all');

  // Khi filter/search, chuyển đổi giới tính sang tiếng Việt
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      // Chuyển đổi giới tính sang tiếng Việt để so sánh
      const genderVi = patient.gender === 'Male' ? 'Nam' : patient.gender === 'Female' ? 'Nữ' : patient.gender;
      const matchesSearch = !searchTerm ||
        (patient.fullName && patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (genderVi && genderVi.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesGender = genderFilter === 'all' || genderVi === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [searchTerm, genderFilter, patients]);

  // Phân trang sau khi lọc
  const paginatedPatients = useMemo(() => {
    const startIdx = (currentPage - 1) * patientsPerPage;
    return filteredPatients.slice(startIdx, startIdx + patientsPerPage);
  }, [filteredPatients, currentPage]);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Khi search/filter đổi thì về trang 1
  useEffect(() => { setCurrentPage(1); }, [searchTerm, genderFilter]);

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
        status: patient.status || 'Chờ xác nhận'
      });
      setModalMode('edit');
      setIsModalOpen(true);
    } else if (action === 'delete') {
      PatientService.deletePatient(patientId, true)
        .then(() => {
          setPatients(patients.filter(p => p.id !== patientId));
        })
        .catch((error) => {
          console.error('Error deleting patient:', error);
          alert('Có lỗi xảy ra khi xóa bệnh nhân. Vui lòng thử lại.');
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
      status: 'Chờ xác nhận'
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
    PatientService.updatePatient(selectedPatient.id, submitData, true)
      .then((res) => {
        const data = res.data || res;
        if (data && data.id) {
          setPatients(patients.map(p =>
            p.id === selectedPatient.id ? data : p
          ));
          setIsModalOpen(false);
        } else {
          alert('Phản hồi từ máy chủ không đúng định dạng. Vui lòng thử lại.');
        }
      })
      .catch((error) => {
        console.error('Error updating patient:', error);
        alert('Có lỗi xảy ra khi cập nhật bệnh nhân. Vui lòng thử lại.');
      });
  }, [formData, patients, selectedPatient]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Hàm tạo mã định danh ngắn từ id
  function getShortId(id) {
    if (!id) return 'N/A';
    const str = String(id);
    return str.length > 7 ? str.slice(0, 7) : str.padStart(7, '0');
  }

  // Hàm tạo mã định danh cá nhân: 1 số giới tính (1: nam, 2: nữ) + 2 số cuối năm sinh + 3 số cuối id
  function getPersonalId(patient) {
    // Giới tính: 1 nam, 2 nữ
    let genderNum = '1';
    if (patient.gender) {
      genderNum = (patient.gender === 'Female' || patient.gender === 'Nữ') ? '2' : '1';
    }
    // Năm sinh (2 số cuối)
    let yearStr = '00';
    if (patient.dateOfBirth) {
      const year = new Date(patient.dateOfBirth).getFullYear();
      yearStr = String(year).slice(-2);
    }
    // 3 số cuối của id
    let idPart = '000';
    if (patient.id) {
      const idStr = String(patient.id).replace(/\D/g, '');
      idPart = idStr.slice(-3).padStart(3, '0');
    } else {
      idPart = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    }
    // Nếu thiếu thông tin cơ bản thì fallback về id ngắn
    if (!patient.dateOfBirth || !patient.gender) {
      return getShortId(patient.id);
    }
    return `${genderNum}${yearStr}${idPart}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý bệnh nhân</h2>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi thông tin bệnh nhân</p>
          <div className="mt-2 text-blue-700 font-semibold">Tổng số bệnh nhân: {patients.length}</div>
        </div>
        {/* Không có nút thêm bệnh nhân */}
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        onClear={clearFilters}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">BỆNH NHÂN</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">TUỔI</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">GIỚI TÍNH</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NGÀY SINH</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CÂN NẶNG (kg)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CHIỀU CAO (cm)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : paginatedPatients.map((patient) => {
                // Skip rendering if patient is null or undefined
                if (!patient) {
                  return null;
                }
                
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
                      <div className="font-semibold text-gray-900">{patient.fullName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">Mã định danh: #{getPersonalId(patient)}</div>
                    </td>
                    <td className="px-6 py-5 text-gray-900 font-medium">{age}</td>
                    <td className="px-6 py-5 text-gray-900">{patient.gender === 'Male' ? 'Nam' : patient.gender === 'Female' ? 'Nữ' : patient.gender || 'N/A'}</td>
                    <td className="px-6 py-5 text-gray-900">{patient.dateOfBirth || 'N/A'}</td>
                    <td className="px-6 py-5 text-gray-900">{patient.weight || ''}</td>
                    <td className="px-6 py-5 text-gray-900">{patient.height || ''}</td>
                    <td className="px-6 py-5">
                      {/* Không có nút xem chi tiết */}
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

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không tìm thấy bệnh nhân nào</p>
          <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Chỉnh sửa bệnh nhân
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
                {/* Bỏ trường trạng thái */}
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
                  Cập nhật
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