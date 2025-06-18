import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ProfileForm from './components/ProfileForm';
import DoctorSearch from './components/DoctorSearch';
import AppointmentForm from './components/booking/AppointmentForm';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Team from './components/Team';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';

import Register from './components/regiters/Register';
import HealthNewsWebsite, { ArticleDetail } from './components/NewHeath';
import AdminDashboards from './components/admin/AdminDashboard';
import DoctorDetail from './components/booking/DoctorDetail';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import BookingConfirmation from './components/booking/BookingConfirmation';
import Login from './components/login/Login';
import ChangePassword from './components/ChangePassword';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isDoctorRoute = window.location.pathname.startsWith('/doctor');

  return (
    <Router>
      <Routes>
        <Route
          path="/news/article/:id"
          element={<ArticleDetail />}
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col bg-gray-100">
              {!isAdminRoute || isDoctorRoute && <Header /> }
             
              <main className="flex-grow">
                <Routes>
                  <Route path="/home" element={<Home onOpenModal={() => setIsModalOpen(true)} />} />
                  <Route path="/search-doctors" element={<DoctorSearch />} />
                  <Route path="/book-appointment" element={<AppointmentForm />} />
                  <Route path="/profile" element={<ProfileForm />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                    <Route path="/admin1" element={<AdminDashboards />} />
                    <Route path="/doctor/:id" element={<DoctorDetail />} />{" "}
                    <Route path="/doctorDashboard" element={<DoctorDashboard/>} />
                      <Route
                                  path="/booking-confirmation"
                                  element={<BookingConfirmation />}
                                />
                                <Route path="/change-password/:accountId" element={<ChangePassword />} />
                  <Route path="/" element={<Home onOpenModal={() => setIsModalOpen(true)} />} />
                    
                </Routes>
              </main>
              {!isAdminRoute || isDoctorRoute && <Footer />}
           
              
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
    // Cuộn về đầu trang khi vào /home hoặc /
    if (location.pathname === '/home' || location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Cuộn đến section nếu có hash trong URL
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