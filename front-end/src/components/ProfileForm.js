import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfileForm() {
  const [profile, setProfile] = useState({
    accountId: 1, // Giả sử accountId = 1, thay bằng logic xác thực thực tế
    fullName: '',
    phoneNumber: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu từ backend khi component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/parents/profile/${profile.accountId}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profile.accountId]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Gửi dữ liệu cập nhật lên backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/parents/profile/${profile.accountId}`, profile);
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000); // Tự động xóa thông báo sau 3 giây
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Edit Your Profile</h2>
        {message && (
          <p className={`text-center mb-4 p-2 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={profile.phoneNumber || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={profile.address || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your address"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white p-3 rounded-lg hover:bg-secondary transition duration-300"
            disabled={loading}
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;