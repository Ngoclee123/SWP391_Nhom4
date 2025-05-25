import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DoctorSearch() {
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState({
    specialtyId: '',
    fullName: '',
    availabilityStatus: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/doctors/specialties');
        setSpecialties(response.data);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      }
    };
    fetchSpecialties();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/doctors/search', {
        params: searchCriteria
      });
      setDoctors(response.data);
      setMessage(response.data.length ? 'Search successful' : 'No doctors found');
    } catch (error) {
      console.error('Error searching doctors:', error);
      setMessage('Failed to search doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria({ ...searchCriteria, [name]: value });
  };

  const handleBookNow = (doctor) => {
    navigate('/book-appointment', { state: { doctor } });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Search Doctors</h2>
        {message && (
          <p className={`text-center mb-4 p-2 rounded ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Specialty</label>
            <select
              name="specialtyId"
              value={searchCriteria.specialtyId}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty.specialtyId} value={specialty.specialtyId}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Doctor Name</label>
            <input
              type="text"
              name="fullName"
              value={searchCriteria.fullName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter doctor name"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Availability</label>
            <select
              name="availabilityStatus"
              value={searchCriteria.availabilityStatus}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white p-3 rounded-lg hover:bg-secondary transition duration-300"
            disabled={loading}
          >
            Search
          </button>
        </form>
        {loading && <p className="text-center mt-4 text-gray-600">Searching...</p>}
        {doctors.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Doctor Results</h3>
            <ul className="space-y-4">
              {doctors.map((doctor) => (
                <li key={doctor.doctorId} className="p-4 bg-gray-50 rounded-lg shadow flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium">{doctor.fullName}</p>
                    <p className="text-gray-600">Specialty: {specialties.find(s => s.specialtyId === doctor.specialtyId)?.name || 'N/A'}</p>
                    <p className="text-gray-600">Phone: {doctor.phoneNumber || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleBookNow(doctor)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition duration-300"
                  >
                    Book Now
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorSearch;