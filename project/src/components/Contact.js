import { Link } from 'react-router-dom';
import { FaPhone, FaFacebook, FaQrcode, FaComment } from 'react-icons/fa'; // Import các icon từ react-icons
import { useNavigate } from 'react-router-dom';

function Contact({ onOpenModal }) {
  const navigate = useNavigate();

  const handleSupportClick = (type) => {
    switch (type) {
      case 'hotline':
        window.location.href = 'tel:1900 1803';
        break;
      case 'facebook':
        window.open('https://www.facebook.com/profile.php?id=61576400106229', '_blank');
        break;
      case 'zalo':
        window.open('https://zalo.me/babyhealthhub', '_blank');
        break;
      case 'chat':
        window.open('https://www.facebook.com/messages/babyhealthhub', '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <section id="contact" className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-8">CÁC HÌNH THỨC HỖ TRỢ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Tổng đài đặt lịch khám */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FaPhone className="text-blue-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-700 mb-2">Tổng đài đặt lịch khám</p>
            <p className="text-blue-600 font-semibold mb-4">1900-2115</p>
            <button
              onClick={() => handleSupportClick('hotline')}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              Bấm vào đây
            </button>
          </div>

          {/* Fanpage Facebook */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FaFacebook className="text-blue-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-700 mb-2">Fanpage Facebook</p>
            <p className="text-blue-600 font-semibold mb-4">Bấm vào đây</p>
            <button
              onClick={() => handleSupportClick('facebook')}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              Bấm vào đây
            </button>
          </div>

          {/* Hỗ trợ Zalo */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FaQrcode className="text-blue-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-700 mb-2">Hỗ trợ Zalo</p>
            <p className="text-blue-600 font-semibold mb-4">Bấm vào đây</p>
            <button
              onClick={() => handleSupportClick('zalo')}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              Bấm vào đây
            </button>
          </div>

          {/* Chat Facebook */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FaComment className="text-blue-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-700 mb-2">Chat Facebook</p>
            <p className="text-blue-600 font-semibold mb-4">Bấm vào đây</p>
            <button
              onClick={() => handleSupportClick('chat')}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              Bấm vào đây
            </button>
          </div>
        </div>

        {/* Phần thông tin bổ sung và bản đồ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Thông tin liên hệ</h3>
            <p className="text-gray-700 mb-4">Hãy để chúng tôi hỗ trợ bạn chăm sóc sức khỏe bé yêu!</p>
            <p className="text-gray-600 mb-2"><strong>Email:</strong> support@kidscare.vn</p>
            <p className="text-gray-600 mb-2"><strong>Hotline:</strong> 1900 1234, 19001803</p>
            <p className="text-gray-600 mb-4"><strong>Địa chỉ:</strong> 123 Đường Sức Khỏe, TP. Hồ Chí Minh</p>
            <button onClick={onOpenModal} className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 mt-4">
              Đặt lịch tư vấn
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Bản đồ</h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.630770689936!2d106.68028741462194!3d10.762622992319947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f8e132c7%3A0x18c8d1e0e3c2b2b!2sHo%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1698765432109!5m2!1sen!2s"
              className="w-full h-64 rounded-lg shadow-md"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;