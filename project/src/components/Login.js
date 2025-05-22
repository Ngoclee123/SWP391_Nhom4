import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone === '0901234567' && password === 'password123') {
      setError('');
      console.log('Đăng nhập thành công:', { phone, password });
      navigate('/');
    } else {
      setError('Số điện thoại hoặc mật khẩu không đúng!');
    }
  };

  const isFormValid = phone.trim() !== '' && password.trim() !== '';

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 pt-20 relative"
    >
      {/* Bên trái là ảnh trang trí (thay vì QR code + text) */}
      <div className="hidden md:flex w-1/2 justify-center items-center">
        <img
          src="/images/doctor.jpg" // <== Thay bằng ảnh bạn upload
        //   alt="Đặt khám dễ dàng hơn"
          className="w-[400px] max-w-full h-auto rounded-xl shadow-lg"
        />
      </div>

      {/* Form đăng nhập */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Đăng nhập</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Nhập số điện thoại của bạn"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2 rounded-lg font-semibold text-white transition duration-300 ${
                isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={!isFormValid}
            >
              Đăng nhập
            </button>
          </form>
          <div className="mt-4 text-center text-gray-600">
            <a href="#" className="text-blue-600 hover:underline">Quên mật khẩu?</a>
          </div>
          <p className="mt-2 text-center text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
          <div className="mt-4 text-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
