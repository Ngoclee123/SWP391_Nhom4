import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (name.trim() === '') {
      setError('Vui lòng nhập họ tên!');
      return;
    }
    // Giả lập đăng ký thành công
    console.log('Đăng ký thành công:', { name, email, password });
    setError('');
    navigate('/login');
  };

  const isFormValid = name.trim() !== '' && email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 pt-20 relative">
      {/* Bên trái là ảnh trang trí với phong cách khác */}
      <div className="hidden md:flex w-1/2 justify-center items-center">
        <img
          src="/images/Logo.jpg"
          alt="Tham gia ngay hôm nay"
          className="w-[450px] max-w-full h-auto rounded-full shadow-xl transform hover:scale-105 transition duration-300"
        />
      </div>

      {/* Form đăng ký */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border-t-4 border-blue-500">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-8 text-center">Tạo tài khoản</h2>
          {error && <p className="text-red-600 text-center mb-6 font-medium">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-800 font-semibold mb-2">
                Họ tên
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Nhập họ tên của bạn"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-800 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Nhập email của bạn"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-800 font-semibold mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-800 font-semibold mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Xác nhận mật khẩu"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 ${
                isFormValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!isFormValid}
            >
              Đăng ký
            </button>
          </form>
          <p className="mt-6 text-center text-gray-700">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-700 hover:underline font-semibold">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;