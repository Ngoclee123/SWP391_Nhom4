import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Team from './components/Team';
import News from './components/News';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import Login from './components/Login'; // Component Login
import Register from './components/Register'; // Component Register
import './App.css';

// Component Home chứa tất cả các section hiện tại
function Home({ onOpenModal }) {
  return (
    <>
      <Hero onOpenModal={onOpenModal} />
      <Services />
      <WhyChooseUs />
      <Team />
      <News />
      <Testimonials />
      <Contact onOpenModal={onOpenModal} />
    </>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home onOpenModal={() => setIsModalOpen(true)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Footer />
        <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </Router>
  );
}

export default App;