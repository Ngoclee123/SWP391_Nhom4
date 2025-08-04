import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import ProfileForm from './components/ProfileForm';
import DoctorSearch from './components/search/DoctorSearch';
import AppointmentForm from './components/booking/AppointmentForm';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Team from './components/Team';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Register from './components/regiters/Register';
import HealthNewsWebsite, { ArticleDetail } from './components/new/NewHeath';
import AdminDashboards from './components/admin/AdminDashboard';
import LoadingAnimation from './components/LoadingAnimation';
import NotificationsPage from './components/NotificationsPage';
import SendNotification from './components/admin/SendNotification';

import DoctorDetail from "./components/booking/DoctorDetail";

import Login from './components/login/Login';
import ChangePassword from './components/ChangePassword';
import VaccineAppointment from './components/vacin/VaccineAppointment';
import VaccinesList from './components/vacin/VaccinesList';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AddPatientPage from './components/vacin/AddPatientPage';
import PatientListPage from './components/vacin/PatientListPage';
import { handleOAuthRedirect } from './api/axiosClient'; // Import hàm từ axiosClient
import ConfirmationPage from './components/vacin/ConfirmationPage';
import VaccineHistory from './components/vacin/VaccineHistory';
import PaymentPage from './components/vnpVaccin/PaymentPage';
import UserService from './service/userService';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import ChatButton from './components/ChatButton';
import VaccineDetail from './components/vacin/VaccineDetail';
import AppointmentHistory from './components/booking/AppointmentHistory';
import { Toaster } from 'react-hot-toast';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: { fontSize: '1rem', borderRadius: '0.75rem' },
        duration: 3500,
      }} />
      {loading && <LoadingAnimation />}
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const isDoctorRoute = window.location.pathname.startsWith('/doctor-dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  // Handle route changes with loading animation
  useEffect(() => {
    const handleRouteChange = () => {
      setPageLoading(true);
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 800); // Short loading time for page transitions
      return () => clearTimeout(timer);
    };

    // Initial load
    handleRouteChange();

    // Listen for location changes
    return () => handleRouteChange();
  }, [location.pathname, location.search]);

  // Auto-redirect nếu là admin và không ở trang admin-dashboard
  useEffect(() => {
    const isAdmin = UserService.isLoggedIn() && UserService.getRole().toUpperCase() === 'ADMIN';
    const adminPath = '/admin-dashboard';
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (
      isAdmin &&
      location.pathname !== adminPath &&
      !publicPaths.includes(location.pathname)
    ) {
      navigate(adminPath, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if ((location.pathname === '/home' || location.pathname === '/') && location.search) {
      handleOAuthRedirect();
    }
  }, [location]);

  // Auto-redirect về dashboard đúng với role nếu đã đăng nhập mà đang ở /home hoặc /
  useEffect(() => {
    const isLoggedIn = UserService.isLoggedIn();
    const role = UserService.getRole()?.toUpperCase();
    if (
      isLoggedIn &&
      role === 'DOCTOR' &&
      (location.pathname === '/home' || location.pathname === '/')
    ) {
      navigate('/doctor-dashboard', { replace: true });
    }
    if (
      isLoggedIn &&
      role === 'ADMIN' &&
      (location.pathname === '/home' || location.pathname === '/')
    ) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [location, navigate]);

  return (
    <>
      {pageLoading && <LoadingAnimation />}
      <Routes>
          <Route path="/doctor-dashboard" element={<DoctorDashboard/>} /> {/* Add DoctorDashboard route */}
          <Route path="/doctor-dashboard/send-notification" element={<SendNotification/>} />
          <Route path="/doctor-dashboard/notifications" element={<DoctorDashboard/>} />

        {/* Route riêng cho admin-dashboard, không bọc layout chung */}
        <Route path="/admin-dashboard" element={<AdminDashboards />} />
        <Route path="/admin-dashboard/send-notification" element={<SendNotification />} />
        {/* Các route còn lại dùng layout chung */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col bg-gray-100">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/news/article/:id" element={<ArticleDetail />} />
                  <Route path="/vaccines" element={<VaccinesList />} />
                  <Route path="/vaccines/:vaccineId" element={<VaccineAppointment />} />
                  <Route path="/add-patient" element={<AddPatientPage />} />
                  <Route path="/patients" element={<PatientListPage />} />
                  <Route path="/home" element={<Home onOpenModal={() => setIsModalOpen(true)} />} />
                  <Route path="/search-doctors" element={<DoctorSearch />} />
                  <Route path="/book-appointment" element={<AppointmentForm />} />
                  <Route path="/profile" element={<ProfileForm />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/doctor/:id" element={<DoctorDetail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/doctors/:id" element={<DoctorDetail />} />
                  <Route path="/notifications" element={<NotificationsPage />} />

                  <Route path="/change-password/:accountId" element={<ChangePassword />} />
                  <Route path="/confirmation" element={<ConfirmationPage />} />
                  <Route path="/vaccine-history" element={<VaccineHistory />} />
                  <Route path="/payment/:vaccineAppointmentId" element={<PaymentPage />} />
                  <Route path="/paymentpage" element={<PaymentPage />} />
                  <Route path="/vaccine-detail/:vaccineId" element={<VaccineDetail />} />
                  <Route
                    path="/appointment-history"
                    element={<AppointmentHistory />}
                  />{" "}
                  <Route path="/" element={<Home onOpenModal={() => setIsModalOpen(true)} />} />
                </Routes>
              </main>
              {!isDoctorRoute && <ChatButton />} {/* Exclude Footer for doctor route */}
              <Footer />
            </div>
          }
        />
      </Routes>
    </>
  );
}

function Home({ onOpenModal }) {
  const location = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");

  useEffect(() => {
    if (location.pathname === '/home' || location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Xử lý thông báo thành công khi thêm bé mới
    if (location.state?.newPatient) {
      setNewPatientName(location.state.newPatient.fullName);
      setShowSuccessMessage(true);
      
      // Tự động ẩn thông báo sau 5 giây
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        setNewPatientName("");
      }, 5000);

      // Clear state để tránh hiển thị lại khi refresh
      window.history.replaceState({}, document.title);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold">Thành công!</p>
              <p>Đã thêm bé <span className="font-bold">{newPatientName}</span> vào hệ thống.</p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-4 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Hero onOpenModal={onOpenModal} />
      <div id="services" className="min-h-screen">
        <Services />
      </div>
      <WhyChooseUs />
      <div id="team" className="min-h-screen" style={{ marginBottom: '-100px', marginTop: '140px' }}>
        <Team />
      </div>
      <div id="news" className="min-h-screen">
        <HealthNewsWebsite />
      </div>
      <Testimonials />
      <div id="contact" className="min-h-screen">
        <Contact onOpenModal={onOpenModal} />
      </div>

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px) translateX(-50%); }
          to { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
        .animate-slide-down { animation: slide-down 0.4s ease-out; }
      `}</style>
    </>
  );
}

export default App;