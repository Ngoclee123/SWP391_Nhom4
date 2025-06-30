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
import DoctorDetail from './components/booking/DoctorDetail';
import Reception from './components/doctor/Reception';
import BookingConfirmation from './components/booking/BookingConfirmation';
import Login from './components/login/Login';
import ChangePassword from './components/ChangePassword';
import VaccineAppointment from './components/vacin/VaccineAppointment';
import VaccinesList from './components/vacin/VaccinesList';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ChatButton from './components/ChatButton';



function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdminRoute = window.location.pathname.startsWith('/admin-dashboard');
  const isRecepRoute = window.location.pathname.startsWith('/reception');
  const isDoctorRoute = window.location.pathname.startsWith('/doctor-dashboard'); // Check for doctor route

  return (
    <Router>
      <Routes>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} /> {/* Add DoctorDashboard route */}


        {/* Routes with shared layout (Header/Footer) */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col bg-gray-100">
              {!isAdminRoute && !isRecepRoute && !isDoctorRoute && <Header />} {/* Exclude Header for doctor route */}

              <main className="flex-grow">
                <Routes>
                  <Route path="/vaccines" element={<VaccinesList />} />
                  <Route path="/vaccines/:vaccineId" element={<VaccineAppointment />} />
                  <Route path="/home" element={<Home onOpenModal={() => setIsModalOpen(true)} />} />
                  <Route path="/search-doctors" element={<DoctorSearch />} />
                  <Route path="/book-appointment" element={<AppointmentForm />} />
                  <Route path="/profile" element={<ProfileForm />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/doctor/:id" element={<DoctorDetail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                  <Route path="/change-password/:accountId" element={<ChangePassword />} />
                  <Route path="/" element={<Home onOpenModal={() => setIsModalOpen(true)} />} />
                </Routes>
              </main>

              {!isAdminRoute && !isRecepRoute && !isDoctorRoute && <Footer />} 
               {!isAdminRoute && !isRecepRoute && !isDoctorRoute && <ChatButton />} {/* Exclude Footer for doctor route */}
            </div>
          }
        />
      </Routes>
    </Router>
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