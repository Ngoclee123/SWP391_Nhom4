import { useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-800">
          <Link to="/">Baby Health Hub</Link>
        </div>

        {/* Menu điều hướng (ẩn trên mobile, hiện trên desktop) */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Trang chủ</Link>
          <Link to="/#services" className="text-gray-700 hover:text-blue-600">Dịch vụ</Link>
          <Link to="/#team" className="text-gray-700 hover:text-blue-600">Đội ngũ</Link>
          <Link to="/#news" className="text-gray-700 hover:text-blue-600">Tin tức</Link>
          <Link to="/#contact" className="text-gray-700 hover:text-blue-600">Liên hệ</Link>
        </nav>

        {/* Nút đăng nhập/đăng ký và toggle menu cho mobile */}
        <div className="flex items-center space-x-4">
          {/* Nút đăng nhập và đăng ký (hiện trên desktop, ẩn trên mobile) */}
          <div className="hidden md:flex space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Đăng nhập</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300">
              Đăng ký
            </Link>
          </div>

          {/* Toggle menu cho mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile (hiện khi toggle) */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <nav className="flex flex-col space-y-2 px-4 py-2">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Trang chủ</Link>
            <Link to="/#services" className="text-gray-700 hover:text-blue-600">Dịch vụ</Link>
            <Link to="/#team" className="text-gray-700 hover:text-blue-600">Đội ngũ</Link>
            <Link to="/#news" className="text-gray-700 hover:text-blue-600">Tin tức</Link>
            <Link to="/#contact" className="text-gray-700 hover:text-blue-600">Liên hệ</Link>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Đăng nhập</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 mt-2">
              Đăng ký
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;