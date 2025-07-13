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

function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Thêm state cho modal

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllAccounts();
      // Đảm bảo luôn lấy đúng mảng account
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
      role: account.role?.name || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    try {
      await userService.deleteAccount(id);
      fetchAccounts();
    } catch (err) {
      setError('Xóa tài khoản thất bại');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        passwordHash: form.password, // Đổi tên trường cho đúng backend
      };
      delete payload.password; // Xóa trường password cũ
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

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchesSearch =
        !search ||
        acc.username?.toLowerCase().includes(search.toLowerCase()) ||
        acc.email?.toLowerCase().includes(search.toLowerCase()) ||
        acc.fullName?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || (acc.role && acc.role.name === roleFilter);
      return matchesSearch && matchesRole;
    });
  }, [accounts, search, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý tài khoản</h2>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi tất cả tài khoản người dùng</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, username..."
            className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full sm:w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-lg"
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
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-lg">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Họ tên</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số điện thoại</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAccounts && filteredAccounts.length > 0 ? filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 font-medium text-gray-900">{acc.username}</td>
                    <td className="px-6 py-5 font-medium text-gray-900">{acc.email}</td>
                    <td className="px-6 py-5 font-medium text-gray-900">{acc.role?.rolename || 'Không xác định'}</td>
                    <td className="px-6 py-5 font-medium text-gray-900">{acc.fullName}</td>
                    <td className="px-6 py-5 font-medium text-gray-900">{acc.phoneNumber}</td>
                    <td className="px-6 py-5 font-medium text-gray-900">{acc.address}</td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${acc.status ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {acc.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(acc)}
                          className="bg-yellow-400 hover:bg-yellow-500 px-2 py-1 rounded font-semibold text-xs text-white"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded font-semibold text-xs text-white"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-500 text-lg">
                      Không có tài khoản nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-500">{error}</div>
      )}
    </div>
  );
}

export default AccountManagement;