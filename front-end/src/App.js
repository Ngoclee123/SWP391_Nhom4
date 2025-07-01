import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
import DoctorDetail from './components/booking/DoctorDetail';
import { ReceiptCent } from 'lucide-react';
import Reception from './components/doctor/Reception';
import BookingConfirmation from './components/booking/BookingConfirmation';
import Login from './components/login/Login';
import ChangePassword from './components/ChangePassword';
import VaccineAppointment from './components/vacin/VaccineAppointment';
import VaccinesList from './components/vacin/VaccinesList';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AddPatientPage from './components/vacin/AddPatientPage';
import { handleOAuthRedirect } from './api/axiosClient'; // Import hàm từ axiosClient
import ConfirmationPage from './components/vacin/ConfirmationPage';
import VaccineHistory from './components/vacin/VaccineHistory';
import PaymentPage from './components/vnpVaccin/PaymentPage';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if ((location.pathname === '/home' || location.pathname === '/') && location.search) {
      handleOAuthRedirect();
    }
  }, [location]);

  return (
    <Routes>
      {/* Route riêng cho admin-dashboard, không bọc layout chung */}
      <Route path="/admin-dashboard" element={<AdminDashboards />} />
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
                <Route path="/home" element={<Home onOpenModal={() => setIsModalOpen(true)} />} />
                <Route path="/search-doctors" element={<DoctorSearch />} />
                <Route path="/book-appointment" element={<AppointmentForm />} />
                <Route path="/profile" element={<ProfileForm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/doctor/:id" element={<DoctorDetail />} />
                <Route path="/reception" element={<Reception />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/change-password/:accountId" element={<ChangePassword />} />
                <Route path="/confirmation" element={<ConfirmationPage />} />
                <Route path="/vaccine-history" element={<VaccineHistory />} />
                <Route path="/payment/:vaccineAppointmentId" element={<PaymentPage />} />
                <Route path="/paymentpage" element={<PaymentPage />} />
                <Route path="/" element={<Home onOpenModal={() => setIsModalOpen(true)} />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}

function Home({ onOpenModal }) {
  const location = useLocation();

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
  }, [location]);

  return (
    <>
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
    </>
  );
}

export default App;