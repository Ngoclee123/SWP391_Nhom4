import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentService from "../../service/AppointmentService";

const DoctorSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await AppointmentService.getSpecialties();
        setSpecialties(response.data);
      } catch (err) {
        console.error("Error fetching specialties:", err);
        setError("Không thể tải danh sách chuyên khoa");
      }
    };

    fetchSpecialties();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await AppointmentService.searchDoctors({
        name: searchTerm,
        specialty: specialty,
      });
      setDoctors(response.data);
    } catch (err) {
      console.error("Error searching doctors:", err);
      setError("Không thể tìm kiếm bác sĩ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tìm kiếm bác sĩ
        </h1>
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tên bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded-lg min-w-[200px]"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="p-2 border rounded-lg min-w-[200px]"
          >
            <option value="">Tất cả chuyên khoa</option>
            {specialties.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleDoctorClick(doctor.id)}
          >
            <img
              src={doctor.image || "/images/doctor-placeholder.jpg"}
              alt={doctor.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {doctor.name}
              </h2>
              <p className="text-blue-600 mb-2">{doctor.specialty}</p>
              <p className="text-gray-600 text-sm mb-4">{doctor.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-4">⭐ {doctor.rating || "N/A"}</span>
                <span>👥 {doctor.patientCount || 0} bệnh nhân</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && !loading && !error && (
        <div className="text-center text-gray-500 py-8">
          Không tìm thấy bác sĩ nào phù hợp với tiêu chí tìm kiếm
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
