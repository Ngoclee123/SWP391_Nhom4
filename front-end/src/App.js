import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import ProfileForm from './components/ProfileForm';
import DoctorSearch from './components/DoctorSearch';
import AppointmentForm from './components/AppointmentForm';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/search-doctors" element={<DoctorSearch />} />
                  <Route path="/book-appointment" element={<AppointmentForm />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;