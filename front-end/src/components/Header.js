import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname + location.hash);

    const handleNavClick = (path, sectionId) => {
        setActiveLink(path + (sectionId ? `#${sectionId}` : ''));

        // Chuyển route nếu cần
        if (path !== location.pathname) {
            navigate(path + (sectionId ? `#${sectionId}` : ''));
        }

        // Cuộn về đầu trang khi nhấp vào "Trang chủ"
        if (path === '/home' && !sectionId) {
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100); // Delay để đảm bảo route đã chuyển xong
        }
        // Cuộn đến section cho các mục khác trong /home
        else if (path === '/home' && sectionId) {
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
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
                        <Link to="/home" onClick={() => handleNavClick('/home', '')}>
                            Baby Health Hub
                        </Link>
                    </div>
                </div>

                {/* Menu điều hướng */}
                <nav className="flex space-x-6">
                    <Link
                        to="/home"
                        className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
                            activeLink === '/home' || activeLink === '/home#' ? 'text-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', '')}
                    >
                        Trang chủ
                    </Link>
                    <Link
                        to="/home#services"
                        className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
                            activeLink === '/home#services' ? 'text-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', 'services')}
                    >
                        Dịch vụ
                    </Link>
                    <Link
                        to="/home#team"
                        className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
                            activeLink === '/home#team' ? 'text-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', 'team')}
                    >
                        Đội ngũ
                    </Link>
                    <Link
                        to="/home#news"
                        className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
                            activeLink === '/home#news' ? 'text-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', 'news')}
                    >
                        Tin tức
                    </Link>
                    <Link
                        to="/home#contact"
                        className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
                            activeLink === '/home#contact' ? 'text-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', 'contact')}
                    >
                        Liên hệ
                    </Link>
                    <Link
                        to="/search-doctors"
                        className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
                            activeLink === '/search-doctors' ? 'text-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/search-doctors', '')}
                    >
                        Doctors
                    </Link>
                    <Link
                        to="/profile"
                        className={`text-gray-700 hover:text-blue-600 hover:scale-110 transform transition duration-200 ${
                            activeLink === '/profile' ? 'text-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/profile', '')}
                    >
                        Profile
                    </Link>
                </nav>

                {/* Nút đăng nhập/đăng ký */}
                <div className="flex space-x-4">
                    <Link
                        to="/login"
                        className={`border-2 border-blue-300 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 hover:border-blue-400 hover:scale-105 transform transition duration-200 font-semibold ${
                            activeLink === '/login' ? 'bg-blue-100 border-blue-400' : ''
                        }`}
                        onClick={() => handleNavClick('/login', '')}
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        to="/register"
                        className={`bg-blue-300 text-white px-4 py-2 rounded-full hover:bg-blue-400 hover:scale-105 transform transition duration-200 font-semibold shadow-md ${
                            activeLink === '/register' ? 'bg-blue-400' : ''
                        }`}
                        onClick={() => handleNavClick('/register', '')}
                    >
                        Đăng ký
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;