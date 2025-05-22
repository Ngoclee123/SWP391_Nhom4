function NewsCard({ title, date, excerpt, image }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <img src={image} alt={title} className="h-40 w-full object-cover rounded mb-4" />
      <h3 className="text-xl font-semibold text-blue-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-2">{date}</p>
      <p className="text-gray-600 mb-4">{excerpt}</p>
      <a href="#" className="text-blue-600 hover:underline">Đọc thêm</a>
    </div>
  );
}

function News() {
  return (
    <section id="news" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Tin tức sức khỏe</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NewsCard
            title="Cách chăm sóc trẻ sơ sinh mùa đông"
            date="20/05/2025"
            excerpt="Hướng dẫn chi tiết giúp bố mẹ giữ ấm và bảo vệ sức khỏe bé trong thời tiết lạnh."
            image="https://via.placeholder.com/300x200?text=Tin+Tức+1"
          />
          <NewsCard
            title="Lợi ích của tiêm phòng đúng lịch"
            date="18/05/2025"
            excerpt="Tìm hiểu lý do tại sao tiêm phòng đúng thời điểm là quan trọng cho bé."
            image="https://via.placeholder.com/300x200?text=Tin+Tức+2"
          />
          <NewsCard
            title="Dinh dưỡng cho trẻ dưới 5 tuổi"
            date="15/05/2025"
            excerpt="Những thực phẩm cần thiết để hỗ trợ sự phát triển toàn diện của trẻ."
            image="https://via.placeholder.com/300x200?text=Tin+Tức+3"
          />
        </div>
      </div>
    </section>
  );
}

export default News;