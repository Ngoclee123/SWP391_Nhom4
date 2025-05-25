import { useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [activeLink, setActiveLink] = useState('');

  const handleNavClick = (sectionId) => {
    setActiveLink(sectionId);
    if (sectionId === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo và tên */}
        <div className="flex items-center space-x-3">
          <img
            src="/images/Logo.jpg"
            alt="Baby Health Hub Logo"
            className="w-20 h-20 object-contain rounded-full"
          />
          <div className="text-xl font-bold text-blue-800">
            <Link to="/">Baby Health Hub</Link>
          </div>
        </div>

        {/* Menu điều hướng (chỉ hiển thị trên desktop) */}
        <nav className="flex space-x-6">
          <Link
            to="/home"
            className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
              activeLink === '' ? 'text-blue-600' : ''
            }`}
            onClick={() => handleNavClick('')}
          >
            Trang chủ
          </Link>
          <Link
            to="/#services"
            className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
              activeLink === 'services' ? 'text-blue-600' : ''
            }`}
            onClick={() => handleNavClick('services')}
          >
            Dịch vụ
          </Link>
          <Link
            to="/#team"
            className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
              activeLink === 'team' ? 'text-blue-600' : ''
            }`}
            onClick={() => handleNavClick('team')}
          >
            Đội ngũ
          </Link>
          <Link
            to="/#news"
            className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
              activeLink === 'news' ? 'text-blue-600' : ''
            }`}
            onClick={() => handleNavClick('news')}
          >
            Tin tức
          </Link>
          <Link
            to="/#contact"
            className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
              activeLink === 'contact' ? 'text-blue-600' : ''
            }`}
            onClick={() => handleNavClick('contact')}
          >
            Liên hệ
          </Link>
          <Link to="/search-doctors" className="hover:text-secondary"> Doctors</Link>
          <Link to="/profile" className="hover:text-secondary">Profile</Link>
        </nav>

        {/* Nút đăng nhập/đăng ký (chỉ hiển thị trên desktop) */}
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="border-2 border-blue-300 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 hover:border-blue-400 hover:scale-105 transform transition duration-200 font-semibold"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="bg-blue-300 text-white px-4 py-2 rounded-full hover:bg-blue-400 hover:scale-105 transform transition duration-200 font-semibold shadow-md"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;