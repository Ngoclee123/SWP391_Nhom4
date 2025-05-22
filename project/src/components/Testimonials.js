function TestimonialCard({ name, feedback, image }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
      <img src={image} alt={name} className="h-16 w-16 rounded-full mx-auto mb-4" />
      <p className="text-gray-600 italic mb-4">"{feedback}"</p>
      <h3 className="text-lg font-semibold text-blue-800">{name}</h3>
    </div>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Cảm nhận từ khách hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TestimonialCard
            name="Nguyễn Thị Mai"
            feedback="Dịch vụ tư vấn trực tuyến rất tiện lợi, bác sĩ nhiệt tình và chu đáo!"
            image="https://via.placeholder.com/100?text=Khách+Hàng+1"
          />
          <TestimonialCard
            name="Trần Văn Hùng"
            feedback="Hệ thống đặt lịch dễ sử dụng, tôi đã đặt lịch tiêm phòng cho con rất nhanh."
            image="https://via.placeholder.com/100?text=Khách+Hàng+2"
          />
          <TestimonialCard
            name="Lê Thị Hồng"
            feedback="KidsCare giúp tôi theo dõi sức khỏe con mình một cách khoa học."
            image="https://via.placeholder.com/100?text=Khách+Hàng+3"
          />
        </div>
      </div>
    </section>
  );
}

export default Testimonials;