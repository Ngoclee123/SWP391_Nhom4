import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DoctorDetailService from "../service/DoctorDetailService";

function TeamMember({ id, name, role, image }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300 transform hover:scale-105">
      <img
        src={
          image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&size=128&background=60a5fa&color=ffffff`
        }
        alt={name}
        className="h-32 w-32 rounded-full mx-auto mb-4 object-cover"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&size=128&background=60a5fa&color=ffffff`;
        }}
      />
      <h3 className="text-xl font-semibold text-blue-800 mb-2">{name}</h3>
      <p className="text-gray-600 mb-4">{role || "Bác sĩ"}</p>

      {/* Nút xem chi tiết */}
      <Link
        to={`/doctors/${id}`}
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300 font-medium"
      >
        Xem chi tiết
      </Link>
    </div>
  );
}

function Team() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        setMessage(null);

        console.log("Fetching doctors...");
        const response = await DoctorDetailService.getAllDoctors();
        console.log("Doctors response:", response);

        if (response.error) {
          console.error("Error from API:", response.error);
          setError(response.error);
          setDoctors([]);
          return;
        }

        const doctorsArray = response.data?.data;
        if (!doctorsArray || !Array.isArray(doctorsArray)) {
          console.error("Invalid response format:", response);
          setError("Định dạng dữ liệu không hợp lệ");
          setDoctors([]);
          return;
        }

        setDoctors(doctorsArray);

        if (response.message) {
          setMessage(response.message);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err.message || "Không thể tải danh sách bác sĩ");
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <section id="team" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
            Đội ngũ bác sĩ
          </h2>
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="team" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4" style={{ marginTop: "30px" }}>
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
          Đội ngũ bác sĩ
        </h2>

        {error ? (
          <div className="text-center text-red-600 p-4 rounded-lg bg-red-50 mb-8">
            {error}
          </div>
        ) : message ? (
          <div className="text-center text-gray-600 p-4 rounded-lg bg-gray-50 mb-8">
            {message}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center text-gray-600 p-4 rounded-lg bg-gray-50 mb-8">
            Chưa có bác sĩ nào trong danh sách
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <TeamMember
                key={doctor.id}
                id={doctor.id}
                name={doctor.fullName}
                role={doctor.specialtyName}
                image={doctor.imgs}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Team;