import React, { useEffect, useState, useMemo } from 'react';
import userService from '../../service/userService';

const initialForm = {
  username: '',
  email: '',
  fullName: '',
  phoneNumber: '',
  address: '',
  status: true,
  role: '',
  password: '',
};

const ROLE_OPTIONS = [
  { value: '', label: 'Chọn vai trò' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
  { value: 'DOCTOR', label: 'Doctor' },
];

const ROLE_LABELS = {
  'ADMIN': 'Admin',
  'USER': 'User', 
  'DOCTOR': 'Doctor'
};

function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const accountsPerPage = 10;

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllAccounts();
      const accounts = Array.isArray(res) ? res : (res.data || res.content || []);
      setAccounts(accounts);
    } catch (err) {
      setError('Không thể tải danh sách tài khoản');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleEdit = (account) => {
    setEditingId(account.id);
    setForm({
      username: account.username || '',
      email: account.email || '',
      fullName: account.fullName || '',
      phoneNumber: account.phoneNumber || '',
      address: account.address || '',
      status: account.status,
      role: account.role?.rolename || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDisable = async (id) => {
    if (!window.confirm('Bạn có chắc muốn vô hiệu hóa tài khoản này?')) return;
    try {
      await userService.updateAccount(id, { status: false });
      fetchAccounts();
    } catch (err) {
      setError('Vô hiệu hóa tài khoản thất bại');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        ...form,
        passwordHash: form.password, // Đổi tên trường cho đúng backend
      };
      delete payload.password; // Xóa trường password cũ
      // Đảm bảo role là object { rolename: ... }
      if (typeof payload.role === 'string') {
        payload.role = { rolename: payload.role };
      }
      if (editingId) {
        await userService.updateAccount(editingId, payload);
      } else {
        if (!payload.passwordHash || payload.passwordHash.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          return;
        }
        await userService.createAccount(payload);
      }
      setForm(initialForm);
      setEditingId(null);
      setIsModalOpen(false); // Đóng modal sau khi submit
      fetchAccounts();
    } catch (err) {
      setError('Lưu tài khoản thất bại');
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsModalOpen(false); // Đóng modal khi hủy
    setError('');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAccounts = useMemo(() => {
    let result = accounts.filter(acc => {
      const matchesSearch =
        !search ||
        acc.username?.toLowerCase().includes(search.toLowerCase()) ||
        acc.email?.toLowerCase().includes(search.toLowerCase()) ||
        acc.fullName?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || acc.roleName === roleFilter;
      return matchesSearch && matchesRole;
    });
    if (sortField === 'roleName') {
      result = [...result].sort((a, b) => {
        const aValue = a.roleName || '';
        const bValue = b.roleName || '';
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [accounts, search, roleFilter, sortField, sortOrder]);

  // Phân trang sau khi lọc/sắp xếp
  const paginatedAccounts = useMemo(() => {
    const startIdx = (currentPage - 1) * accountsPerPage;
    return filteredAccounts.slice(startIdx, startIdx + accountsPerPage);
  }, [filteredAccounts, currentPage]);
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

  // Khi search/filter đổi thì về trang 1
  useEffect(() => { setCurrentPage(1); }, [search, roleFilter, sortField, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý tài khoản</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm tài khoản..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="DOCTOR">Doctor</option>
          </select>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
            onClick={() => {
              setForm(initialForm);
              setEditingId(null);
              setIsModalOpen(true); // Mở modal khi bấm "Thêm tài khoản"
            }}
          >
            <span>Thêm tài khoản</span>
          </button>
        </div>
      </div>

      {/* Modal thêm/sửa tài khoản */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Nhập username"
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên"
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="status"
                  checked={form.status}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-lg">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tài khoản</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thông tin</th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort('roleName')}
                  >
                    VAI TRÒ{' '}
                    {sortField === 'roleName' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedAccounts && paginatedAccounts.length > 0 ? paginatedAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{acc.username}</div>
                        <div className="text-sm text-gray-500">{acc.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{acc.fullName}</div>
                        <div className="text-sm text-gray-500">{acc.phoneNumber}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ROLE_LABELS[acc.roleName] || 'Không xác định'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        acc.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {acc.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(acc)}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg font-medium text-xs text-white transition-colors"
                        >
                          Sửa
                        </button>
                        {acc.status ? (
                          <button
                            onClick={() => handleDisable(acc.id)}
                            className="bg-gray-500 hover:bg-gray-600 px-3 py-1.5 rounded-lg font-medium text-xs text-white transition-colors"
                          >
                            Vô hiệu hóa
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await userService.updateAccount(acc.id, { status: true });
                                fetchAccounts();
                              } catch (err) {
                                setError('Kích hoạt tài khoản thất bại');
                              }
                            }}
                            className="bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg font-medium text-xs text-white transition-colors"
                          >
                            Kích hoạt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500 text-lg">
                      Không có tài khoản nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4 bg-gray-50 border-t border-gray-200">
              <button
                className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
      )}
    </div>
  );
}

export default AccountManagement;