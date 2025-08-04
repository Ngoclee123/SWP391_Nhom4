import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import UserService from '../service/userService';
import NotificationBell from './NotificationBell';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname + location.hash);
    const [isLoggedIn, setIsLoggedIn] = useState(UserService.isLoggedIn());
    const [fullName, setFullName] = useState(UserService.getFullName() || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setIsLoggedIn(UserService.isLoggedIn());
        setFullName(UserService.getFullName() || '');
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNavClick = (path, sectionId) => {
        setActiveLink(path + (sectionId ? `#${sectionId}` : ''));
        if (path !== location.pathname) {
            navigate(path + (sectionId ? `#${sectionId}` : ''));
        }
        if (path === '/home' && !sectionId) {
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        } else if (path === '/home' && sectionId) {
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const handleLogout = () => {
        UserService.removeUser();
        setIsLoggedIn(false);
        setFullName('');
        setIsDropdownOpen(false);
        navigate('/login');
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsDropdownOpen(false);
    };

    const handleChangePassword = () => {
        const accountId = UserService.getAccountId();
        console.log('Navigating to Change Password with accountId:', accountId); // Debug
        if (accountId) {
            navigate(`/change-password/${accountId}`);
        } else {
            console.warn('No accountId found, navigating to /change-password');
            navigate('/change-password');
        }
        setIsDropdownOpen(false);
    };

    return (
        <header className="bg-white shadow-lg fixed w-full top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <img
                        src="/images/Logo.jpg"
                        alt="Baby Health Hub Logo"
                        className="w-16 h-16 object-contain rounded-full shadow-md transform hover:scale-105 transition duration-300"
                    />
                    <div className="text-2xl font-bold text-blue-800 tracking-wide">
                        <Link to="/home" onClick={() => handleNavClick('/home', '')}>
                            Baby Health Hub
                        </Link>
                    </div>
                </div>

                <nav className="flex space-x-8">
                    <Link
                        to="/home"
                        className={`text-gray-700 font-medium hover:text-blue-600 transform hover:scale-105 transition duration-300 ${
                            activeLink === '/home' || activeLink === '/home#' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', '')}
                    >
                        Trang chủ
                    </Link>
                    <Link
                        to="/home#services"
                        className={`text-gray-700 font-medium hover:text-blue-600 transform hover:scale-105 transition duration-300 ${
                            activeLink === '/home#services' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', 'services')}
                    >
                        Dịch vụ
                    </Link>
                    <Link
                        to="/home#team"
                        className={`text-gray-700 font-medium hover:text-blue-600 transform hover:scale-105 transition duration-300 ${
                            activeLink === '/home#team' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', 'team')}
                    >
                        Đội ngũ
                    </Link>
                    <Link
                        to="/home#news"
                        className={`text-gray-700 font-medium hover:text-blue-600 transform hover:scale-105 transition duration-300 ${
                            activeLink === '/home#news' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', 'news')}
                    >
                        Tin tức
                    </Link>
                    <Link
                        to="/home#contact"
                        className={`text-gray-700 font-medium hover:text-blue-600 transform hover:scale-105 transition duration-300 ${
                            activeLink === '/home#contact' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/home', 'contact')}
                    >
                        Liên hệ
                    </Link>
                    <Link
                        to="/search-doctors"
                        className={`text-gray-700 font-medium hover:text-blue-600 transform hover:scale-105 transition duration-300 ${
                            activeLink === '/search-doctors' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/search-doctors', '')}
                    >
                        Doctors
                    </Link>
                    <Link
                        to="/vaccines"
                        className={`text-gray-700 font-medium hover:text-blue-600 transform hover:scale-105 transition duration-300 ${
                            activeLink === '/vaccines' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                        }`}
                        onClick={() => handleNavClick('/vaccines', '')}
                    >
                        Vaccine
                    </Link>
                </nav>

                <div className="flex items-center space-x-4">
                    {isLoggedIn && (
                        <NotificationBell />
                    )}
                    
                    {isLoggedIn ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition duration-300 shadow-md transform hover:scale-105 focus:outline-none"
                            >
                                <span className="text-xl">{fullName ? fullName.charAt(0) : 'U'}</span>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-gray-800 font-semibold">{fullName || 'Người dùng'}</p>
                                        <p className="text-sm text-gray-500">Đã đăng nhập</p>
                                    </div>
                                    <button
                                        onClick={handleProfileClick}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                                    >
                                        Xem Hồ Sơ
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                                    >
                                        Thay Đổi Mật Khẩu
                                    </button>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); window.location.href = '/vaccine-history'; }}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                                    >
                                        Lịch sử đặt vaccin
                                    </button>
                                    <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/appointment-history");
                    }} // Sửa bằng navigate
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                  >
                    Lịch sử đặt lịch
                  </button>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); navigate('/patients'); }}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                                    >
                                        Quản lý bé
                                    </button>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); navigate('/add-patient', { state: { fromHome: true } }); }}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                                    >
                                        Thêm bé
                                    </button>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); navigate('/notifications'); }}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                                    >
                                        Thông báo
                                    </button>


                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition duration-200"
                                    >
                                        Đăng Xuất
                                    </button>

                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`border-2 border-blue-400 text-blue-600 px-5 py-2 rounded-full hover:bg-blue-50 hover:border-blue-500 hover:scale-105 transform transition duration-300 font-semibold shadow-sm ${
                                    activeLink === '/login' ? 'bg-blue-50 border-blue-500' : ''
                                }`}
                                onClick={() => handleNavClick('/login', '')}
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className={`bg-blue-400 text-white px-5 py-2 rounded-full hover:bg-blue-500 hover:scale-105 transform transition duration-300 font-semibold shadow-md ${
                                    activeLink === '/register' ? 'bg-blue-500' : ''
                                }`}
                                onClick={() => handleNavClick('/register', '')}
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>     
        </header>
        
    );
}

export default Header;