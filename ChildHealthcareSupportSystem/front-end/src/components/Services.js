import React from 'react';
import { useNavigate } from 'react-router-dom';

function ServiceCard({ title, description, icon, image, onClick }) {
  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Space') {
          onClick();
        }
      }}
    >
      <div className="relative group mb-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <img src={image} alt={title} className="relative h-64 w-full object-cover rounded-2xl shadow-md" />
      </div>
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-4">
        <span className="text-2xl text-white">{icon}</span>
      </div>
      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Services() {
  const navigate = useNavigate();

  return (
    <section id="services" className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
       <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">
        Dịch vụ nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ServiceCard
            title="Khám nhi khoa"
            description="Khám sức khỏe định kỳ với bác sĩ chuyên khoa nhi tận tâm."
            icon="🩺"
            image="/images/kham-nhi-khoa.jpg"
            onClick={() => {}}
          />
          <ServiceCard
            title="Tư vấn trực tuyến"
            description="Tư vấn sức khỏe qua video call, tiện lợi và an toàn."
            icon="💻"
            image="/images/tu-van.jpg"
            onClick={() => {}}
          />
          <ServiceCard
            title="Tiêm phòng"
            description="Lịch tiêm chủng đầy đủ, nhắc nhở thông minh cho bé."
            icon="💉"
            image="https://medlatec.vn/media/2594/content/20230208_mui-tiem-phong-mo-rong-5.jpg"

            onClick={() => navigate('/vaccines')}
          />
        </div>
      </div>
    </section>
  );
}

export default Services;