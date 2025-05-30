import { Link } from "react-router-dom";

function TeamMember({ id, name, role, image }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition duration-300 transform hover:scale-105">
      <img
        src={image}
        alt={name}
        className="h-32 w-32 rounded-full mx-auto mb-4 object-cover"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&size=128&background=60a5fa&color=ffffff`;
        }}
      />
      <h3 className="text-xl font-semibold text-blue-800 mb-2">{name}</h3>
      <p className="text-gray-600 mb-4">{role}</p>

      {/* Nút xem chi tiết */}
      <Link
        to={`/doctor/${id}`}
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300 font-medium"
      >
        Xem chi tiết
      </Link>
    </div>
  );
}

function Team() {
  const doctors = [
    {
      id: 1,
      name: "BS. Nguyễn Văn An",
      role: "Chuyên khoa Nhi",
      image:"https://pclinic.ohayo.io.vn/_next/image?url=https%3A%2F%2Fi.ibb.co%2FxD22n3n%2Fportrait-young-asian-male-doctor-blue-background-296537-5811.png&w=640&q=75"
    },
    {
      id: 2,
      name: "BS. Trần Thị Bình",
      role: "Chuyên gia Dinh dưỡng",
      image:"https://pclinic.ohayo.io.vn/_next/image?url=https%3A%2F%2Fi.ibb.co%2FxD22n3n%2Fportrait-young-asian-male-doctor-blue-background-296537-5811.png&w=640&q=75"
    },
    {
      id: 3,
      name: "BS. Lê Văn Cường",
      role: "Chuyên gia Tiêm chủng",
      image:"https://pclinic.ohayo.io.vn/_next/image?url=https%3A%2F%2Fi.ibb.co%2FxD22n3n%2Fportrait-young-asian-male-doctor-blue-background-296537-5811.png&w=640&q=75"
    },
  ];

  return (
    <section id="team" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4" style={{marginTop: '30px'}}>
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
          Đội ngũ bác sĩ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <TeamMember
              key={doctor.id}
              id={doctor.id}
              name={doctor.name}
              role={doctor.role}
              image={doctor.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Team;
