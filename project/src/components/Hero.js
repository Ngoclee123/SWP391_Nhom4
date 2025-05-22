function Hero({ onOpenModal }) {
  return (
    <section id="home" className="bg-blue-50 py-20 min-h-screen flex items-center">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">Chăm sóc sức khỏe trẻ em toàn diện</h1>
          <p className="text-lg text-gray-700 mb-6">
            Đặt lịch khám, tư vấn trực tuyến và theo dõi sức khỏe bé yêu với đội ngũ bác sĩ nhi khoa hàng đầu.
          </p>
          <button onClick={onOpenModal} className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300">
            Đặt lịch ngay
          </button>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0">
          <img
            src="/images/banner.jpg"
            // alt="Trẻ em khỏe mạnh"
            className="rounded-lg shadow-md w-full"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;