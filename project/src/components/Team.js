function TeamMember({ name, role, image }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
      <img src={image} alt={name} className="h-32 w-32 rounded-full mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-blue-800">{name}</h3>
      <p className="text-gray-600">{role}</p>
    </div>
  );
}

function Team() {
  return (
    <section id="team" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Đội ngũ bác sĩ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TeamMember
            name="BS. Nguyễn Văn A"
            role="Chuyên gia Nhi khoa"
            image="https://via.placeholder.com/150?text=Bác+Sĩ+A"
          />
          <TeamMember
            name="BS. Trần Thị B"
            role="Chuyên gia Dinh dưỡng"
            image="https://via.placeholder.com/150?text=Bác+Sĩ+B"
          />
          <TeamMember
            name="BS. Lê Văn C"
            role="Chuyên gia Tiêm chủng"
            image="https://via.placeholder.com/150?text=Bác+Sĩ+C"
          />
        </div>
      </div>
    </section>
  );
}

export default Team;