function Footer() {
  return (
    <footer className="bg-blue-400 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Slogan Section with Background Image */}
        <div
          className="relative bg-cover bg-center py-6 mb-8 rounded-lg"
          style={{
            backgroundImage: "url('/images/footer.jpg')", // Replace with your image path
            backgroundColor: "rgba(104, 145, 157, 0.8)", // Fallback color with opacity
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              Sức khỏe của bé là ưu tiên hàng đầu của chúng tôi!
            </h2>
            <p className="mt-2">Phương thức đặt lịch khám tiện lợi</p>

            <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg">
              Giảm 15% cho lần khám đầu tiên
            </button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">P-CLINIC</h3>
            <p>Phòng khám tư nhân chuyên về dịch vụ khám chữa bệnh cho trẻ em tại Quận Bình Thạnh, TP.HCM.</p>
            <p className="mt-4">
              Địa chỉ: 236/29/18 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP.HCM
            </p>
            <p>Website: pclinic.com.vn</p>
            <p>Email: support@pclinic.com.vn</p>
            <p>Hotline: 028 710 78098</p>
            {/* Social Media Icons */}
            <div className="flex space-x-4 mt-4">
              <a href="https://zalo.me" target="_blank" rel="noopener noreferrer">
                <img
                  src="/path/to/zalo-icon.png" // Replace with your Zalo icon path
                  alt="Zalo"
                  className="w-6 h-6"
                />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <img
                  src="/path/to/facebook-icon.png" // Replace with your Facebook icon path
                  alt="Facebook"
                  className="w-6 h-6"
                />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-blue-200">Đặt khám tại chỗ</a></li>
              <li><a href="#services" className="hover:text-blue-200">Đặt khám theo bác sĩ</a></li>
              <li><a href="#services" className="hover:text-blue-200">Tư vấn sức khỏe qua video</a></li>
              <li><a href="#services" className="hover:text-blue-200">Y tế tại nhà</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Trợ giúp</h3>
            <ul className="space-y-2">
              <li><a href="#help" className="hover:text-blue-200">Hướng dẫn đặt lịch</a></li>
              <li><a href="#help" className="hover:text-blue-200">Hướng dẫn hủy lịch</a></li>
              <li><a href="#help" className="hover:text-blue-200">Quy trình khám bệnh</a></li>
              <li><a href="#help" className="hover:text-blue-200">Các câu hỏi thường gặp</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Hợp tác</h3>
            <ul className="space-y-2">
              <li><a href="#faq" className="hover:text-blue-200">Khám sức khỏe chuyên khoa</a></li>
              <li><a href="#faq" className="hover:text-blue-200">Tư vấn tuyển dụng</a></li>
              <li><a href="#faq" className="hover:text-blue-200">Bái báo y tế</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <p className="text-center mt-8">Bản quyền thuộc về Công Ty TNHH Baby Health hub © 2025, ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  );
}

export default Footer;