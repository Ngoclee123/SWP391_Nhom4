function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">KidsCare</h3>
            <p>Hệ thống chăm sóc sức khỏe trẻ em trực tuyến hàng đầu tại Việt Nam.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-blue-200">Khám nhi khoa</a></li>
              <li><a href="#services" className="hover:text-blue-200">Tư vấn trực tuyến</a></li>
              <li><a href="#services" className="hover:text-blue-200">Tiêm phòng</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><a href="#why-us" className="hover:text-blue-200">Vì sao chọn chúng tôi</a></li>
              <li><a href="#team" className="hover:text-blue-200">Đội ngũ</a></li>
              <li><a href="#news" className="hover:text-blue-200">Tin tức</a></li>
              <li><a href="#testimonials" className="hover:text-blue-200">Cảm nhận</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Liên hệ</h3>
            <p>Email: support@kidscare.vn</p>
            <p>Hotline: 1900 1234</p>
            <p>Địa chỉ: 123 Đường Sức Khỏe, TP. Hồ Chí Minh</p>
          </div>
        </div>
        <p className="text-center mt-8">© 2025 KidsCare. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;