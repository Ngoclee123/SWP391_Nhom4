function WhyChooseUs() {
  return (
    <section id="why-us" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Vì sao chọn KidsCare?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start">
            <div className="text-4xl mr-4">🏥</div>
            <div>
              <h3 className="text-xl font-semibold text-blue-600">Đội ngũ chuyên gia</h3>
              <p className="text-gray-600">Bác sĩ nhi khoa giàu kinh nghiệm, tận tâm với trẻ nhỏ.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="text-4xl mr-4">⚡</div>
            <div>
              <h3 className="text-xl font-semibold text-blue-600">Dịch vụ nhanh chóng</h3>
              <p className="text-gray-600">Đặt lịch dễ dàng, tư vấn tức thì, tiết kiệm thời gian.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="text-4xl mr-4">🔒</div>
            <div>
              <h3 className="text-xl font-semibold text-blue-600">An toàn & Bảo mật</h3>
              <p className="text-gray-600">Thông tin y tế được bảo vệ với công nghệ hiện đại.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="text-4xl mr-4">🌟</div>
            <div>
              <h3 className="text-xl font-semibold text-blue-600">Chăm sóc toàn diện</h3>
              <p className="text-gray-600">Từ khám bệnh đến theo dõi sức khỏe lâu dài.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;