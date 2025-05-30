function ServiceCard({ title, description, icon, image }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
      <img src={image} alt={title} className="h-64 mx-auto mb-4 rounded" />
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-blue-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Services() {
  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Dịch vụ nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceCard
            title="Khám nhi khoa"
            description="Khám sức khỏe định kỳ với bác sĩ chuyên khoa nhi tận tâm."
            icon="🩺"
            image="/images/kham-nhi-khoa.jpg"
          />
          <ServiceCard
            title="Tư vấn trực tuyến"
            description="Tư vấn sức khỏe qua video call, tiện lợi và an toàn."
            icon="💻"
            image="/images/tu-van.jpg"
          />
          <ServiceCard
            title="Tiêm phòng"
            description="Lịch tiêm chủng đầy đủ, nhắc nhở thông minh cho bé."
            icon="💉"
            image="/images/vacin.jpg"
          />
        </div>
      </div>
    </section>
  );
}

export default Services;